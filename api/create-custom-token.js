import { getAuth } from "./_lib/firebase.js";
import { listActiveEntitlements } from "./_lib/entitlements.js";
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
    const packageIds = await listActiveEntitlements(
      decoded.uid,
      decoded.email ?? null,
    );
    const customToken = await getAuth().createCustomToken(decoded.uid, {
      studio9_packages: packageIds,
    });
    return res.status(200).json({
      ok: true,
      custom_token: customToken,
      uid: decoded.uid,
      email: decoded.email ?? null,
      package_ids: packageIds,
    });
  } catch (err) {
    console.error("create-custom-token", err);
    return res.status(401).json({
      error: err instanceof Error ? err.message : "Invalid session",
    });
  }
}
