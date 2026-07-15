import { getAuth, getFirestore } from "./firebase.js";
import { getCatalog } from "./catalog.js";
import { fetchVercelAnalytics } from "./vercel-analytics.js";

function isActiveEntitlement(data, nowMs) {
  const expires = new Date(data.expires_at).getTime();
  return !Number.isNaN(expires) && expires > nowMs && data.package_id;
}

async function countAuthUsers() {
  const auth = getAuth();
  let total = 0;
  let nextPageToken;

  do {
    const page = await auth.listUsers(1000, nextPageToken);
    total += page.users.length;
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  return total;
}

export async function collectAdminStats() {
  const db = getFirestore();
  const catalog = getCatalog();
  const nowMs = Date.now();
  const packageTitles = Object.fromEntries(
    Object.entries(catalog.packageMeta ?? {}).map(([id, meta]) => [id, meta.title ?? id]),
  );

  const totalUsers = await countAuthUsers();

  const [entSnap, progSnap, ordersSnap, grantsSnap, traffic] = await Promise.all([
    db.collection("entitlements").get(),
    db.collection("progress").get(),
    db.collection("orders_processed").get(),
    db.collection("admin_grants").get(),
    fetchVercelAnalytics(),
  ]);

  const entitlementsByPackage = {};
  const activeUsersByPackage = {};
  let activeEntitlements = 0;
  let expiredEntitlements = 0;
  const activeUserIds = new Set();
  const sources = {};

  entSnap.forEach((doc) => {
    const data = doc.data();
    const packageId = String(data.package_id ?? "unknown");
    if (!entitlementsByPackage[packageId]) {
      entitlementsByPackage[packageId] = { active: 0, expired: 0 };
    }

    const active = isActiveEntitlement(data, nowMs);
    if (active) {
      entitlementsByPackage[packageId].active += 1;
      activeEntitlements += 1;
      if (data.user_id) {
        activeUserIds.add(data.user_id);
        if (!activeUsersByPackage[packageId]) activeUsersByPackage[packageId] = new Set();
        activeUsersByPackage[packageId].add(data.user_id);
      }
    } else {
      entitlementsByPackage[packageId].expired += 1;
      expiredEntitlements += 1;
    }

    const source = String(data.source ?? "unknown");
    sources[source] = (sources[source] ?? 0) + 1;
  });

  const progressByPackage = {};
  const usersWithProgress = new Set();
  let progressDocuments = 0;

  progSnap.forEach((doc) => {
    progressDocuments += 1;
    const data = doc.data();
    const packageId = String(data.package_id ?? "unknown");
    if (!progressByPackage[packageId]) {
      progressByPackage[packageId] = { documents: 0, users: new Set() };
    }
    progressByPackage[packageId].documents += 1;
    if (data.user_id) {
      progressByPackage[packageId].users.add(data.user_id);
      usersWithProgress.add(data.user_id);
    }
  });

  const allPackageIds = [
    ...new Set([
      ...catalog.paidPackageIds,
      ...catalog.freePackageIds,
      ...Object.keys(entitlementsByPackage),
      ...Object.keys(progressByPackage),
    ]),
  ].sort();

  const packages = allPackageIds.map((packageId) => ({
    package_id: packageId,
    title: packageTitles[packageId] ?? packageId,
    active_entitlements: entitlementsByPackage[packageId]?.active ?? 0,
    expired_entitlements: entitlementsByPackage[packageId]?.expired ?? 0,
    active_users: activeUsersByPackage[packageId]?.size ?? 0,
    progress_documents: progressByPackage[packageId]?.documents ?? 0,
    users_with_progress: progressByPackage[packageId]?.users.size ?? 0,
  }));

  packages.sort((a, b) => b.active_entitlements - a.active_entitlements);

  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_auth_users: totalUsers,
      active_entitlements: activeEntitlements,
      expired_entitlements: expiredEntitlements,
      distinct_users_with_active_access: activeUserIds.size,
      progress_documents: progressDocuments,
      users_with_progress: usersWithProgress.size,
      orders_processed: ordersSnap.size,
      admin_grants_logged: grantsSnap.size,
      entitlement_sources: sources,
    },
    packages,
    traffic,
    notes: {
      traffic: traffic.configured
        ? traffic.error
          ? `Tráfego Vercel indisponível: ${traffic.error}`
          : `Tráfego Vercel (${traffic.period?.label ?? "produção"}): ${traffic.pageviews ?? 0} pageviews.`
        : traffic.message,
      progress:
        "Progresso Firestore está activo sobretudo em medical-biology e genetics; outras disciplinas podem mostrar 0 até integração completa.",
    },
  };
}
