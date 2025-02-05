'use client';

import React, { useState } from 'react';
import { ResoBox } from '@/app/(user)/_components/ResoBox';
import { TimeFrameVisualizer } from '@/app/(user)/_components/VisualizersView/Visualizers';
import { BoxSlice, OHLC } from '@/types/types';
import { BoxColors, getPairTimeframe, setPairTimeframe } from '@/utils/localStorage';

interface PairResoBoxProps {
    pair?: string;
    boxSlice?: BoxSlice;
    currentOHLC?: OHLC;
    boxColors?: BoxColors;
    isLoading?: boolean;
}

export const PairResoBox = ({ pair, boxSlice, currentOHLC, boxColors, isLoading }: PairResoBoxProps) => {
    // Get individual pair settings if not using global control
    const [localStartIndex, setLocalStartIndex] = useState(() =>
        boxColors?.styles?.globalTimeframeControl ? (boxColors?.styles?.startIndex ?? 0) : getPairTimeframe(pair || '').startIndex
    );

    const [localMaxBoxCount, setLocalMaxBoxCount] = useState(() =>
        boxColors?.styles?.globalTimeframeControl ? (boxColors?.styles?.maxBoxCount ?? 10) : getPairTimeframe(pair || '').maxBoxCount
    );

    const modifiedBoxColors = {
        ...boxColors,
        styles: {
            ...boxColors?.styles,
            startIndex: boxColors?.styles?.globalTimeframeControl ? boxColors?.styles?.startIndex : localStartIndex,
            maxBoxCount: boxColors?.styles?.globalTimeframeControl ? boxColors?.styles?.maxBoxCount : localMaxBoxCount,
        },
    };

    const handleLocalStyleChange = (property: string, value: number | boolean) => {
        if (property === 'startIndex') {
            setLocalStartIndex(value as number);
            if (!boxColors?.styles?.globalTimeframeControl && pair) {
                setPairTimeframe(pair, {
                    startIndex: value as number,
                    maxBoxCount: localMaxBoxCount,
                });
            }
        }
        if (property === 'maxBoxCount') {
            setLocalMaxBoxCount(value as number);
            if (!boxColors?.styles?.globalTimeframeControl && pair) {
                setPairTimeframe(pair, {
                    startIndex: localStartIndex,
                    maxBoxCount: value as number,
                });
            }
        }
    };

    return (
        <div className='no-select group relative flex w-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px]'>
            <div className='relative flex flex-col rounded-lg border border-[#111] bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a]'>
                <div className='relative flex h-auto flex-col items-center justify-center gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6'>
                    {/* Price Display */}
                    <div className='flex w-full flex-col items-center gap-2'>
                        <div className='flex w-full items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='font-outfit text-lg font-bold tracking-wider'>{pair?.toUpperCase()}</div>
                                <div className='font-kodemono text-sm font-medium text-gray-200'>{currentOHLC?.close ?? '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className='relative flex h-full w-full pr-16'>
                        <ResoBox slice={boxSlice} className='h-full w-full' boxColors={modifiedBoxColors} pair={pair} />
                    </div>

                    {/* Timeframe Control */}
                    {!modifiedBoxColors?.styles?.globalTimeframeControl && boxSlice?.boxes && (
                        <div className='relative h-20 w-full'>
                            <div className={`absolute inset-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                                <div className='h-24 w-full rounded-md bg-[#222]/50' />
                            </div>
                            <div className={`inset-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                <TimeFrameVisualizer startIndex={localStartIndex} maxBoxCount={localMaxBoxCount} boxes={boxSlice.boxes} onStyleChange={handleLocalStyleChange} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
