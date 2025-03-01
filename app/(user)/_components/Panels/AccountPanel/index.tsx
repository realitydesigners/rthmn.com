'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import CustomerPortalForm from './CustomerPortalForm';
import DiscordConnectionForm from './DiscordConnectionForm';
import ProfilePhotoForm from './ProfilePhotoForm';
import { LuCreditCard, LuLogOut } from 'react-icons/lu';
import { FaDiscord } from 'react-icons/fa';

const AccountPanel = () => {
    const { user, userDetails, subscription, discordConnection, isLoading, signOut } = useAuth();
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    // Handle redirect when user is null (after sign out or not authenticated)
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            // Clear local state first to improve perceived performance
            await signOut();
            // The redirect will happen via the useEffect above once user state is cleared
        } catch (error) {
            console.error('Error signing out:', error);
            setIsSigningOut(false);
        }
    };

    if (isLoading) {
        return (
            <div className='flex min-h-full w-full items-center justify-center py-8'>
                <div className='h-8 w-32 animate-pulse rounded-md bg-white/5' />
            </div>
        );
    }

    // Early return if no user, but let the useEffect handle the redirect
    if (!user) {
        return (
            <div className='flex min-h-full w-full items-center justify-center py-8'>
                <div className='h-8 w-32 animate-pulse rounded-md bg-white/5' />
            </div>
        );
    }

    return (
        <div className='scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 h-full w-full overflow-auto pb-6'>
            <div className='mx-auto w-full max-w-md px-4 sm:px-6'>
                {/* Profile Header */}
                <div className='flex flex-col items-center justify-center pt-8 pb-8'>
                    <div className='relative mb-5 h-28 w-28 overflow-hidden rounded-full border-2 border-gray-800/40 shadow-lg'>
                        <ProfilePhotoForm avatarUrl={userDetails?.avatar_url} userId={user.id} />
                    </div>
                    <h1 className='font-outfit mb-2 text-center text-2xl font-bold text-white'>{user.user_metadata?.full_name || 'Your Profile'}</h1>
                    <p className='font-outfit max-w-full text-center text-sm break-words text-zinc-400'>{user.email}</p>
                </div>

                {/* Account Sections Container */}
                <div className='rounded-xl border border-white/5 bg-black/30 shadow-sm backdrop-blur-sm'>
                    {/* Subscription Section */}
                    {subscription && (
                        <div className='border-b border-white/10 p-4'>
                            <CustomerPortalForm subscription={subscription} />
                        </div>
                    )}

                    {/* Discord Connection */}
                    <div className='border-b border-white/10 p-4'>
                        <DiscordConnectionForm discordConnection={discordConnection} subscription={subscription} />
                    </div>

                    {/* Sign Out Section */}
                    <div className='p-4'>
                        <div className='flex flex-col items-start gap-4'>
                            <div className='flex items-center gap-3'>
                                <div className='flex-shrink-0 rounded-md bg-white/5 p-2'>
                                    <LuLogOut className='h-5 w-5 text-white' />
                                </div>
                                <div className='min-w-0'>
                                    <h3 className='font-outfit text-base font-semibold text-white sm:text-lg'>Account Access</h3>
                                    <p className='font-outfit text-xs text-zinc-400 sm:text-sm'>Sign out of your account</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                                className='mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-red-500/10 px-6 py-2.5 text-red-500 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-50'>
                                <LuLogOut className='h-5 w-5' />
                                <span className='font-outfit text-sm font-medium'>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='mt-6 text-center'>
                    <p className='font-outfit text-xs text-zinc-500'>&copy; {new Date().getFullYear()} Rthmn. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AccountPanel;
