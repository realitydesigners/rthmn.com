'use client';

import { OnboardingContent } from '@/app/(user)/onboarding/_components/FeatureTour/OnboardingContent';
import { SettingsContent } from '@/app/(user)/onboarding/_components/FeatureTour/SettingsContent';
import { AccountPanel } from '@/components/Panels/AccountPanel';
import { BoxUXPanel } from '@/components/Panels/BoxUXPanel';
import { Onboarding } from '@/components/Panels/OnboardingPanel';
import { Sidebar } from '@/components/Sidebars/Sidebar';
import { LuGraduationCap, LuSettings } from 'react-icons/lu';
import { ProfileIcon } from '@/components/Badges/ProfileIcon';

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
            panelContent: <BoxUXPanel />,
        },
        {
            id: 'account',
            icon: ProfileIcon,
            tourContent: <></>,
            panelContent: <AccountPanel />,
        },
    ];

    return <Sidebar position='right' buttons={buttons} defaultPanel='onboarding' />;
};
