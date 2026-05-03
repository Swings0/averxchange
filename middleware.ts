import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const adminToken = req.cookies.get("admin_token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");
  const isAdminProtected = pathname.startsWith("/admin/dashboard");
  const isAdminLogin = pathname === "/admin/login";
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // ── Admin dashboard protection ──────────────────────────────────
  if (isAdminProtected) {
    if (
      !adminToken ||
      !(await verifyToken(adminToken, process.env.ADMIN_SECRET!))
    ) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
      return res;
    }

    return NextResponse.next();
  }

  // Redirect logged-in admin away from admin login
  if (
    isAdminLogin &&
    adminToken &&
    (await verifyToken(adminToken, process.env.ADMIN_SECRET!))
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // ── User dashboard protection ───────────────────────────────────
  if (isProtected) {
    if (!token || !(await verifyToken(token, process.env.JWT_SECRET!))) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.set("token", "", { maxAge: 0, path: "/" });
      return res;
    }

    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && token && (await verifyToken(token, process.env.JWT_SECRET!))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/admin/dashboard/:path*",
    "/admin/login",
  ],
};