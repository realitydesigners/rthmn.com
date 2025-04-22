'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import CustomerPortalForm from './CustomerPortalForm';
import DiscordConnectionForm from './DiscordConnectionForm';
import ProfilePhotoForm from './ProfilePhotoForm';
import { LuLogOut } from 'react-icons/lu';

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
            // Sign out and force a hard navigation to clear all React state
            await signOut();

            // Force a complete page reload to ensure all components reflect the signed-out state
            window.location.href = '/';
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
        <div className='scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 h-full w-full overflow-auto'>
            <div className='w-full'>
                {/* Profile Header */}
                <div className='flex flex-col items-center justify-center border-b border-white/5 py-6'>
                    <div className='relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-neutral-800/40'>
                        <ProfilePhotoForm avatarUrl={userDetails?.avatar_url} userId={user.id} />
                    </div>
                    <div className='flex items-center'>
                        <h1 className='font-outfit mb-1 text-center text-xl font-bold text-white'>{user.user_metadata?.full_name || 'Your Profile'}</h1>
                    </div>
                    <p className='font-outfit max-w-full text-center text-sm break-words text-zinc-400'>{user.email}</p>
                </div>

                {/* Account Sections */}
                <div>
                    {/* Subscription Section */}
                    {subscription && (
                        <div className='border-b border-white/5 px-4 py-3'>
                            <CustomerPortalForm subscription={subscription} />
                        </div>
                    )}

                    {/* Discord Connection */}
                    <div className='border-b border-white/5 px-4 py-3'>
                        <DiscordConnectionForm discordConnection={discordConnection} subscription={subscription} />
                    </div>

                    {/* Sign Out Section */}
                    <div className='px-4 py-3'>
                        <div>
                            <div className='flex items-center gap-3'>
                                <div className='flex-shrink-0 rounded-md bg-white/5 p-2'>
                                    <LuLogOut className='h-4 w-4 text-white' />
                                </div>
                                <div className='min-w-0'>
                                    <h3 className='font-outfit text-base font-semibold text-white'>Account Access</h3>
                                    <p className='font-outfit text-xs text-zinc-400'>Sign out of your account</p>
                                </div>
                            </div>

                            <div className='mt-3 pl-9'>
                                <button
                                    onClick={handleSignOut}
                                    disabled={isSigningOut}
                                    className='flex w-auto items-center justify-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-red-500 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-50'>
                                    <LuLogOut className='h-4 w-4' />
                                    <span className='font-outfit text-sm'>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='mt-4 pb-4 text-center'>
                    <p className='font-outfit text-xs text-zinc-500'>© {new Date().getFullYear()} Rthmn</p>
                </div>
            </div>
        </div>
    );
};

export default AccountPanel;
