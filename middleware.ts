import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/appointments",
  "/billing",
  "/customers",
  "/staff",
  "/inventory",
  "/services",
  "/marketing",
  "/reviews",
  "/reports",
  "/settings",
];

const authPaths = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth session cookie (next-auth stores session in a cookie)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  const isProtectedRoute = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  const isAuthRoute = authPaths.includes(pathname);

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
