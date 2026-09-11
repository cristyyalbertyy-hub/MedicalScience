import { createRequire } from "node:module";
import { getFirestore } from "./firebase.js";
import { canonicalEmail, listActiveEntitlements } from "./entitlements.js";
import {
  TUTOR_FAIR_USE_PER_DAY,
  TUTOR_MODES,
  TUTOR_PACKAGE_ID,
  TUTOR_PAUSE_MESSAGE,
  TUTOR_PRO_PACKAGE_ID,
  TUTOR_SYSTEM_PROMPT,
} from "./tutor-prompt.js";

const require = createRequire(import.meta.url);
const progressManifest = require("../../packages/progress-manifest.json");

const LANGS = new Set(["en", "es", "fr", "it", "pt"]);

export function isTutorProGrantId(id) {
  return id === TUTOR_PRO_PACKAGE_ID;
}

function allowlistEmails() {
  return String(process.env.TUTOR_PRO_ALLOWLIST ?? "")
    .split(",")
    .map((value) => canonicalEmail(value))
    .filter(Boolean);
}

export function tutorTopicContext(topicId) {
  const topics = progressManifest?.packages?.[TUTOR_PACKAGE_ID]?.topics ?? [];
  const current = topics.find((topic) => topic.id === topicId);
  if (!current) return null;
  const siblings = topics
    .filter((topic) => {
      const chapter = String(topic.label ?? "").split(" · ")[0];
      const currentChapter = String(current.label ?? "").split(" · ")[0];
      return chapter === currentChapter;
    })
    .map((topic) => topic.label);
  return {
    id: current.id,
    label: current.label,
    chapter: String(current.label ?? "").split(" · ")[0],
    related: siblings,
  };
}

export async function resolveTutorAccess({ uid, email }) {
  const allow = allowlistEmails();
  const emailKey = email ? canonicalEmail(email) : "";
  const onAllowlist = Boolean(emailKey && allow.includes(emailKey));

  const db = getFirestore();
  const proSnap = await db.collection("entitlements").doc(`${uid}_${TUTOR_PRO_PACKAGE_ID}`).get();
  const now = Date.now();
  const hasProEntitlement =
    proSnap.exists &&
    (() => {
      const expires = new Date(proSnap.data()?.expires_at).getTime();
      return !Number.isNaN(expires) && expires > now;
    })();

  if (!onAllowlist && !hasProEntitlement) {
    return { enabled: false, reason: "not_pro" };
  }

  const packageIds = await listActiveEntitlements(uid, email);
  if (!packageIds.includes(TUTOR_PACKAGE_ID)) {
    return { enabled: false, reason: "no_module" };
  }

  return { enabled: true, reason: onAllowlist ? "allowlist" : "entitlement" };
}

export async function consumeTutorFairUse(uid) {
  const day = new Date().toISOString().slice(0, 10);
  const db = getFirestore();
  const ref = db.collection("tutor_usage").doc(`${uid}_${day}`);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? Number(snap.data()?.count ?? 0) : 0;
    if (count >= TUTOR_FAIR_USE_PER_DAY) {
      return { ok: false, count };
    }
    tx.set(
      ref,
      {
        user_id: uid,
        date: day,
        count: count + 1,
        updated_at: new Date().toISOString(),
      },
      { merge: true },
    );
    return { ok: true, count: count + 1 };
  });
}

function pauseMessage(lang) {
  return TUTOR_PAUSE_MESSAGE[lang] ?? TUTOR_PAUSE_MESSAGE.en;
}

function buildUserPrompt({ mode, lang, topic, message, history }) {
  const parts = [
    `Mode: ${mode}`,
    `Student language: ${lang}`,
    `Course: Medical Biology`,
    `Topic id: ${topic.id}`,
    `Topic: ${topic.label}`,
    `Chapter: ${topic.chapter}`,
    `Related topics in this chapter: ${topic.related.join("; ")}`,
    "Lesson media (video, podcast, quiz) is in English. Reply in the student language above. Keep English/Latin terms, then explain in that language.",
  ];
  if (Array.isArray(history) && history.length) {
    parts.push("Conversation so far:");
    for (const turn of history.slice(-12)) {
      const role = turn.role === "assistant" ? "Tutor" : "Student";
      parts.push(`${role}: ${String(turn.content ?? "").slice(0, 2000)}`);
    }
  }
  if (message) {
    parts.push(
      "The student is following up. Stay in this mode and this topic. Answer their point. Do not restart unless they ask.",
    );
    parts.push(`Student message: ${message}`);
  } else {
    parts.push("Start the requested mode for this topic now. Do not end with a question unless the mode is test_me.");
  }
  return parts.join("\n");
}

function cachedSystem(system) {
  const topics = progressManifest?.packages?.[TUTOR_PACKAGE_ID]?.topics ?? [];
  const syllabus = topics.map((topic) => `- ${topic.id}: ${topic.label}`).join("\n");
  const text = `${system}

Medical Biology syllabus (titles only; answer the current topic, not the whole list):
${syllabus}
This list is orientation. It does not replace the current topic. Stay on the requested topic and mode.`;
  return [
    {
      type: "text",
      text,
      cache_control: { type: "ephemeral", ttl: "1h" },
    },
  ];
}

async function callAnthropic({ system, userText }) {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.TUTOR_MODEL?.trim() || "claude-sonnet-4-5";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 900,
      system: cachedSystem(system),
      messages: [{ role: "user", content: userText }],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic ${response.status}`);
  }
  const text = (data.content ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Empty tutor reply");
  return text;
}

async function callOpenAi({ system, userText }) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.TUTOR_OPENAI_MODEL?.trim() || "gpt-4.1";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 900,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userText },
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI ${response.status}`);
  }
  const text = String(data.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("Empty tutor reply");
  return text;
}

export async function generateTutorReply(payload) {
  const anthropic = await callAnthropic(payload).catch((err) => {
    console.error("tutor anthropic", err);
    return null;
  });
  if (anthropic) return anthropic;
  const openai = await callOpenAi(payload).catch((err) => {
    console.error("tutor openai", err);
    return null;
  });
  if (openai) return openai;
  throw new Error("Tutor unavailable");
}

export function normalizeTutorLang(raw) {
  const lang = String(raw ?? "en").slice(0, 2).toLowerCase();
  return LANGS.has(lang) ? lang : "en";
}

export function isTutorMode(mode) {
  return TUTOR_MODES.includes(mode);
}

export { buildUserPrompt, pauseMessage, TUTOR_SYSTEM_PROMPT };
