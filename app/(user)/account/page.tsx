'use client';
import { useUser } from '@/providers/UserProvider';
import { redirect } from 'next/navigation';
import CustomerPortalForm from './CustomerPortalForm';

import DiscordConnectionForm from './DiscordConnectionForm';
import ProfilePhotoForm from './ProfilePhotoForm';
import { LuUser, LuCreditCard } from 'react-icons/lu';
import { FaDiscord } from 'react-icons/fa';

export default function AccountContent() {
    const { user, userDetails, subscription, discordConnection, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='h-8 w-32 animate-pulse rounded-md bg-white/5' />
            </div>
        );
    }

    if (!user) {
        redirect('/signin');
    }

    return (
        <div className='min-h-screen'>
            <div className='mx-auto max-w-7xl px-4 py-16'>
                {/* Profile Header */}
                <div className='mb-16 text-center'>
                    <div className='mx-auto mb-6 w-32'>
                        <ProfilePhotoForm avatarUrl={userDetails?.avatar_url} userId={user.id} />
                    </div>
                    <h1 className='font-outfit text-3xl font-bold text-white'>{user.user_metadata?.full_name || 'Your Profile'}</h1>
                    <p className='font-outfit mt-2 text-zinc-400'>{user.email}</p>
                </div>
                <div className='mx-auto max-w-4xl space-y-8'>
                    <div className='space-y-6'>
                        <div className='grid gap-6 md:grid-cols-2'>
                            <NameForm userName={user.user_metadata?.full_name} />
                            <EmailForm userEmail={user.email} />
                        </div>
                    </div>
                    <div className='space-y-6'>
                        <CustomerPortalForm subscription={subscription} />
                    </div>
                    <div className='space-y-6'>
                        <DiscordConnectionForm discordConnection={discordConnection} subscription={subscription} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const NameForm = ({ userName }: { userName: string }) => {
    return (
        <div className='flex items-center gap-3'>
            <p className='font-outfit text-lg font-medium text-zinc-100'>{userName || 'No name set'}</p>
        </div>
    );
};

const EmailForm = ({ userEmail }: { userEmail: string | undefined }) => {
    return (
        <div className='flex items-center gap-3'>
            <p className='font-outfit text-lg font-medium text-zinc-100'>{userEmail || 'No email set'}</p>
        </div>
    );
};
