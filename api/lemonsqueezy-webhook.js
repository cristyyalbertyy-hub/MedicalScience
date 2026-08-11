import { resolvePackageIds, expiresAtForPlan } from "./_lib/catalog.js";
import {
  getOrCreateUserByEmail,
  grantEntitlements,
  isOrderProcessed,
  markOrderProcessed,
} from "./_lib/entitlements.js";
import {
  parseOrderEvent,
  parseSubscriptionEvent,
  verifySignature,
} from "./_lib/lemonsqueezy.js";

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

async function processGrant({ email, orderId, plan, packageIds }) {
  if (await isOrderProcessed(orderId)) {
    return { ok: true, duplicate: true };
  }

  const resolvedIds = resolvePackageIds(plan, packageIds);
  const expiresAt = expiresAtForPlan(plan);
  const user = await getOrCreateUserByEmail(email);

  await grantEntitlements({
    userId: user.uid,
    packageIds: resolvedIds,
    expiresAt,
    orderId,
    plan,
    email,
  });

  await markOrderProcessed(orderId, {
    email,
    plan,
    package_ids: resolvedIds,
    user_id: user.uid,
  });

  return {
    ok: true,
    user_id: user.uid,
    package_ids: resolvedIds,
    expires_at: expiresAt.toISOString(),
  };
}

async function processSubscriptionEnd({ email, orderId, plan }) {
  if (await isOrderProcessed(orderId)) {
    return { ok: true, duplicate: true };
  }

  const resolvedIds = resolvePackageIds(plan, "");
  const expiresAt = new Date();
  const user = await getOrCreateUserByEmail(email);

  await grantEntitlements({
    userId: user.uid,
    packageIds: resolvedIds,
    expiresAt,
    orderId,
    plan,
    email,
  });

  await markOrderProcessed(orderId, {
    email,
    plan,
    package_ids: resolvedIds,
    user_id: user.uid,
    ended: true,
  });

  return {
    ok: true,
    ended: true,
    user_id: user.uid,
    package_ids: resolvedIds,
    expires_at: expiresAt.toISOString(),
  };
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

  const orderEvent = parseOrderEvent(body);
  const subscriptionEvent = parseSubscriptionEvent(body);
  const event = orderEvent.handled
    ? orderEvent
    : subscriptionEvent.handled
      ? subscriptionEvent
      : { handled: false, eventName: orderEvent.eventName };

  if (!event.handled) {
    return res.status(200).json({ ok: true, skipped: event.eventName });
  }

  if (!event.email) {
    return res.status(400).json({ error: "Missing customer email" });
  }

  if (!event.orderId) {
    return res.status(400).json({ error: "Missing order id" });
  }

  try {
    if (event.endsAccess) {
      const result = await processSubscriptionEnd({
        email: event.email,
        orderId: event.orderId,
        plan: event.plan,
      });
      return res.status(200).json(result);
    }

    if (event.status && event.status !== "paid" && event.status !== "active") {
      return res.status(200).json({ ok: true, skipped: "not_paid" });
    }

    const result = await processGrant({
      email: event.email,
      orderId: event.orderId,
      plan: event.plan,
      packageIds: event.packageIds,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error("lemonsqueezy-webhook", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Webhook processing failed",
    });
  }
}
