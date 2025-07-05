import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Define routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/onboarding",
    "/account",
    "/admin",
    "/studio",
    "/signals",
    "/support",
    "/algorithm",
    "/calculator",
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const response = await updateSession(request);
    // Add pathname to headers
    response.headers.set("x-pathname", request.nextUrl.pathname);
    return response;
  }

  // For other routes, just add pathname
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
