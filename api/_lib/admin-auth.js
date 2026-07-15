import { parseJsonBody } from "./request.js";

export function getAdminSecret() {
  return process.env.ADMIN_GRANT_SECRET?.trim() || "";
}

export function isAdminConfigured() {
  return Boolean(getAdminSecret());
}

export function readAdminSecretFromRequest(req) {
  const body = parseJsonBody(req);
  return String(body.secret ?? "").trim();
}

export function assertAdminSecret(req, res) {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    res.status(503).json({ error: "Admin tools are not configured." });
    return false;
  }

  const provided = readAdminSecretFromRequest(req);
  if (provided !== adminSecret) {
    res.status(401).json({ error: "Invalid admin secret." });
    return false;
  }

  return true;
}
