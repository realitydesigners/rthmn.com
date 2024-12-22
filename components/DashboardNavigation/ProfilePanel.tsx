'use client';
import { useAuth } from '@/providers/SupabaseProvider';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LuUser, LuCreditCard, LuLogOut, LuSettings } from 'react-icons/lu';
import { FaDiscord } from 'react-icons/fa';

const menuItems = [
    {
        icon: LuUser,
        label: 'Account',
        href: '/account',
    },
    {
        icon: LuCreditCard,
        label: 'Subscription',
        href: '/account',
    },
    {
        icon: LuSettings,
        label: 'Settings',
        href: '/account',
    },
] as const;

interface MenuButtonProps {
    icon: any;
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'danger';
}

const MenuButton = ({ icon: Icon, label, href, onClick, variant = 'default' }: MenuButtonProps) => {
    const baseStyles = 'flex items-center justify-between rounded-md my-4 bg-gradient-to-b p-[1px]  transition-all duration-200';
    const variantStyles =
        variant === 'danger' ? 'from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30' : 'from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]';

    const textColor = variant === 'danger' ? 'text-red-500' : 'text-white';

    const Button = (
        <div className={`${baseStyles} ${variantStyles} w-full`}>
            <div className='flex w-full items-center gap-3 rounded-md bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-4 py-3'>
                <div className='rounded-md bg-white/5 p-2'>
                    <Icon className={`h-4 w-4 ${textColor}`} />
                </div>
                <span className={`font-outfit text-sm ${textColor}`}>{label}</span>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href}>{Button}</Link>;
    }

    return (
        <button onClick={onClick} className='w-full'>
            {Button}
        </button>
    );
};

export const ProfilePanel = () => {
    const { user, signOut, userDetails } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
        } catch (error) {
        } finally {
            setIsSigningOut(false);
        }
    };

    const userInitial = user?.user_metadata?.full_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || '?';

    if (!user) return null;

    return (
        <div className='fixed bottom-0 left-1/2 z-[90] h-[px] w-screen -translate-x-1/2 rounded-[2.5em] border-t border-[#222] bg-black pb-20'>
            <div className='scrollbar-none h-full overflow-y-auto px-4 pt-8'>
                {/* Profile Header */}
                <div className='mb-6'>
                    <div className='flex flex-col items-center'>
                        <div className='relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-black'>
                            {userDetails?.avatar_url ? (
                                <Image src={userDetails.avatar_url} alt='Profile' className='object-cover' width={80} height={80} />
                            ) : (
                                <span className='text-lg font-bold'>{userInitial}</span>
                            )}
                        </div>
                        <div className='mt-4 text-center'>
                            <h2 className='font-outfit text-xl font-bold text-white'>{user.user_metadata?.full_name || 'Your Profile'}</h2>
                            <p className='font-outfit mt-1 text-sm text-zinc-400'>{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className='space-y-2 px-2'>
                    {menuItems.map((item) => (
                        <MenuButton key={item.label} icon={item.icon} label={item.label} href={item.href} />
                    ))}

                    <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-[#222]'></div>
                        </div>
                    </div>

                    <MenuButton icon={LuLogOut} label={isSigningOut ? 'Signing out...' : 'Sign out'} onClick={handleSignOut} variant='danger' />
                </div>
            </div>
        </div>
    );
};
