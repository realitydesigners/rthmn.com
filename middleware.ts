import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only check auth for /user routes
  if (request.nextUrl.pathname.startsWith('/user')) {
    return await updateSession(request);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes within the user folder
    '/user/:path*'
  ]
};
