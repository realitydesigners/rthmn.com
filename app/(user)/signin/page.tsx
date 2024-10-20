'use client';
import { useRouter } from 'next/navigation';
import { Scene } from '@/components/Scene/Scene';
import { useSignInWithOAuth } from '@/utils/auth-helpers/client';
import { FcGoogle } from 'react-icons/fc';
import { useEffect } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { russo, oxanium } from '@/fonts';
import { getAuthTypes } from '@/utils/auth-helpers/settings';
import { SocialMediaLinks } from '@/components/SocialMediaLinks';
import type { Provider } from '@supabase/supabase-js';
import { useAuth } from '@/providers/SupabaseProvider';
import { createClient } from '@/utils/supabase/client';

export default function SignIn() {
  const { session } = useAuth();
  const router = useRouter();
  const signInWithOAuth = useSignInWithOAuth();

  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        localStorage.setItem(
          'lastAuthEvent',
          JSON.stringify({
            event,
            session: session ? 'Session exists' : 'No session'
          })
        );
      }
    );

    const lastAuthEvent = localStorage.getItem('lastAuthEvent');
    if (lastAuthEvent) {
      console.log('Previous auth event:', JSON.parse(lastAuthEvent));
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const provider = e.currentTarget.provider.value as Provider;
    console.log('Initiating OAuth sign-in with provider:', provider);
    localStorage.setItem('signInAttempt', new Date().toISOString());
    try {
      await signInWithOAuth(e, provider);
    } catch (error) {
      console.error('OAuth sign-in error:', error);
      localStorage.setItem('signInError', JSON.stringify(error));
    }
  };

  if (session) {
    router.push('/');
    return null;
  }

  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();

  return (
    <div className="flex h-screen">
      <div className="relative w-1/2">
        <Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
      </div>
      <div className="flex w-1/2 flex-col items-center justify-center bg-black">
        <div className="w-96 max-w-xl">
          <h1 className={`mb-6 text-5xl text-white ${russo.className}`}>
            Ready to use RTHMN?
          </h1>
          <p className={`mb-10 text-xl text-gray-300 ${oxanium.className}`}>
            Sign in to get started
          </p>
          <p className={`mb-6 text-lg text-gray-400 ${oxanium.className}`}>
            Choose your preferred sign in method
          </p>
          {allowOauth && (
            <div className="space-y-4">
              <form onSubmit={(e) => handleSignIn(e)}>
                <button
                  className="flex w-full items-center justify-center rounded-md border border-gray-500 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
                  type="submit"
                  name="provider"
                  value="google"
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Sign in with Google
                </button>
              </form>
              <form onSubmit={(e) => handleSignIn(e)}>
                <button
                  className="flex w-full items-center justify-center rounded-md border border-gray-500 bg-[#5865F2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#4752C4]"
                  type="submit"
                  name="provider"
                  value="discord"
                >
                  <FaDiscord className="mr-2 h-5 w-5" />
                  Sign in with Discord
                </button>
              </form>
            </div>
          )}
          <SocialMediaLinks />
        </div>
      </div>
    </div>
  );
}
