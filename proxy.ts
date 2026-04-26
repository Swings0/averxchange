import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Next.js 16 requires the export to be named "proxy"
export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.set("token", "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  // Already logged in → skip login/register
  if (isAuthPage && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};