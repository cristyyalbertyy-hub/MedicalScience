import { doc, getDoc, setDoc } from "./firebase-client.js";

export const AUTO_RESOURCES = ["V", "P"];
export const MAX_PROGRESS_LEVEL = 3;

export function progressDocId(userId, packageId, itemKey, resource) {
  const safeKey = `${itemKey}/${resource}`.replace(/\//g, "__");
  return `${userId}_${packageId}_${safeKey}`;
}

export function levelFromWatchCount(watchCount) {
  const n = typeof watchCount === "number" ? watchCount : 0;
  return Math.min(MAX_PROGRESS_LEVEL, Math.max(0, n));
}

/**
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} userId
 * @param {string} packageId
 * @param {string} itemKey
 * @param {'V'|'P'} resource
 */
export async function recordWatchComplete(db, userId, packageId, itemKey, resource) {
  const id = progressDocId(userId, packageId, itemKey, resource);
  const ref = doc(db, "progress", id);

  let current = 0;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      current = levelFromWatchCount(snap.data().watch_count);
    }
  } catch {
    current = 0;
  }

  const next = Math.min(MAX_PROGRESS_LEVEL, current + 1);

  await setDoc(
    ref,
    {
      user_id: userId,
      package_id: packageId,
      item_key: itemKey,
      resource,
      tracking: "auto",
      watch_count: next,
      status: next > 0 ? "completed" : "started",
      updated_at: new Date().toISOString(),
    },
    { merge: true },
  );

  return next;
}
