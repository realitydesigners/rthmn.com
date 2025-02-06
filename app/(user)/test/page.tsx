'use client';

import React from 'react';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useUser } from '@/providers/UserProvider';
import PairUniverse from './PairUniverse';

export default function TestPage() {
    const { pairData } = useDashboard();
    const { selectedPairs } = useUser();

    return (
        <main className='relative h-screen w-full overflow-hidden'>
            {/* <App /> */}
            <PairUniverse selectedPairs={selectedPairs} pairData={pairData} />
        </main>
    );
}
