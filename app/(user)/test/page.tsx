'use client';

import React from 'react';
import App from '@/app/(user)/test/SplineScene';
import { useDashboard } from '@/providers/DashboardProvider/client';
import PairUniverse from './PairUniverse';

export default function TestPage() {
    const { selectedPairs, pairData } = useDashboard();

    return (
        <main className='relative h-screen w-full overflow-hidden'>
            {/* <App /> */}
            <PairUniverse selectedPairs={selectedPairs} pairData={pairData} />
        </main>
    );
}
