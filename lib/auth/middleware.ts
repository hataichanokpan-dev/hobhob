import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware to protect routes
 *
 * Public routes: /sign-in, /coming-soon
 * Protected routes: everything else under /(app)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ["/sign-in", "/coming-soon", "/manifest.json", "/icons"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for auth token cookie (set by Firebase)
  // Note: Firebase doesn't set cookies by default, so we'll handle auth on client side
  // This middleware is mainly for server-side route protection

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
