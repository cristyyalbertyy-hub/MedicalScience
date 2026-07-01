/**
 * Shared progress tracking for Studio9 package apps.
 * Copy or import from each app (Genetics, Biology, …).
 *
 * Item key examples:
 *   genetics:       BG/MP/V   (chapter/subchapter/resource)
 *   medical-biology: cell-fundamentals/cell-theory/V
 */
export function progressDocId(userId, packageId, itemKey, resource) {
  const safeKey = `${itemKey}/${resource}`.replace(/\//g, "__");
  return `${userId}_${packageId}_${safeKey}`;
}

/**
 * @param {import('firebase/firestore').Firestore} db
 * @param {import('firebase/auth').User} user
 * @param {string} packageId
 * @param {string} itemKey
 * @param {'V'|'P'|'I'|'Q'} resource
 * @param {'started'|'completed'} status
 * @param {{ score?: number }} [extra]
 */
export async function recordProgress(db, user, packageId, itemKey, resource, status, extra = {}) {
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const id = progressDocId(user.uid, packageId, itemKey, resource);
  await setDoc(
    doc(db, "progress", id),
    {
      user_id: user.uid,
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
  /** @type {Record<string, { status: string, score?: number }>} */
  const map = {};
  snap.forEach((d) => {
    const data = d.data();
    map[`${data.item_key}/${data.resource}`] = {
      status: data.status,
      score: data.score,
    };
  });
  return map;
}

/**
 * @param {import('../../packages/progress-manifest.json').packages[string]} manifest
 * @param {Record<string, { status: string }>} progressMap
 */
export function summarizeProgress(manifest, progressMap) {
  let total = 0;
  let completed = 0;
  for (const topic of manifest.topics) {
    for (const resource of topic.resources) {
      total += 1;
      const key = `${topic.id}/${resource}`;
      if (progressMap[key]?.status === "completed") completed += 1;
    }
  }
  return {
    total,
    completed,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}
