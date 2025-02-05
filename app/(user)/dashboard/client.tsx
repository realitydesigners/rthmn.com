'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { getSidebarState } from '@/utils/localStorage';
import { NoInstruments } from './LoadingSkeleton';
import { PairResoBox } from './PairResoBox';

const useGridLayout = () => {
    const { isSidebarInitialized } = useDashboard();
    const [gridClass, setGridClass] = useState('');

    useEffect(() => {
        // Only update grid class after sidebars are initialized
        if (!isSidebarInitialized) {
            setGridClass('invisible');
            return;
        }

        const updateGridClass = () => {
            const sidebarState = getSidebarState();
            const leftLocked = sidebarState.left.locked && sidebarState.left.isOpen;
            const rightLocked = sidebarState.right.locked && sidebarState.right.isOpen;

            // Base classes for mobile and tablet
            let classes = 'grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4';

            // Tablet breakpoint
            classes += ' sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))]';

            // Desktop breakpoint with dynamic sidebar adjustments
            if (leftLocked && rightLocked) {
                classes += ' lg:grid-cols-[repeat(auto-fit,minmax(350px,1fr))]'; // Both sidebars
            } else if (leftLocked || rightLocked) {
                classes += ' lg:grid-cols-[repeat(auto-fit,minmax(375px,1fr))]'; // One sidebar
            } else {
                classes += ' lg:grid-cols-[repeat(auto-fit,minmax(400px,1fr))]'; // No sidebars
            }

            setGridClass(classes);
        };

        // Initial update
        updateGridClass();

        // Listen for sidebar state changes
        const handleStorageChange = () => {
            updateGridClass();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('sidebarStateChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('sidebarStateChange', handleStorageChange);
        };
    }, [isSidebarInitialized]);

    return gridClass;
};

export default function Dashboard() {
    const { pairData, selectedPairs, isLoading, boxColors } = useDashboard();
    const gridClass = useGridLayout();

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
