'use client';

import { BoxSlice, OHLC } from '@/types/types';
import { ResoBox } from '@/components/ResoBox';
import { BoxColors } from '@/utils/localStorage';
import React from 'react';

interface PairResoBoxProps {
    pair: string;
    boxSlice: BoxSlice;
    currentOHLC: OHLC;
    boxColors: BoxColors;
}

export const PairResoBox = React.memo(
    ({ pair, boxSlice, currentOHLC, boxColors }: PairResoBoxProps) => {
        const closePrice = currentOHLC?.close || 'N/A';

        return (
            <div className='group m-auto flex w-full flex-col items-center justify-center gap-4 p-12 text-center text-white shadow-md lg:p-16'>
                <div className='w-full'>
                    <ResoBox key={`${pair}-${boxSlice.timestamp}`} slice={boxSlice} className='h-full w-full' boxColors={boxColors} />
                </div>
                <div className='flex w-full items-center gap-4'>
                    <div className='font-outfit text-lg font-bold tracking-wider'>{pair.toUpperCase()}</div>
                    <div className='font-kodemono text-sm font-medium text-gray-200'>{closePrice}</div>
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.pair === nextProps.pair &&
            prevProps.boxSlice.timestamp === nextProps.boxSlice.timestamp &&
            prevProps.currentOHLC?.close === nextProps.currentOHLC?.close &&
            prevProps.boxColors.positive === nextProps.boxColors.positive &&
            prevProps.boxColors.negative === nextProps.boxColors.negative &&
            JSON.stringify(prevProps.boxColors.styles) === JSON.stringify(nextProps.boxColors.styles)
        );
    }
);
