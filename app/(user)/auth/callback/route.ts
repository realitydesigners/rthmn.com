import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('Callback route hit, code:', code);

  if (code) {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log('Session exchange result:', {
        data: data ? 'Data exists' : 'No data',
        error
      });
      if (error) throw error;

      // No need to explicitly set the session, as it's handled by the middleware
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
