'use client';

import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import OauthSignIn from '@/components/AuthForms/OauthSignIn';
import { Scene } from "@/components/Scene/Scene";
import Link from 'next/link';
import { FaDiscord, FaInstagram, FaTwitter } from 'react-icons/fa';
import { russo, oxanium } from '@/fonts';
import {
  getAuthTypes,
  getDefaultSignInView
} from '@/utils/auth-helpers/settings';

export default function SignIn() {
  const session = useSession();
  const router = useRouter();

  if (session) {
    router.push('/');
    return null;
  }

  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const defaultSignInView = getDefaultSignInView();

  return (
    <div className="flex h-screen">
      <div className="w-1/2 relative">
        <Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
      </div>
      <div className="w-1/2 flex flex-col justify-center items-center bg-black">
        <div className="w-96 max-w-xl">
          <h1 className={`text-5xl mb-6 text-white ${russo.className}`}>
            Ready to use RTHMN?
          </h1>
          <p className={`text-xl mb-10 text-gray-300 ${oxanium.className}`}>
            Sign in to get started
          </p>
          <p className={`text-lg mb-6 text-gray-400 ${oxanium.className}`}>
            Choose your preferred sign in method
          </p>
          {allowOauth && <OauthSignIn />}
          {/* Add other sign-in components as needed */}
          <div className="mt-12 flex justify-center space-x-8">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaDiscord size={32} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaInstagram size={32} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaTwitter size={32} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
