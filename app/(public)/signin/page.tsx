'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scene } from '@/components/Scene/Scene';
import { useSignInWithOAuth } from '@/utils/auth-helpers/client';
import { FcGoogle } from 'react-icons/fc';
import { useEffect, useState } from 'react';
import { getAuthTypes } from '@/utils/auth-helpers/settings';
import { IconType } from 'react-icons';
import { FaDiscord, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
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

    try {
      await signInWithOAuth(e, 'google');
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
            Sign in with Google to get started
          </p>

          {allowOauth && (
            <div className="space-y-4">
              <form onSubmit={handleSignIn}>
                <button
                  className="flex w-full items-center justify-center space-x-3 rounded-md bg-linear-to-b from-gray-100 to-gray-300 p-[2px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-gray-200 hover:to-gray-400"
                  type="submit"
                  disabled={isLoading}
                >
                  <span className="flex w-full items-center justify-center rounded-md bg-linear-to-b from-white to-gray-50 px-6 py-3 text-base font-medium text-gray-700">
                    <FcGoogle className="mr-3 h-6 w-6" />
                    {isLoading ? 'Signing in...' : 'Sign in with Google'}
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

const socialMediaLinks: { icon: IconType; href: string }[] = [
  { icon: FaDiscord, href: '#' },
  { icon: FaInstagram, href: '#' },
  { icon: FaTwitter, href: '#' },
  { icon: FaYoutube, href: '#' }
];

function SocialMediaLinks() {
  return (
    <div className="mt-12 flex justify-center space-x-8">
      {socialMediaLinks.map((social, index) => (
        <Link
          key={index}
          href={social.href}
          className="text-gray-400 transition-colors duration-200 hover:text-white"
        >
          <social.icon size={32} />
        </Link>
      ))}
    </div>
  );
}
