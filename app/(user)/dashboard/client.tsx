'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { BoxDetailsRow } from '@/components/BoxDetailsRow';
import { PairResoBox } from './PairResoBox';
import { NoInstruments } from './LoadingSkeleton';
import { getSidebarState } from '@/utils/localStorage';

// Custom hook to handle grid layout based on sidebar states
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
    const { pairData, selectedPairs, isLoading, isAuthenticated, boxColors } = useDashboard();
    const gridClass = useGridLayout();

    // Memoize the filtered data
    const filteredPairData = useMemo(() => {
        if (isLoading) {
            // Return placeholder data for loading state
            return Array(3)
                .fill(null)
                .map((_, i) => ({
                    pair: '',
                    boxSlice: null,
                    currentOHLC: null,
                    index: i,
                }));
        }

        return selectedPairs
            .map((pair) => {
                const data = pairData[pair];
                if (!data?.boxes?.length) {
                    return null;
                }
                return data.boxes.map((boxSlice, index) => ({
                    pair,
                    boxSlice,
                    currentOHLC: data.currentOHLC,
                    index,
                }));
            })
            .filter(Boolean)
            .flat();
    }, [selectedPairs, pairData, isLoading]);

    if (!selectedPairs.length && !isLoading) {
        return (
            <main className='w-full px-2 pt-16 sm:px-4 lg:px-6 lg:pt-18'>
                <NoInstruments />
            </main>
        );
    }

    return (
        <main className='w-full px-2 pt-16 sm:px-4 lg:px-6 lg:pt-18'>
            <div className={gridClass}>
                {filteredPairData.map(({ pair, boxSlice, currentOHLC, index }) => (
                    <PairResoBox
                        key={isLoading ? index : `${pair}-${boxSlice?.timestamp}-${index}`}
                        pair={pair}
                        boxSlice={boxSlice}
                        currentOHLC={currentOHLC}
                        boxColors={boxColors}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </main>
    );
}
