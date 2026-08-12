import { getAuth, getFirestore } from "./firebase.js";
import { listActiveEntitlements, getActivePassForUser } from "./entitlements.js";

export function isoWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function sanitizeNickname(raw) {
  const cleaned = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24);
  return cleaned || "Player";
}

export async function userCanPlayPackage(userId, email, packageId) {
  const [packages, pass] = await Promise.all([
    listActiveEntitlements(userId, email),
    getActivePassForUser(userId, email),
  ]);
  // Snap is a Pass-only bonus (package purchase alone does not unlock the game).
  if (pass?.active) return { allowed: true, via: "pass", pass, packages };
  return { allowed: false, via: null, pass: null, packages };
}

/**
 * Upsert best weekly score and keep a compact top board on one doc.
 */
export async function submitSnapScore({
  userId,
  email,
  packageId,
  nickname,
  score,
}) {
  const db = getFirestore();
  const weekId = isoWeekId();
  const ref = db.collection("snap_weeks").doc(`${packageId}_${weekId}`);
  const safeNick = sanitizeNickname(nickname);
  const safeScore = Math.max(0, Math.min(50000, Math.round(Number(score) || 0)));
  const now = new Date().toISOString();

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : null;
    const entries = Array.isArray(data?.entries) ? [...data.entries] : [];
    const idx = entries.findIndex((e) => e.user_id === userId);
    if (idx >= 0) {
      if (safeScore > Number(entries[idx].score || 0)) {
        entries[idx] = {
          ...entries[idx],
          nickname: safeNick,
          email: email ?? null,
          score: safeScore,
          updated_at: now,
        };
      } else {
        entries[idx] = {
          ...entries[idx],
          nickname: safeNick,
          email: email ?? null,
          updated_at: now,
        };
      }
    } else {
      entries.push({
        user_id: userId,
        nickname: safeNick,
        email: email ?? null,
        score: safeScore,
        updated_at: now,
      });
    }
    entries.sort((a, b) => Number(b.score) - Number(a.score) || String(a.nickname).localeCompare(String(b.nickname)));
    tx.set(
      ref,
      {
        package_id: packageId,
        week_id: weekId,
        entries: entries.slice(0, 40),
        updated_at: now,
      },
      { merge: true },
    );
  });

  return getSnapLeaderboard(packageId, userId);
}

export async function getSnapLeaderboard(packageId, userId = null) {
  const db = getFirestore();
  const weekId = isoWeekId();
  const snap = await db.collection("snap_weeks").doc(`${packageId}_${weekId}`).get();
  const entries = snap.exists && Array.isArray(snap.data()?.entries) ? snap.data().entries : [];
  const board = entries.slice(0, 20).map((e, i) => ({
    rank: i + 1,
    nickname: e.nickname,
    score: e.score,
    is_you: userId ? e.user_id === userId : false,
  }));
  let you = null;
  if (userId) {
    const idx = entries.findIndex((e) => e.user_id === userId);
    if (idx >= 0) {
      you = {
        rank: idx + 1,
        nickname: entries[idx].nickname,
        score: entries[idx].score,
      };
    }
  }
  return { package_id: packageId, week_id: weekId, board, you };
}

export async function verifyIdToken(idToken) {
  return getAuth().verifyIdToken(idToken);
}
