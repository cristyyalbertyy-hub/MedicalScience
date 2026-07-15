import { assertAdminSecret } from "./_lib/admin-auth.js";
import { collectAdminStats } from "./_lib/stats.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!assertAdminSecret(req, res)) return;

  try {
    const stats = await collectAdminStats();
    return res.status(200).json(stats);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load stats.";
    return res.status(500).json({ error: message });
  }
}
