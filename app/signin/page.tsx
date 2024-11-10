'use client';
import { useRouter } from 'next/navigation';
import { Scene } from '@/components/Scene/Scene';
import { useSignInWithOAuth } from '@/utils/auth-helpers/client';
import { FcGoogle } from 'react-icons/fc';
import { useEffect, useState } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { russo, oxanium } from '@/fonts';
import { getAuthTypes } from '@/utils/auth-helpers/settings';
import { SocialMediaLinks } from '@/components/SocialMediaLinks';
import type { Provider } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/providers/SupabaseProvider';

export default function SignIn() {
  const router = useRouter();
  const signInWithOAuth = useSignInWithOAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const provider = e.currentTarget.provider.value as Provider;

    try {
      await signInWithOAuth(e, provider);
    } catch (error) {
      console.error('OAuth sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { allowOauth } = getAuthTypes();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className={`text-oxanium text-lg text-gray-300`}>
            Signing you in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="relative w-1/2">
        <Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
      </div>
      <div className="flex w-1/2 flex-col items-center justify-center bg-black">
        <div className="w-96 max-w-xl">
          <h1 className={`text-russo mb-6 text-5xl text-white`}>
            Ready to use RTHMN?
          </h1>
          <p className={`text-oxanium mb-10 text-xl text-gray-300`}>
            Sign in to get started
          </p>
          <p className={`text-oxanium mb-6 text-lg text-gray-400`}>
            Choose your preferred sign in method
          </p>
          {allowOauth && (
            <div className="space-y-4">
              <form onSubmit={(e) => handleSignIn(e)}>
                <button
                  className="flex w-full items-center justify-center rounded-md border border-gray-500 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 disabled:opacity-50"
                  type="submit"
                  name="provider"
                  value="google"
                  disabled={isLoading}
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  {isLoading ? 'Signing in...' : 'Sign in with Google'}
                </button>
              </form>
              <form onSubmit={(e) => handleSignIn(e)}>
                <button
                  className="flex w-full items-center justify-center rounded-md border border-gray-500 bg-[#5865F2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#4752C4] disabled:opacity-50"
                  type="submit"
                  name="provider"
                  value="discord"
                  disabled={isLoading}
                >
                  <FaDiscord className="mr-2 h-5 w-5" />
                  {isLoading ? 'Signing in...' : 'Sign in with Discord'}
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
