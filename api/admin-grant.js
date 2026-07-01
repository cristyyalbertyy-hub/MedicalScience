import {
  allPaidPackageIds,
  getCatalog,
  isFreePackageId,
  isPaidPackageId,
} from "./_lib/catalog.js";
import {
  getOrCreateUserByEmail,
  grantEntitlements,
  logAdminGrant,
} from "./_lib/entitlements.js";
import { parseJsonBody } from "./_lib/request.js";

function isValidPackageId(id) {
  return isPaidPackageId(id) || isFreePackageId(id);
}

function normalizePackageIds(raw) {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((v) => String(v).trim()).filter(Boolean))];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminSecret = process.env.ADMIN_GRANT_SECRET;
  if (!adminSecret) {
    return res.status(503).json({ error: "Admin grant is not configured." });
  }

  const body = parseJsonBody(req);
  const secret = String(body.secret ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const packageIds = normalizePackageIds(body.package_ids);
  const durationDays = Number(body.duration_days ?? 365);

  if (secret !== adminSecret) {
    return res.status(401).json({ error: "Invalid admin secret." });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email is required." });
  }

  if (!packageIds.length) {
    return res.status(400).json({ error: "Select at least one package." });
  }

  for (const id of packageIds) {
    if (!isValidPackageId(id)) {
      return res.status(400).json({ error: `Unknown package_id: ${id}` });
    }
  }

  if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 3650) {
    return res.status(400).json({ error: "duration_days must be between 1 and 3650." });
  }

  try {
    const user = await getOrCreateUserByEmail(email);
    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + durationDays);

    await grantEntitlements({
      userId: user.uid,
      packageIds,
      expiresAt,
      email,
      plan: "admin_grant",
      source: "admin_grant",
    });

    await logAdminGrant({
      email,
      user_id: user.uid,
      package_ids: packageIds,
      expires_at: expiresAt.toISOString(),
      duration_days: durationDays,
    });

    return res.status(200).json({
      ok: true,
      email,
      user_id: user.uid,
      package_ids: packageIds,
      expires_at: expiresAt.toISOString(),
      paid_count: getCatalog().paidPackageIds.length,
    });
  } catch (err) {
    console.error("admin-grant", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Grant failed",
    });
  }
}
