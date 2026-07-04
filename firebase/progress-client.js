/**
 * Shared progress tracking for Studio9 package apps and the progress dashboard.
 *
 * Videos (V) and podcasts (P): auto — watch_count 0–3 maps to colour levels.
 * Infographics (I) and questions (Q): manual — manual_level 0–3 set by the student.
 */
export const AUTO_RESOURCES = ["V", "P"];
export const MANUAL_RESOURCES = ["I", "Q"];
export const MAX_PROGRESS_LEVEL = 3;

export function progressDocId(userId, packageId, itemKey, resource) {
  const safeKey = `${itemKey}/${resource}`.replace(/\//g, "__");
  return `${userId}_${packageId}_${safeKey}`;
}

export function progressMapKey(itemKey, resource) {
  return `${itemKey}/${resource}`;
}

/** @param {number | null | undefined} watchCount */
export function levelFromWatchCount(watchCount) {
  const n = typeof watchCount === "number" ? watchCount : 0;
  return Math.min(MAX_PROGRESS_LEVEL, Math.max(0, n));
}

/** @param {number | null | undefined} manualLevel */
export function levelFromManual(manualLevel) {
  const n = typeof manualLevel === "number" ? manualLevel : 0;
  return Math.min(MAX_PROGRESS_LEVEL, Math.max(0, n));
}

/**
 * @param {'V'|'P'|'I'|'Q'} resource
 * @param {{ watch_count?: number, manual_level?: number, status?: string }} data
 */
export function progressLevel(resource, data = {}) {
  if (AUTO_RESOURCES.includes(resource)) {
    return levelFromWatchCount(data.watch_count);
  }
  if (MANUAL_RESOURCES.includes(resource)) {
    return levelFromManual(data.manual_level);
  }
  return data.status === "completed" ? 1 : 0;
}

/**
 * Record one full play-through of a video or podcast (increments watch_count, max 3).
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} userId
 * @param {string} packageId
 * @param {string} itemKey
 * @param {'V'|'P'} resource
 */
export async function recordWatchComplete(db, userId, packageId, itemKey, resource) {
  const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");
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
      client_at: serverTimestamp(),
    },
    { merge: true },
  );

  return next;
}

/**
 * Set manual progress level for infographics and questionnaires (0–3).
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} userId
 * @param {string} packageId
 * @param {string} itemKey
 * @param {'I'|'Q'} resource
 * @param {0|1|2|3} level
 */
export async function recordManualLevel(db, userId, packageId, itemKey, resource, level) {
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const safeLevel = Math.min(MAX_PROGRESS_LEVEL, Math.max(0, level));
  const id = progressDocId(userId, packageId, itemKey, resource);

  await setDoc(
    doc(db, "progress", id),
    {
      user_id: userId,
      package_id: packageId,
      item_key: itemKey,
      resource,
      tracking: "manual",
      manual_level: safeLevel,
      status: safeLevel > 0 ? "completed" : "started",
      updated_at: new Date().toISOString(),
      client_at: serverTimestamp(),
    },
    { merge: true },
  );

  return safeLevel;
}

/**
 * @deprecated Prefer recordWatchComplete or recordManualLevel.
 */
export async function recordProgress(db, user, packageId, itemKey, resource, status, extra = {}) {
  if (AUTO_RESOURCES.includes(resource) && status === "completed") {
    return recordWatchComplete(db, user.uid ?? user, packageId, itemKey, resource);
  }
  if (MANUAL_RESOURCES.includes(resource) && status === "completed") {
    return recordManualLevel(db, user.uid ?? user, packageId, itemKey, resource, 1);
  }

  const userId = typeof user === "string" ? user : user.uid;
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const id = progressDocId(userId, packageId, itemKey, resource);
  await setDoc(
    doc(db, "progress", id),
    {
      user_id: userId,
      package_id: packageId,
      item_key: itemKey,
      resource,
      status,
      ...(extra.score != null ? { score: extra.score } : {}),
      updated_at: new Date().toISOString(),
      client_at: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} userId
 * @param {string} packageId
 */
export async function loadPackageProgress(db, userId, packageId) {
  const { collection, query, where, getDocs } = await import("firebase/firestore");
  const snap = await getDocs(
    query(
      collection(db, "progress"),
      where("user_id", "==", userId),
      where("package_id", "==", packageId),
    ),
  );
  /** @type {Record<string, { status?: string, score?: number, watch_count?: number, manual_level?: number, resource?: string }>} */
  const map = {};
  snap.forEach((d) => {
    const data = d.data();
    map[progressMapKey(data.item_key, data.resource)] = {
      status: data.status,
      score: data.score,
      watch_count: data.watch_count,
      manual_level: data.manual_level,
      resource: data.resource,
    };
  });
  return map;
}

/**
 * @param {import('../../packages/progress-manifest.json').packages[string]} manifest
 * @param {Record<string, { status?: string, watch_count?: number, manual_level?: number, resource?: string }>} progressMap
 */
export function summarizeProgress(manifest, progressMap) {
  let total = 0;
  let completed = 0;
  let points = 0;
  const maxPointsPerCell = MAX_PROGRESS_LEVEL;

  for (const topic of manifest.topics) {
    for (const resource of topic.resources) {
      total += 1;
      const key = progressMapKey(topic.id, resource);
      const cell = progressMap[key] ?? {};
      const level = progressLevel(resource, { ...cell, resource });
      points += level;
      if (level >= MAX_PROGRESS_LEVEL) completed += 1;
    }
  }

  return {
    total,
    completed,
    points,
    maxPoints: total * maxPointsPerCell,
    percent: total ? Math.round((points / (total * maxPointsPerCell)) * 100) : 0,
  };
}
