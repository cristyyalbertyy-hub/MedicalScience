import { getAuth, getFirestore } from "./firebase.js";
import { getCatalog } from "./catalog.js";

function isActiveEntitlement(data, nowMs) {
  const expires = new Date(data.expires_at).getTime();
  return !Number.isNaN(expires) && expires > nowMs && data.package_id;
}

export async function getOrCreateUserByEmail(email) {
  const auth = getAuth();
  const normalized = email.trim().toLowerCase();
  try {
    return await auth.getUserByEmail(normalized);
  } catch (err) {
    if (err?.code !== "auth/user-not-found") throw err;
    return auth.createUser({
      email: normalized,
      emailVerified: true,
    });
  }
}

export async function isOrderProcessed(orderId) {
  const db = getFirestore();
  const snap = await db.collection("orders_processed").doc(orderId).get();
  return snap.exists;
}

export async function markOrderProcessed(orderId, payload) {
  const db = getFirestore();
  await db
    .collection("orders_processed")
    .doc(orderId)
    .set({
      ...payload,
      processed_at: new Date().toISOString(),
    });
}

export async function grantEntitlements({
  userId,
  packageIds,
  expiresAt,
  orderId = null,
  plan = null,
  email,
  source = "lemonsqueezy",
}) {
  const db = getFirestore();
  const expiresIso = expiresAt.toISOString();
  const batch = db.batch();
  const now = new Date().toISOString();

  for (const packageId of packageIds) {
    const ref = db.collection("entitlements").doc(`${userId}_${packageId}`);
    const existing = await ref.get();

    if (!existing.exists) {
      batch.set(ref, {
        user_id: userId,
        package_id: packageId,
        expires_at: expiresIso,
        order_id: orderId,
        plan,
        email,
        source,
        granted_at: now,
      });
    } else {
      const current = existing.data().expires_at;
      const currentDate = current ? new Date(current) : new Date(0);
      const nextExpires =
        expiresAt > currentDate ? expiresIso : current;
      batch.update(ref, {
        expires_at: nextExpires,
        order_id: orderId,
        plan,
        email,
        source,
        updated_at: now,
      });
    }
  }

  await batch.commit();
}

export async function logAdminGrant(payload) {
  const db = getFirestore();
  await db.collection("admin_grants").add({
    ...payload,
    created_at: new Date().toISOString(),
  });
}

export async function listActiveEntitlements(userId) {
  const db = getFirestore();
  const catalog = getCatalog();
  const allIds = [
    ...catalog.paidPackageIds,
    ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
  ];
  const now = Date.now();
  const packageIds = new Set();

  for (const packageId of allIds) {
    const snap = await db.collection("entitlements").doc(`${userId}_${packageId}`).get();
    if (!snap.exists) continue;
    const data = snap.data();
    if (isActiveEntitlement(data, now)) {
      packageIds.add(String(data.package_id));
    }
  }

  if (!packageIds.size) {
    const snap = await db
      .collection("entitlements")
      .where("user_id", "==", userId)
      .get();
    snap.forEach((doc) => {
      const data = doc.data();
      if (isActiveEntitlement(data, now)) {
        packageIds.add(String(data.package_id));
      }
    });
  }

  return [...packageIds];
}
