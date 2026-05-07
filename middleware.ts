import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── User Dashboard Protection ─────────────────────
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }
  }

  // ── Admin Dashboard Protection ────────────────────
  if (pathname.startsWith("/admin/dashboard")) {
    const adminToken =
      req.cookies.get("admin_token")?.value;

    if (!adminToken) {
      return NextResponse.redirect(
        new URL("/admin/login", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/dashboard/:path*",
  ],
};