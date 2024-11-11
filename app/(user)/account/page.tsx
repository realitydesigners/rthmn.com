import CustomerPortalForm from '@/app/(user)/account/CustomerPortalForm';
import EmailForm from '@/app/(user)/account/EmailForm';
import NameForm from '@/app/(user)/account/NameForm';
import DiscordConnectionForm from '@/app/(user)/account/DiscordConnectionForm';
import ProfilePhotoForm from '@/app/(user)/account/ProfilePhotoForm';
import { createClient } from '@/utils/supabase/server';
import {
  getSubscription,
  getUser,
  getUserDetails,
  getDiscordConnection
} from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { FaUser, FaCreditCard } from 'react-icons/fa';

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
    <div className="min-h-screen bg-black">
      {/* Content Container */}
      <div className="relative mx-auto max-w-7xl px-4 pt-64 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="-mt-32 mb-12">
          <div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-end sm:space-x-6 sm:space-y-0">
            <div className="relative h-40 w-40 flex-shrink-0">
              <ProfilePhotoForm
                avatarUrl={userDetails?.avatar_url}
                userId={user.id}
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-outfit text-gray-gradient relative z-10 text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
                {user.user_metadata?.full_name || 'Your Profile'}
              </h2>
              <p className="mt-2 font-outfit text-lg text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 pb-20 md:grid-cols-2">
          {/* Account Details Section */}
          <div className="space-y-6">
            <div className="group relative overflow-hidden rounded-md border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300">
              <h2 className="relative z-10 mb-6 flex items-center gap-2 font-russo text-xl font-semibold text-white">
                <div className="rounded-md bg-white/5 p-3 backdrop-blur-sm">
                  <FaUser className="h-5 w-5 text-[#22c55e]" />
                </div>
                Account Details
              </h2>
              <div className="relative z-10 space-y-6">
                <NameForm userName={user.user_metadata?.full_name} />
                <EmailForm userEmail={user.email} />
              </div>
            </div>
          </div>

          {/* Subscription & Connections Section */}
          <div className="space-y-6">
            <div className="group relative overflow-hidden rounded-md border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300">
              <h2 className="relative z-10 mb-6 flex items-center gap-2 font-russo text-xl font-semibold text-white">
                <div className="rounded-md bg-white/5 p-3 backdrop-blur-sm">
                  <FaCreditCard className="h-5 w-5 text-[#22c55e]" />
                </div>
                Subscription & Connections
              </h2>
              <div className="relative z-10 space-y-6">
                <CustomerPortalForm subscription={subscription} />
                <DiscordConnectionForm
                  discordConnection={discordConnection}
                  subscription={subscription}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
