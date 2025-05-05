'use client';
import { useAuth } from '@/providers/SupabaseProvider';
import Image from 'next/image';
import { LuUser } from 'react-icons/lu';

export const ProfileIcon = ({ className }: { className?: string }) => {
    const { userDetails } = useAuth();

    // Use user's avatar if available, otherwise use a fallback icon
    if (userDetails?.avatar_url) {
        return (
            <div className='relative flex h-full w-full items-center justify-center'>
                <div className='h-8 w-8 overflow-hidden rounded-full border border-neutral-700/50'>
                    <Image
                        src={userDetails.avatar_url}
                        alt='Profile'
                        width={20}
                        height={20}
                        className='h-full w-full object-cover'
                        priority
                    />
                </div>
            </div>
        );
    }

    // Fallback to user icon
    return <LuUser className={className} />;
};
