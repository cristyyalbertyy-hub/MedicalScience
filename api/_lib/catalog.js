import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const catalog = require("../../packages/catalog.json");

const paidSet = new Set(catalog.paidPackageIds);
const freeSet = new Set(catalog.freePackageIds);
const purchasableSet = new Set(
  catalog.purchasablePackageIds ?? catalog.paidPackageIds,
);

export function getCatalog() {
  return catalog;
}

export function isPaidPackageId(id) {
  return paidSet.has(id);
}

export function isFreePackageId(id) {
  return freeSet.has(id);
}

export function isPurchasablePackageId(id) {
  return purchasableSet.has(id);
}

export function allPaidPackageIds() {
  return [...catalog.paidPackageIds];
}

export function allPurchasablePackageIds() {
  return [...(catalog.purchasablePackageIds ?? catalog.paidPackageIds)];
}

export function resolvePackageIds(plan, rawPackageIds) {
  const planConfig = catalog.plans[plan];
  if (!planConfig) {
    throw new Error(`Unknown plan: ${plan}`);
  }

  if (planConfig.enabled === false) {
    throw new Error(`Plan ${plan} is not available yet.`);
  }

  if (plan === "complete") {
    if (!planConfig.enabled) {
      throw new Error("Complete course is not available yet.");
    }
    return allPurchasablePackageIds();
  }

  if (planConfig.includes === "all_paid") {
    return allPurchasablePackageIds();
  }

  const ids = parsePackageIds(rawPackageIds);
  if (!ids.length) {
    throw new Error("No package_ids provided.");
  }

  for (const id of ids) {
    if (!isPurchasablePackageId(id)) {
      throw new Error(`Package ${id} is not available for purchase yet.`);
    }
  }

  if (planConfig.maxPackages && ids.length !== planConfig.maxPackages) {
    throw new Error(
      `Plan ${plan} requires exactly ${planConfig.maxPackages} package(s).`,
    );
  }

  return ids;
}

export function expiresAtForPlan(plan) {
  const planConfig = catalog.plans[plan];
  if (!planConfig) throw new Error(`Unknown plan: ${plan}`);

  if (planConfig.lifetime) {
    return new Date("2099-12-31T23:59:59.000Z");
  }

  const days = planConfig.durationDays ?? 365;
  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + days);
  return expires;
}

export function getPackageBundles() {
  return catalog.packageBundles ?? {};
}

export function getBundlePackageIds(bundleId) {
  return catalog.packageBundles?.[bundleId] ?? [];
}

export function isBundlePackageId(id) {
  return Object.prototype.hasOwnProperty.call(catalog.packageBundles ?? {}, id);
}

export function getParentAppPackageId(id) {
  return catalog.packageMeta?.[id]?.parentApp ?? id;
}

export function getPackageAccessConfig(parentAppId) {
  return catalog.packageAccess?.[parentAppId] ?? null;
}

export function getChapterPrefixesForPackageId(id) {
  const parentAppId = getParentAppPackageId(id);
  const access = getPackageAccessConfig(parentAppId);
  return access?.chaptersByPackageId?.[id] ?? null;
}

function parsePackageIds(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v).trim()).filter(Boolean);
  }
  return String(raw)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
