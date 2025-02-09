'use client';

import { useDashboard } from '@/providers/DashboardProvider/client';
import { useUser } from '@/providers/UserProvider';
import { useGridStore } from '@/stores/gridStore';
import { NoInstruments } from './LoadingSkeleton';
import { PairResoBox } from './PairResoBox';
import { useEffect, useState, useCallback } from 'react';

export default function Dashboard() {
    const { pairData, isLoading } = useDashboard();
    const { selectedPairs, boxColors, isSidebarInitialized } = useUser();
    const getGridClass = useGridStore((state) => state.getGridClass);
    const breakpoints = useGridStore((state) => state.breakpoints);
    const [gridClass, setGridClass] = useState('');

    const updateGridClass = useCallback(() => {
        const width = document.querySelector('main')?.clientWidth || window.innerWidth;
        setGridClass(getGridClass(width));
    }, [getGridClass]);

    // Handle resize events
    useEffect(() => {
        const resizeObserver = new ResizeObserver(updateGridClass);
        const main = document.querySelector('main');
        if (main) {
            resizeObserver.observe(main);
        }

        return () => resizeObserver.disconnect();
    }, [updateGridClass]);

    // Handle store changes
    useEffect(() => {
        updateGridClass();
    }, [updateGridClass, breakpoints]);

    if (!selectedPairs.length && !isLoading) {
        return (
            <main className='w-full px-2 pt-16 sm:px-4 lg:px-6 lg:pt-18'>
                <NoInstruments />
                <div className='mt-4 text-center text-sm text-gray-400'>Please complete the onboarding process to select your trading pairs.</div>
            </main>
        );
    }

    return (
        <main className='w-full px-2 pt-16 sm:px-4 lg:pt-18'>
            <div className={gridClass}>
                {selectedPairs.map((pair) => {
                    const data = pairData[pair];
                    if (!data?.boxes?.[0]) return null;

                    return (
                        <PairResoBox
                            key={`${pair}-${isLoading ? 'loading' : 'loaded'}`}
                            pair={pair}
                            boxSlice={{
                                ...data.boxes[0],
                                boxes: data.boxes[0].boxes.map((box) => ({
                                    ...box,
                                    direction: box.value > 0 ? 'up' : 'down',
                                })),
                            }}
                            boxColors={boxColors}
                            isLoading={isLoading}
                            currentOHLC={data.currentOHLC}
                        />
                    );
                })}
            </div>
        </main>
    );
}
