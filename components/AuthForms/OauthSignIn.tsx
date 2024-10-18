'use client';

import { signInWithOAuth } from '@/utils/auth-helpers/client';
import { FcGoogle } from 'react-icons/fc';

export default function OAuthSignIn() {
  return (
    <form onSubmit={(e) => signInWithOAuth(e)}>
      <button
        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        type="submit"
        name="provider"
        value="google"
      >
        <FcGoogle className="mr-2 h-5 w-5" />
        Sign in with Google
      </button>
    </form>
  );
}
