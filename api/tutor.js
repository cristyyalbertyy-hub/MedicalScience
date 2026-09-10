import { parseJsonBody } from "./_lib/request.js";
import { applyStudio9Cors, handleStudio9CorsPreflight } from "./_lib/cors.js";
import {
  buildUserPrompt,
  generateTutorReply,
  isTutorMode,
  normalizeTutorLang,
  pauseMessage,
  resolveTutorAccess,
  consumeTutorFairUse,
  tutorTopicContext,
  TUTOR_SYSTEM_PROMPT,
} from "./_lib/tutor.js";
import { TUTOR_PACKAGE_ID } from "./_lib/tutor-prompt.js";
import { getAuth } from "./_lib/firebase.js";

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

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }

  const email = decoded.email ?? null;
  const lang = normalizeTutorLang(body.lang);
  const access = await resolveTutorAccess({ uid: decoded.uid, email });
  if (!access.enabled) {
    return res.status(200).json({ ok: true, enabled: false });
  }

  const mode = String(body.mode ?? "").trim();
  if (!mode) {
    return res.status(200).json({ ok: true, enabled: true });
  }

  if (!isTutorMode(mode)) {
    return res.status(400).json({ error: "Unknown mode" });
  }

  const packageId = String(body.package_id ?? TUTOR_PACKAGE_ID);
  if (packageId !== TUTOR_PACKAGE_ID) {
    return res.status(400).json({ error: "Tutor is only available in Medical Biology for now." });
  }

  const topic = tutorTopicContext(String(body.topic_id ?? ""));
  if (!topic) {
    return res.status(400).json({ error: "Unknown topic" });
  }

  const fair = await consumeTutorFairUse(decoded.uid);
  if (!fair.ok) {
    return res.status(429).json({
      ok: false,
      paused: true,
      text: pauseMessage(lang),
    });
  }

  const message = String(body.message ?? "").trim().slice(0, 2000);
  const history = Array.isArray(body.history) ? body.history : [];
  const userText = buildUserPrompt({ mode, lang, topic, message, history });

  try {
    const text = await generateTutorReply({
      system: TUTOR_SYSTEM_PROMPT,
      userText,
    });
    return res.status(200).json({
      ok: true,
      enabled: true,
      mode,
      topic_id: topic.id,
      text,
    });
  } catch (err) {
    console.error("tutor", err);
    return res.status(503).json({
      error: pauseMessage(lang),
    });
  }
}
