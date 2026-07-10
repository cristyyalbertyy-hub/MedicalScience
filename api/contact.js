import { parseJsonBody } from "./_lib/request.js";

const CONTACT_EMAIL = "studio9.alex@gmail.com";
const DEFAULT_SITE_ORIGIN = "https://medical-science-lilac.vercel.app";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function siteOriginFromRequest(req) {
  const origin = String(req.headers.origin ?? "").trim();
  if (origin.startsWith("http://") || origin.startsWith("https://")) return origin;

  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").trim();
  if (!host) return DEFAULT_SITE_ORIGIN;

  const proto = String(req.headers["x-forwarded-proto"] ?? "https").trim();
  return `${proto}://${host}`;
}

function isFormSubmitSuccess(data) {
  return data?.success === true || data?.success === "true";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = parseJsonBody(req);
  if (body._honey) {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const topic = String(body.topic ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (message.length > 8000) {
    return res.status(400).json({ error: "Message too long" });
  }

  const siteOrigin = siteOriginFromRequest(req);
  const referer = String(req.headers.referer ?? "").trim() || `${siteOrigin}/contacto/`;

  try {
    const upstream = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: siteOrigin,
        Referer: referer,
      },
      body: JSON.stringify({
        name,
        email,
        topic,
        message,
        _subject: `Studio9 — ${topic}`,
        _replyto: email,
        _template: "table",
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (upstream.ok && isFormSubmitSuccess(data)) {
      return res.status(200).json({ ok: true });
    }

    console.error("contact", upstream.status, data);
    return res.status(502).json({
      error: "Could not send message",
      detail: typeof data?.message === "string" ? data.message : undefined,
    });
  } catch (err) {
    console.error("contact", err);
    return res.status(500).json({ error: "Could not send message" });
  }
}
