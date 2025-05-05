'use client';

import { InstrumentsContent } from '@/app/(user)/onboarding/_components/FeatureTour/InstrumentsContent';
import { VisualizerContent } from '@/app/(user)/onboarding/_components/FeatureTour/VisualizerContent';
import { BoxDataPanel } from '@/components/Panels/BoxDataPanel';
import { InstrumentsPanel } from '@/components/Panels/InstrumentsPanel';
import { Sidebar } from '@/components/Sidebars/Sidebar';
import { LuLayoutGrid, LuLineChart } from 'react-icons/lu';

export const SidebarLeft = () => {
    const buttons = [
        {
            id: 'instruments',
            icon: LuLineChart,
            tourContent: <InstrumentsContent />,
            panelContent: <InstrumentsPanel />,
        },
        {
            id: 'visualizer',
            icon: LuLayoutGrid,
            tourContent: <VisualizerContent />,
            panelContent: <BoxDataPanel />,
        },
    ];

    return <Sidebar position='left' buttons={buttons} defaultPanel='instruments' />;
};
