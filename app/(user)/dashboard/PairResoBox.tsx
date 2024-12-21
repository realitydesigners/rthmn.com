'use client';

import { BoxSlice, OHLC } from '@/types/types';
import { ResoBox } from '@/components/ResoBox';
import { BoxColors } from '@/utils/localStorage';
import React, { useMemo } from 'react';

interface PairResoBoxProps {
    pair: string;
    boxSlice: BoxSlice;
    currentOHLC: OHLC;
    boxColors: BoxColors;
}

// Memoize the price display to prevent unnecessary re-renders
const PriceDisplay = React.memo(({ pair, closePrice }: { pair: string; closePrice: string | number }) => (
    <div className='flex w-full items-center gap-4'>
        <div className='font-outfit text-lg font-bold tracking-wider'>{pair.toUpperCase()}</div>
        <div className='font-kodemono text-sm font-medium text-gray-200'>{closePrice}</div>
    </div>
));

PriceDisplay.displayName = 'PriceDisplay';

export const PairResoBox = React.memo(
    ({ pair, boxSlice, currentOHLC, boxColors }: PairResoBoxProps) => {
        // Memoize the close price calculation
        const closePrice = useMemo(() => currentOHLC?.close || 'N/A', [currentOHLC?.close]);

        // Create a stable key for ResoBox that only changes when necessary
        const boxKey = useMemo(() => `${pair}-${boxSlice.timestamp}`, [pair, boxSlice.timestamp]);

        return (
            <div className='group m-auto flex w-full flex-col items-center justify-center gap-4 p-12 text-center text-white shadow-md lg:p-16'>
                <div className='w-full'>
                    <ResoBox key={boxKey} slice={boxSlice} className='h-full w-full' boxColors={boxColors} />
                </div>
                <PriceDisplay pair={pair} closePrice={closePrice} />
            </div>
        );
    },
    (prevProps, nextProps) => {
        // Fast equality checks first
        if (prevProps.pair !== nextProps.pair || prevProps.boxSlice.timestamp !== nextProps.boxSlice.timestamp || prevProps.currentOHLC?.close !== nextProps.currentOHLC?.close) {
            return false;
        }

        // Color equality checks
        const colorsDiff = prevProps.boxColors.positive === nextProps.boxColors.positive && prevProps.boxColors.negative === nextProps.boxColors.negative;

        if (!colorsDiff) return false;

        // Only do the expensive JSON.stringify if everything else matches
        return JSON.stringify(prevProps.boxColors.styles) === JSON.stringify(nextProps.boxColors.styles);
    }
);
