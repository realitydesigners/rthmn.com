import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  // Extract the 'code' parameter from the URL query
  const code = requestUrl.searchParams.get('code');

  // Initialize a default response
  const response = NextResponse.next();
  // Create a new Supabase client instance
  const supabase = await createClient();

  // If there's an auth code in the URL, exchange it for a session
  if (code) {
    // Attempt to exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // If the exchange is successful and a session is returned
    if (data.session) {
      // Redirect the user to the dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Attempt to get the current session
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // If there's a session and the user is on the root path, redirect to the dashboard
  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the request is for a user path, update the session
  if (request.nextUrl.pathname.startsWith('/user')) {
    return await updateSession(request);
  }

  // Return the default response if none of the above conditions are met
  return response;
}

// Configuration for the middleware to match specific URL patterns
export const config = {
  matcher: [
    '/user/:path*', // Matches any URL starting with '/user/'
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)' // Matches any URL that does not start with the specified paths
  ]
};
