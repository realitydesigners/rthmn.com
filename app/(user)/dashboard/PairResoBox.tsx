'use client';

import React, { useMemo, useState } from 'react';
import { ResoBox } from '@/components/ResoBox';
import { ResoChart } from '@/components/ResoChart';
import { TimeFrameVisualizer } from '@/components/VisualizersView/Visualizers';
import { BoxSlice, OHLC } from '@/types/types';
import { BoxColors, getPairTimeframe, setPairTimeframe } from '@/utils/localStorage';

interface PairResoBoxProps {
    pair?: string;
    boxSlice?: BoxSlice;
    currentOHLC?: OHLC;
    boxColors?: BoxColors;
    isLoading?: boolean;
}
// Constants
export const TIMEFRAMES = ['D', '12H', '4H', '2H', '1H', '15m', '5m', '1m'] as const;
export const SEGMENT_WIDTH = 38 / 9; // Width of each timeframe segment

export interface TimeframeRange {
    start: string;
    end: string;
}

/**
 * Converts start and end indices to timeframe range
 * Used by both PatternVisualizer and PairResoBox to ensure consistent timeframe display
 */
export const getTimeframeRange = (start: number, end: number): TimeframeRange => {
    // Calculate which segments we're in
    const startSegment = Math.floor(start / SEGMENT_WIDTH);
    const endSegment = Math.floor(end / SEGMENT_WIDTH);

    return {
        start: TIMEFRAMES[Math.min(startSegment, TIMEFRAMES.length - 1)] || 'D',
        end: TIMEFRAMES[Math.min(endSegment, TIMEFRAMES.length - 1)] || 'D',
    };
};

export const PairResoBox = React.memo(({ pair, boxSlice, currentOHLC, boxColors, isLoading }: PairResoBoxProps) => {
    // Get individual pair settings if not using global control
    const [localStartIndex, setLocalStartIndex] = useState(() =>
        boxColors?.styles?.globalTimeframeControl ? (boxColors?.styles?.startIndex ?? 0) : getPairTimeframe(pair || '').startIndex
    );

    const [localMaxBoxCount, setLocalMaxBoxCount] = useState(() =>
        boxColors?.styles?.globalTimeframeControl ? (boxColors?.styles?.maxBoxCount ?? 10) : getPairTimeframe(pair || '').maxBoxCount
    );

    const [showSidebar, setShowSidebar] = useState(true);

    // console.log(boxSlice);

    // Memoize values that depend on props
    const memoizedBoxColors = useMemo(
        () => ({
            ...boxColors,
            styles: {
                ...boxColors?.styles,
                startIndex: boxColors?.styles?.globalTimeframeControl ? boxColors?.styles?.startIndex : localStartIndex,
                maxBoxCount: boxColors?.styles?.globalTimeframeControl ? boxColors?.styles?.maxBoxCount : localMaxBoxCount,
            },
        }),
        [boxColors, localStartIndex, localMaxBoxCount]
    );

    const isBoxView = useMemo(() => !memoizedBoxColors?.styles?.showLineChart, [memoizedBoxColors?.styles?.showLineChart]);

    const timeframeRange = useMemo(() => {
        const startIndex = memoizedBoxColors.styles?.globalTimeframeControl ? memoizedBoxColors.styles?.startIndex : localStartIndex;
        const maxBoxCount = memoizedBoxColors.styles?.globalTimeframeControl ? memoizedBoxColors.styles?.maxBoxCount : localMaxBoxCount;

        // Debug box order
        if (boxSlice?.boxes) {
            const visibleBoxes = boxSlice.boxes.slice(startIndex ?? 0, (startIndex ?? 0) + (maxBoxCount ?? 10));
            console.log('Box Order Analysis:', {
                pair,
                allBoxes: boxSlice.boxes.map((box) => ({
                    value: box.value,
                    absValue: Math.abs(box.value),
                    high: box.high,
                    low: box.low,
                })),
                visibleBoxes: visibleBoxes.map((box) => ({
                    value: box.value,
                    absValue: Math.abs(box.value),
                    high: box.high,
                    low: box.low,
                })),
                startIndex,
                maxBoxCount,
                direction: startIndex > 0 ? 'sliding right' : 'sliding left',
            });
        }

        return getTimeframeRange(startIndex ?? 0, (startIndex ?? 0) + (maxBoxCount ?? 10));
    }, [memoizedBoxColors.styles, localStartIndex, localMaxBoxCount, boxSlice, pair]);

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

    // Always return a consistent structure
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
                        {isBoxView ? (
                            <ResoBox slice={boxSlice} className='h-full w-full' boxColors={memoizedBoxColors} pair={pair} />
                        ) : (
                            <div className='relative aspect-[2/1] w-full'>
                                <ResoChart slice={boxSlice} className='w-full' showSidebar={showSidebar} digits={2} boxColors={memoizedBoxColors} />
                            </div>
                        )}
                    </div>

                    {/* Timeframe Control */}
                    {!memoizedBoxColors?.styles?.globalTimeframeControl && boxSlice?.boxes && (
                        <div className='relative h-20 w-full'>
                            <div className={`absolute inset-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                                <div className='h-24 w-full rounded-md bg-[#222]/50' />
                            </div>
                            <div className={`inset-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                <TimeFrameVisualizer
                                    startIndex={localStartIndex}
                                    maxBoxCount={localMaxBoxCount}
                                    boxes={boxSlice.boxes}
                                    onStyleChange={handleLocalStyleChange}
                                    timeframeRange={timeframeRange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

PairResoBox.displayName = 'PairResoBox';
