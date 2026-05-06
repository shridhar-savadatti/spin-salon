import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ADMIN_PATHS = [
  "/admin/appointments",
  "/admin/slots",
  "/admin/campaigns",
  "/admin/blog",
  "/admin/analytics",
];

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isProtected = PROTECTED_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Just check cookie exists — JWT is verified in each API route
  const token = req.cookies.get("salon_admin_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
