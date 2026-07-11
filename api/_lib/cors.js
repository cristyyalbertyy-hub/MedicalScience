/** Allow package apps and Progress to call entitlement APIs from the browser. */
const ALLOWED_ORIGIN =
  /^https:\/\/progress(-[a-z0-9-]+)?\.vercel\.app$|^https:\/\/medica-genetics\.vercel\.app$|^https:\/\/biology-genetics\.vercel\.app$|^https:\/\/studio9medical\.com$|^https:\/\/www\.studio9medical\.com$|^http:\/\/localhost(:\d+)?$/;

export function applyStudio9Cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGIN.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/** @returns {boolean} true if OPTIONS preflight was handled */
export function handleStudio9CorsPreflight(req, res) {
  applyStudio9Cors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
