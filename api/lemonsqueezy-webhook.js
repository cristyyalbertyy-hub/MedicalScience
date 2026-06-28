import { resolvePackageIds, expiresAtForPlan } from "./_lib/catalog.js";
import {
  getOrCreateUserByEmail,
  grantEntitlements,
  isOrderProcessed,
  markOrderProcessed,
} from "./_lib/entitlements.js";
import { parseOrderEvent, verifySignature } from "./_lib/lemonsqueezy.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch {
    return res.status(400).json({ error: "Could not read request body" });
  }

  const signature = req.headers["x-signature"];
  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  let body;
  try {
    body = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const event = parseOrderEvent(body);
  if (!event.handled) {
    return res.status(200).json({ ok: true, skipped: event.eventName });
  }

  if (!event.email) {
    return res.status(400).json({ error: "Missing customer email" });
  }

  if (!event.orderId) {
    return res.status(400).json({ error: "Missing order id" });
  }

  if (event.status && event.status !== "paid") {
    return res.status(200).json({ ok: true, skipped: "not_paid" });
  }

  try {
    if (await isOrderProcessed(event.orderId)) {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    const packageIds = resolvePackageIds(event.plan, event.packageIds);
    const expiresAt = expiresAtForPlan(event.plan);
    const user = await getOrCreateUserByEmail(event.email);

    await grantEntitlements({
      userId: user.uid,
      packageIds,
      expiresAt,
      orderId: event.orderId,
      plan: event.plan,
      email: event.email,
    });

    await markOrderProcessed(event.orderId, {
      email: event.email,
      plan: event.plan,
      package_ids: packageIds,
      user_id: user.uid,
    });

    return res.status(200).json({
      ok: true,
      user_id: user.uid,
      package_ids: packageIds,
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("lemonsqueezy-webhook", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Webhook processing failed",
    });
  }
}
