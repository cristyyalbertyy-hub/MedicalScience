import crypto from "node:crypto";
import { getCatalog } from "./catalog.js";

export function verifySignature(rawBody, signatureHeader) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured.");
  }
  if (!signatureHeader) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(signatureHeader, "utf8");

  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(digest, signature);
}

/** Custom data is optional on checkout URLs; fall back to LS product/variant mapping. */
function resolvePackageIdsFromOrder(custom, attrs) {
  const direct = custom.package_ids ?? custom.packageIds ?? "";
  if (direct) return String(direct);

  const lemonSqueezy = getCatalog().lemonSqueezy ?? {};
  const item = attrs.first_order_item ?? {};

  const variantId = item.variant_id != null ? String(item.variant_id) : "";
  if (variantId && lemonSqueezy.variants?.[variantId]) {
    return lemonSqueezy.variants[variantId];
  }

  const productName = String(item.product_name ?? "").trim();
  if (productName && lemonSqueezy.productsByName?.[productName]) {
    return lemonSqueezy.productsByName[productName];
  }

  return "";
}

function resolveSubscriptionPlan(custom, attrs) {
  const fromCustom = String(custom.plan ?? custom.plan_type ?? "").trim();
  if (fromCustom) return fromCustom;

  const lemonSqueezy = getCatalog().lemonSqueezy ?? {};
  const variantId =
    attrs.variant_id != null
      ? String(attrs.variant_id)
      : attrs.first_order_item?.variant_id != null
        ? String(attrs.first_order_item.variant_id)
        : "";

  if (variantId && lemonSqueezy.subscriptionVariants?.[variantId]) {
    return lemonSqueezy.subscriptionVariants[variantId];
  }

  const interval = String(
    attrs.variant_interval ?? attrs.billing_interval ?? "",
  ).toLowerCase();

  if (interval === "year" || interval === "yearly" || interval === "annual") {
    return "subscription_annual";
  }
  if (interval === "month" || interval === "monthly") {
    return "subscription_monthly";
  }

  return "subscription_monthly";
}

export function parseOrderEvent(body) {
  const eventName = body?.meta?.event_name;
  if (eventName !== "order_created") {
    return { handled: false, eventName };
  }

  const attrs = body?.data?.attributes ?? {};
  const custom = {
    ...(body?.meta?.custom_data ?? {}),
    ...(attrs.custom ?? {}),
  };

  const email =
    attrs.user_email ||
    attrs.customer_email ||
    body?.data?.attributes?.first_order_item?.user_email;

  const orderId =
    String(body?.data?.id ?? attrs.identifier ?? attrs.order_number ?? "");

  const plan = String(custom.plan ?? custom.plan_type ?? "single").trim();
  const packageIds = resolvePackageIdsFromOrder(custom, attrs);

  return {
    handled: true,
    eventName,
    email,
    orderId,
    plan,
    packageIds,
    status: attrs.status,
  };
}

/**
 * Lemon Squeezy subscription lifecycle — grants all paid modules while active.
 * Wire variant UUIDs in catalog.lemonSqueezy.subscriptionVariants when products exist.
 */
export function parseSubscriptionEvent(body) {
  const eventName = body?.meta?.event_name;
  const grantEvents = new Set([
    "subscription_created",
    "subscription_updated",
    "subscription_payment_success",
    "subscription_resumed",
  ]);
  const endEvents = new Set([
    "subscription_expired",
    "subscription_cancelled",
    "subscription_payment_failed",
  ]);

  if (!grantEvents.has(eventName) && !endEvents.has(eventName)) {
    return { handled: false, eventName };
  }

  const attrs = body?.data?.attributes ?? {};
  const custom = {
    ...(body?.meta?.custom_data ?? {}),
    ...(attrs.custom ?? {}),
  };

  const email =
    attrs.user_email ||
    attrs.customer_email ||
    custom.email ||
    "";

  const subscriptionId = String(body?.data?.id ?? attrs.identifier ?? "");
  const orderId = `sub_${subscriptionId}_${eventName}_${attrs.updated_at ?? attrs.created_at ?? Date.now()}`;
  const plan = resolveSubscriptionPlan(custom, attrs);
  const status = String(attrs.status ?? "").toLowerCase();

  return {
    handled: true,
    eventName,
    email,
    orderId,
    plan,
    packageIds: "",
    status: grantEvents.has(eventName) && status !== "expired" ? "paid" : status,
    endsAccess: endEvents.has(eventName) || status === "expired" || status === "cancelled",
  };
}
