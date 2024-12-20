'use client';
import React, { useMemo, useEffect } from 'react';
import { useDashboard } from '@/providers/DashboardProvider';
import { BoxDetailsRow } from '@/components/BoxDetailsRow';
import { PairResoBox } from './PairResoBox';
import { NoInstruments } from './LoadingSkeleton';

export default function Dashboard() {
    const { pairData, selectedPairs, isLoading, isAuthenticated, boxColors } = useDashboard();

    // Log when boxColors changes
    useEffect(() => {
        console.log('Dashboard received new boxColors:', boxColors);
    }, [boxColors]);

    // Memoize the filtered data
    const filteredPairData = useMemo(() => {
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
    }, [selectedPairs, pairData]);

    return (
        <main className='w-full'>
            <div className='flex-overflow-hidden'>
                <div className='pt-13'>
                    {selectedPairs.length > 0 ? (
                        <div className='grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] justify-center'>
                            {filteredPairData.map(({ pair, boxSlice, currentOHLC }) => (
                                <PairResoBox
                                    key={`${pair}-${boxSlice.timestamp}-${JSON.stringify(boxColors)}`}
                                    pair={pair}
                                    boxSlice={boxSlice}
                                    currentOHLC={currentOHLC}
                                    boxColors={boxColors}
                                />
                            ))}
                        </div>
                    ) : (
                        <NoInstruments />
                    )}
                </div>
            </div>
        </main>
    );
}
