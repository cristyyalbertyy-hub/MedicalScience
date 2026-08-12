import { parseJsonBody } from "./_lib/request.js";
import { applyStudio9Cors, handleStudio9CorsPreflight } from "./_lib/cors.js";
import {
  verifyIdToken,
  userCanPlayPackage,
  submitSnapScore,
  getSnapLeaderboard,
  sanitizeNickname,
} from "./_lib/snap.js";

const ALLOWED_PACKAGES = new Set(["genetics"]);

export default async function handler(req, res) {
  if (handleStudio9CorsPreflight(req, res)) return;
  applyStudio9Cors(req, res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = parseJsonBody(req);
  const idToken = String(body.id_token ?? "");
  const action = String(body.action ?? "board").trim();
  const packageId = String(body.package_id ?? "genetics").trim();

  if (!idToken) {
    return res.status(400).json({ error: "Missing id_token" });
  }
  if (!ALLOWED_PACKAGES.has(packageId)) {
    return res.status(400).json({ error: "Package not available for Snap yet." });
  }

  try {
    const decoded = await verifyIdToken(idToken);
    const email = decoded.email ?? null;
    const access = await userCanPlayPackage(decoded.uid, email, packageId);

    if (action === "access") {
      return res.status(200).json({
        ok: true,
        allowed: access.allowed,
        via: access.via,
        pass: access.pass,
        package_id: packageId,
      });
    }

    if (!access.allowed) {
      return res.status(403).json({
        error: "Snap requires an active Studio9 Pass or this package.",
        allowed: false,
      });
    }

    if (action === "board") {
      const leaderboard = await getSnapLeaderboard(packageId, decoded.uid);
      return res.status(200).json({ ok: true, allowed: true, via: access.via, ...leaderboard });
    }

    if (action === "submit") {
      const score = Number(body.score);
      const nickname = sanitizeNickname(body.nickname || email?.split("@")[0] || "Player");
      if (!Number.isFinite(score)) {
        return res.status(400).json({ error: "Invalid score" });
      }
      const leaderboard = await submitSnapScore({
        userId: decoded.uid,
        email,
        packageId,
        nickname,
        score,
      });
      return res.status(200).json({ ok: true, allowed: true, via: access.via, ...leaderboard });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error("snap-leaderboard", err);
    const message = err instanceof Error ? err.message : "Snap API failed";
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
