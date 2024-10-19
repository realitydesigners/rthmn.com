import OauthSignIn from '@/components/AuthForms/OauthSignIn';
import Card from '@/components/Card';
import {
  getAuthTypes,
  getDefaultSignInView
} from '@/utils/auth-helpers/settings';
import { getServerClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignIn() {
  const { allowOauth } = getAuthTypes();

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = getServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/');
  }

  return (
    <div className="height-screen-helper flex justify-center">
      <div className="m-auto flex w-80 max-w-lg flex-col justify-between p-3">
        <Card title="Sign In">{allowOauth && <OauthSignIn />}</Card>
      </div>
    </div>
  );
}
