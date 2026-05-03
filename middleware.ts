// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

// async function verifyToken(token: string, secret: string): Promise<boolean> {
//   try {
//     const key = new TextEncoder().encode(secret);
//     await jwtVerify(token, key);
//     return true;
//   } catch {
//     return false;
//   }
// }

// export async function middleware(request: NextRequest) {
//   const url = request.nextUrl.clone();
//   const pathname = url.pathname;

//   const token = request.cookies.get("token")?.value;
//   const adminToken = request.cookies.get("admin_token")?.value;

//   const userSecret = process.env.JWT_SECRET;
//   const adminSecret = process.env.ADMIN_SECRET;

//   if (!userSecret || !adminSecret) {
//     console.error("Missing environment variables: JWT_SECRET or ADMIN_SECRET");
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   const isAdminRoute = pathname.startsWith("/admin/dashboard");
//   const isAdminLogin = pathname === "/admin/login";

//   const protectedRoutes = [
//     "/dashboard",
//     "/dashboard/deposit",
//     "/dashboard/withdrawal",
//     "/dashboard/transactions",
//     "/dashboard/transfer",
//     "/dashboard/profile",
//     "/dashboard/purchase-plan",
//     "/dashboard/my-plans",
//     "/dashboard/referrals",
//   ];

//   const isProtectedRoute = protectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );

//   const isAuthPage =
//     pathname.startsWith("/login") || pathname.startsWith("/register");

//   // ── Admin route protection ───────────────────────────────────────
//   if (isAdminRoute) {
//     if (!adminToken || !(await verifyToken(adminToken, adminSecret))) {
//       const res = NextResponse.redirect(new URL("/admin/login", request.url));
//       res.cookies.set("admin_token", "", {
//         maxAge: 0,
//         path: "/",
//       });
//       return res;
//     }

//     return NextResponse.next();
//   }

//   // Redirect logged-in admin away from admin login
//   if (isAdminLogin) {
//     if (adminToken && (await verifyToken(adminToken, adminSecret))) {
//       return NextResponse.redirect(new URL("/admin/dashboard", request.url));
//     }

//     return NextResponse.next();
//   }

//   // ── User route protection ────────────────────────────────────────
//   if (isProtectedRoute) {
//     if (!token || !(await verifyToken(token, userSecret))) {
//       const res = NextResponse.redirect(new URL("/login", request.url));
//       res.cookies.set("token", "", {
//         maxAge: 0,
//         path: "/",
//       });
//       return res;
//     }

//     return NextResponse.next();
//   }

//   // Redirect logged-in users away from auth pages
//   if (isAuthPage) {
//     if (token && (await verifyToken(token, userSecret))) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }

//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/login",
//     "/register",

//     "/dashboard/:path*",
//     "/dashboard/deposit/:path*",
//     "/dashboard/withdrawal/:path*",
//     "/dashboard/transactions/:path*",
//     "/dashboard/transfer/:path*",
//     "/dashboard/profile/:path*",
//     "/dashboard/purchase-plan/:path*",
//     "/dashboard/my-plans/:path*",
//     "/dashboard/referrals/:path*",

//     "/admin/dashboard/:path*",
//     "/admin/login",
//   ],
// };






// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

// async function verifyToken(token: string, secret: string): Promise<boolean> {
//   try {
//     const key = new TextEncoder().encode(secret);
//     await jwtVerify(token, key);
//     return true;
//   } catch {
//     return false;
//   }
// }

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;
//   const adminToken = req.cookies.get("admin_token")?.value;
//   const { pathname } = req.nextUrl;

//   const isProtected = pathname.startsWith("/dashboard");
//   const isAdminProtected = pathname.startsWith("/admin/dashboard");
//   const isAdminLogin = pathname === "/admin/login";
//   const isAuthPage =
//     pathname.startsWith("/login") || pathname.startsWith("/register");

//   // ── Admin dashboard protection ──────────────────────────────────
//   if (isAdminProtected) {
//     if (
//       !adminToken ||
//       !(await verifyToken(adminToken, process.env.ADMIN_SECRET!))
//     ) {
//       const res = NextResponse.redirect(new URL("/admin/login", req.url));
//       res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
//       return res;
//     }

//     return NextResponse.next();
//   }

//   // Redirect logged-in admin away from admin login
//   if (
//     isAdminLogin &&
//     adminToken &&
//     (await verifyToken(adminToken, process.env.ADMIN_SECRET!))
//   ) {
//     return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//   }

//   // ── User dashboard protection ───────────────────────────────────
//   if (isProtected) {
//     if (!token || !(await verifyToken(token, process.env.JWT_SECRET!))) {
//       const res = NextResponse.redirect(new URL("/login", req.url));
//       res.cookies.set("token", "", { maxAge: 0, path: "/" });
//       return res;
//     }

//     return NextResponse.next();
//   }

//   // Redirect logged-in users away from auth pages
//   if (isAuthPage && token && (await verifyToken(token, process.env.JWT_SECRET!))) {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/login",
//     "/register",
//     "/admin/dashboard/:path*",
//     "/admin/login",
//   ],
// };