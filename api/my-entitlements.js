import { getAuth } from "./_lib/firebase.js";
import {
  listActiveEntitlements,
  getActivePassForUser,
} from "./_lib/entitlements.js";
import { parseJsonBody } from "./_lib/request.js";
import { applyStudio9Cors, handleStudio9CorsPreflight } from "./_lib/cors.js";

export default async function handler(req, res) {
  if (handleStudio9CorsPreflight(req, res)) return;
  applyStudio9Cors(req, res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = parseJsonBody(req);
  const idToken = String(body.id_token ?? "");
  if (!idToken) {
    return res.status(400).json({ error: "Missing id_token" });
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const email = decoded.email ?? null;
    const [packageIds, pass] = await Promise.all([
      listActiveEntitlements(decoded.uid, email),
      getActivePassForUser(decoded.uid, email),
    ]);
    return res.status(200).json({
      ok: true,
      user_id: decoded.uid,
      email,
      package_ids: packageIds,
      pass,
    });
  } catch (err) {
    console.error("my-entitlements", err);
    const message = err instanceof Error ? err.message : "Could not load entitlements";
    let status = 500;
    if (message.includes("FIREBASE_SERVICE_ACCOUNT_JSON")) status = 503;
    else if (
      message.includes("Decoding Firebase ID token failed") ||
      message.includes("Firebase ID token has expired") ||
      message.includes("invalid")
    ) {
      status = 401;
    }
    return res.status(status).json({ error: message });
  }
}
