'use client';

import React from 'react';
import { LuGraduationCap, LuSettings, LuUser } from 'react-icons/lu';
import { OnboardingContent } from '@/app/(user)/onboarding/_components/FeatureTour/OnboardingContent';
import { SettingsContent } from '@/app/(user)/onboarding/_components/FeatureTour/SettingsContent';
import { SettingsBar } from '../Panels/BoxUXPanel';
import { Onboarding } from '../Panels/OnboardingPanel';
import { Sidebar } from '../Sidebar';
import { useAuth } from '@/providers/SupabaseProvider';
import Image from 'next/image';
import AccountPanel from '../Panels/AccountPanel';

// Custom ProfileIcon component that displays user avatar or fallback icon
const ProfileIcon = ({ className }: { className?: string }) => {
    const { user, userDetails } = useAuth();

    // Use user's avatar if available, otherwise use a fallback icon
    if (userDetails?.avatar_url) {
        return (
            <div className='relative flex h-full w-full items-center justify-center'>
                <div className='h-5 w-5 overflow-hidden rounded-full border border-gray-700/50'>
                    <Image src={userDetails.avatar_url} alt='Profile' width={20} height={20} className='h-full w-full object-cover' priority />
                </div>
            </div>
        );
    }

    // Fallback to user icon
    return <LuUser className={className} />;
};

export const SidebarRight = () => {
    const buttons = [
        {
            id: 'onboarding',
            icon: LuGraduationCap,
            tourContent: <OnboardingContent />,
            panelContent: <Onboarding />,
        },
        {
            id: 'settings',
            icon: LuSettings,
            tourContent: <SettingsContent />,
            panelContent: <SettingsBar />,
        },
        {
            id: 'account',
            icon: ProfileIcon,
            tourContent: <div>Manage your account settings and profile information</div>,
            panelContent: <AccountPanel />,
        },
    ];

    return <Sidebar position='right' buttons={buttons} defaultPanel='onboarding' />;
};
