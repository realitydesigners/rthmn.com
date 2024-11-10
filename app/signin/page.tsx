'use client';
import { useRouter } from 'next/navigation';
import { Scene } from '@/components/Scene/Scene';
import { useSignInWithOAuth } from '@/utils/auth-helpers/client';
import { FcGoogle } from 'react-icons/fc';
import { useEffect, useState } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { getAuthTypes } from '@/utils/auth-helpers/settings';
import { SocialMediaLinks } from '@/components/SocialMediaLinks';
import type { Provider } from '@supabase/supabase-js';
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
      <div className="relative hidden h-full w-1/2 lg:block">
        <Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
      </div>
      <div className="flex w-full flex-col items-center justify-center bg-black lg:w-1/2">
        <div className="w-96 max-w-xl">
          <h1 className={`mb-6 font-outfit text-5xl font-bold text-white`}>
            Ready to use RTHMN?
          </h1>
          <p className={`mb-10 font-kodemono text-xl text-gray-300`}>
            Sign in to get started
          </p>

          {allowOauth && (
            <div className="space-y-4">
              <form onSubmit={(e) => handleSignIn(e)}>
                <button
                  className="flex w-full items-center justify-center space-x-3 rounded-md bg-gradient-to-b from-gray-100 to-gray-300 p-[2px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-gray-200 hover:to-gray-400"
                  type="submit"
                  name="provider"
                  value="google"
                  disabled={isLoading}
                >
                  <span className="flex w-full items-center justify-center rounded-md bg-gradient-to-b from-white to-gray-50 px-6 py-3 text-base font-medium text-gray-700">
                    <FcGoogle className="mr-3 h-6 w-6" />
                    {isLoading ? 'Signing in...' : 'Sign in with Google'}
                  </span>
                </button>
              </form>
              <form onSubmit={(e) => handleSignIn(e)}>
                <button
                  className="flex w-full items-center justify-center space-x-3 rounded-md bg-gradient-to-b from-[#5865F2] to-[#4752C4] p-[2px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#6B77FF] hover:to-[#5865F2]"
                  type="submit"
                  name="provider"
                  value="discord"
                  disabled={isLoading}
                >
                  <span className="flex w-full items-center justify-center rounded-md bg-gradient-to-b from-[#4752C4] to-[#3C45A5] px-6 py-3 text-base font-medium text-white">
                    <FaDiscord className="mr-3 h-6 w-6" />
                    {isLoading ? 'Signing in...' : 'Sign in with Discord'}
                  </span>
                </button>
              </form>
            </div>
          )}
          <div className="mt-8">
            <SocialMediaLinks />
          </div>
        </div>
      </div>
    </div>
  );
}
