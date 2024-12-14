'use client';

import { useUser } from '@/providers/UserProvider';
import { redirect } from 'next/navigation';
import CustomerPortalForm from './CustomerPortalForm';
import EmailForm from './EmailForm';
import NameForm from './NameForm';
import DiscordConnectionForm from './DiscordConnectionForm';
import ProfilePhotoForm from './ProfilePhotoForm';
import { FaUser, FaCreditCard } from 'react-icons/fa';

export default function AccountContent() {
  const { user, userDetails, subscription, discordConnection, isLoading } =
    useUser();

  if (isLoading) {
    return <div>Loading...</div>; // Add your loading component
  }

  if (!user) {
    redirect('/signin');
  }

  return (
    <>
      {/* Profile Header */}
      <div className="-mt-32 mb-12">
        <div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-end sm:space-y-0 sm:space-x-6">
          <div className="relative h-40 w-40 shrink-0">
            <ProfilePhotoForm
              avatarUrl={userDetails?.avatar_url}
              userId={user.id}
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-gray-gradient font-outfit relative z-10 text-4xl leading-tight font-bold tracking-tight lg:text-5xl">
              {user.user_metadata?.full_name || 'Your Profile'}
            </h2>
            <p className="font-outfit mt-2 text-lg text-zinc-400">
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
            <h2 className="font-russo relative z-10 mb-6 flex items-center gap-2 text-xl font-semibold text-white">
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
            <h2 className="font-russo relative z-10 mb-6 flex items-center gap-2 text-xl font-semibold text-white">
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
    </>
  );
}
