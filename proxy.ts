import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const adminToken = req.cookies.get("admin_token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");
  const isAdminProtected = pathname.startsWith("/admin/dashboard");
  const isAdminLogin = pathname === "/admin/login";
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  // ❌ REMOVE JWT VERIFY COMPLETELY
  // Middleware should ONLY check presence of cookie, NOT verify it

  // Admin dashboard protection
  if (isAdminProtected) {
    if (!adminToken) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
      return res;
    }
    return NextResponse.next();
  }

  if (isAdminLogin && adminToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // User dashboard protection
  if (isProtected) {
    if (!token) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.set("token", "", { maxAge: 0, path: "/" });
      return res;
    }
    return NextResponse.next();
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/admin/dashboard/:path*", "/admin/login"],
};






// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// export function proxy(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;
//   const adminToken = req.cookies.get("admin_token")?.value;
//   const { pathname } = req.nextUrl;

//   const isProtected = pathname.startsWith("/dashboard");
//   const isAdminProtected = pathname.startsWith("/admin/dashboard");
//   const isAdminLogin = pathname === "/admin/login";
//   const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

//   const verifyToken = (t: string, secret: string): boolean => {
//     try { jwt.verify(t, secret); return true; } catch { return false; }
//   };

//   // Admin dashboard protection
//   if (isAdminProtected) {
//     if (!adminToken || !verifyToken(adminToken, process.env.ADMIN_SECRET!)) {
//       const res = NextResponse.redirect(new URL("/admin/login", req.url));
//       res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
//       return res;
//     }
//     return NextResponse.next();
//   }

//   // Redirect logged-in admin away from admin login
//   if (isAdminLogin && adminToken && verifyToken(adminToken, process.env.ADMIN_SECRET!)) {
//     return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//   }

//   // User dashboard protection
//   if (isProtected) {
//     if (!token || !verifyToken(token, process.env.JWT_SECRET!)) {
//       const res = NextResponse.redirect(new URL("/login", req.url));
//       res.cookies.set("token", "", { maxAge: 0, path: "/" });
//       return res;
//     }
//     return NextResponse.next();
//   }

//   // Valid user token trying to access login/register
//   if (isAuthPage && token && verifyToken(token, process.env.JWT_SECRET!)) {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/login", "/register", "/admin/dashboard/:path*", "/admin/login"],
// };