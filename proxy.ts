import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const runtime = "edge";

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Protect user dashboard ──────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("token")?.value;
    if (!token || !(await verifyToken(token, process.env.JWT_SECRET!))) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.set("token", "", { maxAge: 0, path: "/" });
      return res;
    }
    return NextResponse.next();
  }

  // ── Protect admin dashboard ─────────────────────────────────────
  if (pathname.startsWith("/admin/dashboard")) {
    const adminToken = req.cookies.get("admin_token")?.value;
    if (!adminToken || !(await verifyToken(adminToken, process.env.ADMIN_SECRET!))) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/dashboard/:path*"],
};