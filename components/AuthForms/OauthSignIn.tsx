'use client';

import { signInWithOAuth } from '@/utils/auth-helpers/client';
import { FcGoogle } from 'react-icons/fc';
import { FaDiscord } from 'react-icons/fa'; // Import Discord icon

export default function OAuthSignIn() {
  return (
    <div className="space-y-2">
      <form onSubmit={(e) => signInWithOAuth(e, 'google')}>
        <button
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          type="submit"
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Sign in with Google
        </button>
      </form>
      <form onSubmit={(e) => signInWithOAuth(e, 'discord')}>
        <button
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-[#5865F2] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#4752C4] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          type="submit"
        >
          <FaDiscord className="mr-2 h-5 w-5" />
          Sign in with Discord
        </button>
      </form>
    </div>
  );
}
