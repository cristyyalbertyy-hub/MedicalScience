import crypto from "node:crypto";

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
  const packageIds = custom.package_ids ?? custom.packageIds ?? "";

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
