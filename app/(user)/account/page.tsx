import CustomerPortalForm from '@/components/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/AccountForms/EmailForm';
import NameForm from '@/components/AccountForms/NameForm';
import DiscordConnectionForm from '@/components/AccountForms/DiscordConnectionForm';
import ProfilePhotoForm from '@/components/AccountForms/ProfilePhotoForm';
import { createClient } from '@/utils/supabase/server';
import {
  getSubscription,
  getUser,
  getUserDetails,
  getDiscordConnection
} from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function Account() {
  const supabase = await createClient();
  const [user, userDetails, subscription, discordConnection] =
    await Promise.all([
      getUser(supabase),
      getUserDetails(supabase),
      getSubscription(supabase),
      getDiscordConnection(supabase)
    ]);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <section className="mb-32">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Account
          </h1>
        </div>
      </div>
      <div className="p-4">
        <ProfilePhotoForm
          avatarUrl={userDetails?.avatar_url}
          userId={user.id}
        />
        <CustomerPortalForm subscription={subscription} />
        <DiscordConnectionForm
          discordConnection={discordConnection}
          subscription={subscription}
        />
        <NameForm userName={userDetails?.full_name ?? ''} />
        <EmailForm userEmail={user.email} />
      </div>
    </section>
  );
}
