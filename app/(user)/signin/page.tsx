import OauthSignIn from '@/components/AuthForms/OauthSignIn';
import Card from '@/components/Card';
import {
  getAuthTypes,
  getDefaultSignInView
} from '@/utils/auth-helpers/settings';
import { getServerClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignIn() {
  const supabase = await getServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/');
  }

  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const defaultSignInView = getDefaultSignInView();

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
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
