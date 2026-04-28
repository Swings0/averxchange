import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  const verifyToken = (t: string): boolean => {
    try {
      jwt.verify(t, process.env.JWT_SECRET!);
      return true;
    } catch {
      return false;
    }
  };

  if (isProtected) {
    if (!token || !verifyToken(token)) {
      // Token missing or expired — clear cookie and go to login
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.set("token", "", { maxAge: 0, path: "/" });
      return res;
    }
    return NextResponse.next();
  }

  // Valid token trying to access login/register → send to dashboard
  if (isAuthPage && token && verifyToken(token)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};