'use client';

import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import OauthSignIn from '@/components/AuthForms/OauthSignIn';
import Card from '@/components/Card';
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
    <div className="height-screen-helper flex justify-center">
      <div className="m-auto flex w-80 max-w-lg flex-col justify-between p-3">
        <Card
          title="Sign In"
          description="Choose your preferred sign in method"
        >
          {allowOauth && <OauthSignIn />}
          {/* Add other sign-in components as needed */}
        </Card>
      </div>
    </div>
  );
}
