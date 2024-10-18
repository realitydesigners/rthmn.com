import OauthSignIn from '@/components/AuthForms/OauthSignIn';
import Card from '@/components/Card';
import {
  getAuthTypes,
  getDefaultSignInView
} from '@/utils/auth-helpers/settings';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignIn({ params }: { params: { id: string } }) {
  const { allowOauth } = getAuthTypes();

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/');
  }

  if (params.id !== 'signin') {
    return redirect('/signin/signin');
  }

  return (
    <div className="height-screen-helper flex justify-center">
      <div className="m-auto flex w-80 max-w-lg flex-col justify-between p-3">
        <Card title="Sign In">{allowOauth && <OauthSignIn />}</Card>
      </div>
    </div>
  );
}
