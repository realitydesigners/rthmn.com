import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('Callback route hit, code:', code);

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log('Session exchange result:', {
        data: data ? 'Data exists' : 'No data',
        error
      });
      if (error) throw error;

      // Explicitly set the session
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth-error?error=${encodeURIComponent(JSON.stringify(error))}`
      );
    }
  }

  // Redirect to a specific page after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
