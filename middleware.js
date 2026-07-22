const CANONICAL_HOST = "studio9medical.com";

export default function middleware(request) {
  const host = request.headers.get("host") ?? "";
  if (!host.endsWith(".vercel.app")) return;

  const destination = new URL(request.url);
  destination.protocol = "https:";
  destination.host = CANONICAL_HOST;
  return Response.redirect(destination, 308);
}

export const config = {
  matcher: ["/((?!api/).*)"],
};
