import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define paths that require authentication
const protectedPaths = ["/", "/projects", "/profile", "/settings"];

// Define paths that are only for guests (unauthenticated users)
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;


  // 1. Check if path is protected
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // 2. Check if path is auth-only (login/register)
  const isAuthPath = authPaths.includes(pathname);

  // Case A: User is NOT logged in and attempts to access a protected route
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    // Optional: save the original URL as a redirect query parameter
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case B: User IS logged in and attempts to access login/register pages
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
