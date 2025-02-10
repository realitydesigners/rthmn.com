'use client';

import React from 'react';
import { LuGraduationCap, LuSettings } from 'react-icons/lu';
import { OnboardingContent } from '@/app/(user)/onboarding/_components/FeatureTour/OnboardingContent';
import { SettingsContent } from '@/app/(user)/onboarding/_components/FeatureTour/SettingsContent';
import { SettingsBar } from '../Panels/BoxUXPanel';
import { Onboarding } from '../Panels/OnboardingPanel';
import { Sidebar } from '../Sidebar';

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
    ];

    return <Sidebar position='right' buttons={buttons} defaultPanel='onboarding' />;
};
