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

export async function listActiveEntitlements(userId, email = null) {
  const db = getFirestore();
  const catalog = getCatalog();
  const allIds = [
    ...catalog.paidPackageIds,
    ...catalog.freePackageIds.filter((id) => !catalog.paidPackageIds.includes(id)),
  ];
  const now = Date.now();
  const packageIds = new Set();
  const normalizedEmail = email?.trim().toLowerCase() ?? null;

  function collectDoc(data) {
    if (isActiveEntitlement(data, now)) {
      packageIds.add(String(data.package_id));
    }
  }

  for (const packageId of allIds) {
    const snap = await db.collection("entitlements").doc(`${userId}_${packageId}`).get();
    if (!snap.exists) continue;
    collectDoc(snap.data());
  }

  if (!packageIds.size) {
    const byUser = await db
      .collection("entitlements")
      .where("user_id", "==", userId)
      .get();
    byUser.forEach((doc) => collectDoc(doc.data()));
  }

  if (!packageIds.size && normalizedEmail) {
    const byEmail = await db
      .collection("entitlements")
      .where("email", "==", normalizedEmail)
      .get();

    const batch = db.batch();
    let pendingMigration = 0;

    byEmail.forEach((doc) => {
      const data = doc.data();
      if (!isActiveEntitlement(data, now)) return;
      const packageId = String(data.package_id);
      packageIds.add(packageId);

      if (data.user_id !== userId) {
        const targetRef = db.collection("entitlements").doc(`${userId}_${packageId}`);
        batch.set(
          targetRef,
          {
            ...data,
            user_id: userId,
            email: normalizedEmail,
            migrated_from: doc.id,
            migrated_at: new Date().toISOString(),
          },
          { merge: true },
        );
        pendingMigration += 1;
      }
    });

    if (pendingMigration) {
      await batch.commit();
    }
  }

  if (!packageIds.size && normalizedEmail) {
    try {
      const authUser = await getAuth().getUserByEmail(normalizedEmail);
      if (authUser.uid !== userId) {
        return listActiveEntitlements(authUser.uid, normalizedEmail);
      }
    } catch {
      /* no auth user for this email */
    }
  }

  return [...packageIds];
}
