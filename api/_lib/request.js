export function parseJsonBody(req) {
  const raw = req.body;
  if (raw == null || raw === "") return {};
  if (typeof raw === "object" && !Buffer.isBuffer(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}
