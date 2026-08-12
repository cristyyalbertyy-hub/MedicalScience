import { getAuth, getFirestore } from "./firebase.js";
import { getCatalog } from "./catalog.js";

function isActiveEntitlement(data, nowMs) {
  const expires = new Date(data.expires_at).getTime();
  return !Number.isNaN(expires) && expires > nowMs && data.package_id;
}

/** Lowercase trim — exact string used in Firebase Auth / forms. */
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Gmail treats dots and +tags as aliases; Firebase Auth does not.
 * Use one key so studio9.cris@gmail.com matches studio9cris@gmail.com.
 */
export function canonicalEmail(email) {
  const normalized = normalizeEmail(email);
  const at = normalized.lastIndexOf("@");
  if (at <= 0) return normalized;

  let local = normalized.slice(0, at);
  let domain = normalized.slice(at + 1);
  const gmailDomains = new Set(["gmail.com", "googlemail.com"]);
  if (!gmailDomains.has(domain)) return normalized;

  const plus = local.indexOf("+");
  if (plus >= 0) local = local.slice(0, plus);
  local = local.replace(/\./g, "");
  if (domain === "googlemail.com") domain = "gmail.com";
  return `${local}@${domain}`;
}

function entitlementEmailKey(email) {
  return canonicalEmail(email);
}

function emailMatchesEntitlement(sessionEmail, data) {
  if (!sessionEmail) return false;
  const sessionKey = entitlementEmailKey(sessionEmail);
  if (data.email && entitlementEmailKey(data.email) === sessionKey) return true;
  if (data.email_key && data.email_key === sessionKey) return true;
  return false;
}

export async function getOrCreateUserByEmail(email) {
  const auth = getAuth();
  const normalized = normalizeEmail(email);
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

    const emailKey = entitlementEmailKey(email);

    if (!existing.exists) {
      batch.set(ref, {
        user_id: userId,
        package_id: packageId,
        expires_at: expiresIso,
        order_id: orderId,
        plan,
        email,
        email_key: emailKey,
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
        email_key: emailKey,
        source,
        updated_at: now,
      });
    }
  }

  await batch.commit();
}

function isSubscriptionPlan(plan) {
  return plan === "subscription_monthly" || plan === "subscription_annual";
}

export async function upsertSubscriptionRecord({
  userId,
  email,
  subscription,
  source = "lemonsqueezy",
}) {
  if (!subscription?.id) return null;

  const db = getFirestore();
  const now = new Date().toISOString();
  const emailKey = entitlementEmailKey(email);
  const ref = db.collection("subscriptions").doc(String(subscription.id));
  const payload = {
    subscription_id: String(subscription.id),
    user_id: userId,
    email,
    email_key: emailKey,
    plan: subscription.plan ?? null,
    status: subscription.status ?? null,
    billing_interval: subscription.billingInterval || null,
    renews_at: subscription.renewsAt ?? null,
    ends_at: subscription.endsAt ?? null,
    cancel_at_period_end: Boolean(subscription.cancelAtPeriodEnd),
    customer_portal_url: subscription.customerPortalUrl ?? null,
    update_payment_url: subscription.updatePaymentUrl ?? null,
    variant_id: subscription.variantId ?? null,
    product_name: subscription.productName ?? "Studio9 Pass",
    source,
    updated_at: now,
  };

  const existing = await ref.get();
  if (!existing.exists) {
    payload.created_at = now;
    await ref.set(payload);
  } else {
    await ref.set(payload, { merge: true });
  }

  return payload;
}

function subscriptionLooksActive(data, nowMs) {
  const status = String(data.status ?? "").toLowerCase();
  if (status === "expired" || status === "unpaid") return false;

  if (status === "active" || status === "on_trial" || status === "paused") {
    return true;
  }

  if (status === "cancelled" || data.cancel_at_period_end) {
    const endsAt = data.ends_at ? new Date(data.ends_at).getTime() : NaN;
    if (!Number.isNaN(endsAt)) return endsAt > nowMs;
    const renewsAt = data.renews_at ? new Date(data.renews_at).getTime() : NaN;
    return !Number.isNaN(renewsAt) && renewsAt > nowMs;
  }

  return false;
}

function toPassPayload(data) {
  const billing =
    data.billing_interval === "year" ||
    data.billing_interval === "yearly" ||
    data.billing_interval === "annual" ||
    data.plan === "subscription_annual"
      ? "annual"
      : "monthly";

  return {
    active: true,
    plan: data.plan ?? null,
    billing,
    status: data.status ?? null,
    renews_at: data.renews_at ?? null,
    ends_at: data.ends_at ?? null,
    cancel_at_period_end: Boolean(data.cancel_at_period_end),
    customer_portal_url: data.customer_portal_url ?? null,
    update_payment_url: data.update_payment_url ?? null,
    product_name: data.product_name ?? "Studio9 Pass",
  };
}

export async function getActivePassForUser(userId, email = null) {
  const db = getFirestore();
  const nowMs = Date.now();
  const normalizedEmail = email ? normalizeEmail(email) : null;
  const emailKey = normalizedEmail ? entitlementEmailKey(normalizedEmail) : null;

  async function firstActiveFromQuery(snap) {
    let best = null;
    snap.forEach((doc) => {
      const data = doc.data();
      if (!subscriptionLooksActive(data, nowMs)) return;
      if (!best) {
        best = data;
        return;
      }
      const bestRenew = best.renews_at ? new Date(best.renews_at).getTime() : 0;
      const nextRenew = data.renews_at ? new Date(data.renews_at).getTime() : 0;
      if (nextRenew > bestRenew) best = data;
    });
    return best;
  }

  let snap = await db.collection("subscriptions").where("user_id", "==", userId).get();
  let active = await firstActiveFromQuery(snap);
  if (active) return toPassPayload(active);

  if (normalizedEmail) {
    snap = await db.collection("subscriptions").where("email", "==", normalizedEmail).get();
    active = await firstActiveFromQuery(snap);
    if (active) return toPassPayload(active);
  }

  if (emailKey && emailKey !== normalizedEmail) {
    snap = await db.collection("subscriptions").where("email_key", "==", emailKey).get();
    active = await firstActiveFromQuery(snap);
    if (active) return toPassPayload(active);
  }

  // Fallback: infer Pass from entitlements granted with a subscription plan.
  const packageIds = await listActiveEntitlements(userId, email);
  if (!packageIds.length) return null;

  for (const packageId of packageIds) {
    const ent = await db.collection("entitlements").doc(`${userId}_${packageId}`).get();
    if (!ent.exists) continue;
    const data = ent.data();
    if (!isSubscriptionPlan(data.plan)) continue;
    return {
      active: true,
      plan: data.plan,
      billing: data.plan === "subscription_annual" ? "annual" : "monthly",
      status: "active",
      renews_at: data.expires_at ?? null,
      ends_at: null,
      cancel_at_period_end: false,
      customer_portal_url: null,
      update_payment_url: null,
      product_name: "Studio9 Pass",
    };
  }

  return null;
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
  const normalizedEmail = email ? normalizeEmail(email) : null;
  const emailKey = normalizedEmail ? entitlementEmailKey(normalizedEmail) : null;

  function collectDoc(data) {
    if (isActiveEntitlement(data, now)) {
      packageIds.add(String(data.package_id));
    }
  }

  function migrateEntitlement(data, packageId, batch) {
    if (data.user_id === userId) return;
    const targetRef = db.collection("entitlements").doc(`${userId}_${packageId}`);
    batch.set(
      targetRef,
      {
        ...data,
        user_id: userId,
        email: normalizedEmail,
        email_key: emailKey,
        migrated_from: data.migrated_from ?? null,
        migrated_at: new Date().toISOString(),
      },
      { merge: true },
    );
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
    const batch = db.batch();
    let pendingMigration = 0;
    const seenDocIds = new Set();

    async function collectEmailMatches(querySnap) {
      querySnap.forEach((doc) => {
        if (seenDocIds.has(doc.id)) return;
        seenDocIds.add(doc.id);

        const data = doc.data();
        if (!emailMatchesEntitlement(normalizedEmail, data)) return;
        if (!isActiveEntitlement(data, now)) return;

        const packageId = String(data.package_id);
        packageIds.add(packageId);

        if (data.user_id !== userId) {
          migrateEntitlement({ ...data, migrated_from: doc.id }, packageId, batch);
          pendingMigration += 1;
        }
      });
    }

    await collectEmailMatches(
      await db.collection("entitlements").where("email", "==", normalizedEmail).get(),
    );

    if (emailKey && emailKey !== normalizedEmail) {
      await collectEmailMatches(
        await db.collection("entitlements").where("email_key", "==", emailKey).get(),
      );
    }

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
