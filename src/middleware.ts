import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // Redirect unauthenticated users trying to access dashboard routes to sign in
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
