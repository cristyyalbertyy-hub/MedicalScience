import { getAuth } from "./_lib/firebase.js";
import { parseJsonBody } from "./_lib/request.js";

export default async function handler(req, res) {
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
    const customToken = await getAuth().createCustomToken(decoded.uid);
    return res.status(200).json({
      ok: true,
      custom_token: customToken,
      uid: decoded.uid,
      email: decoded.email ?? null,
    });
  } catch (err) {
    console.error("create-custom-token", err);
    return res.status(401).json({
      error: err instanceof Error ? err.message : "Invalid session",
    });
  }
}
