'use client';

import { BoxSlice, OHLC } from '@/types/types';
import { ResoBox } from '@/components/ResoBox';
import { BoxColors } from '@/utils/localStorage';
import { getTimeframeRange } from '@/utils/timeframe';
import { TimeFrameVisualizer } from '@/components/SettingsBar/Visualizers';
import React, { useMemo, useState, useEffect } from 'react';
import { ResoChart } from '@/components/ResoChart';

const PriceDisplay = React.memo(
    ({ pair, closePrice, timeframeRange, isBoxView }: { pair: string; closePrice: string | number; timeframeRange: { start: string; end: string }; isBoxView: boolean }) => (
        <div className='flex w-full flex-col items-center gap-2'>
            <div className='flex w-full items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='font-outfit text-lg font-bold tracking-wider'>{pair.toUpperCase()}</div>
                    <div className='font-kodemono text-sm font-medium text-gray-200'>{closePrice}</div>
                </div>
            </div>
        </div>
    )
);

PriceDisplay.displayName = 'PriceDisplay';

interface PairResoBoxProps {
    pair?: string;
    boxSlice?: BoxSlice;
    currentOHLC?: OHLC;
    boxColors?: BoxColors;
    isLoading?: boolean;
}

export const PairResoBox = React.memo(({ pair, boxSlice, currentOHLC, boxColors, isLoading }: PairResoBoxProps) => {
    // Move all hooks to the top level
    const [localStartIndex, setLocalStartIndex] = useState(boxColors?.styles?.startIndex ?? 0);
    const [localMaxBoxCount, setLocalMaxBoxCount] = useState(boxColors?.styles?.maxBoxCount ?? 10);
    const [showSidebar, setShowSidebar] = useState(true);

    // Always initialize isBoxView with useMemo
    const isBoxView = useMemo(() => !boxColors?.styles?.showLineChart, [boxColors?.styles?.showLineChart]);

    // Calculate timeframe range based on whether we're using global or individual control
    const timeframeRange = useMemo(() => {
        if (boxColors?.styles?.globalTimeframeControl) {
            const startIndex = boxColors.styles?.startIndex ?? 0;
            const maxBoxCount = boxColors.styles?.maxBoxCount ?? boxSlice?.boxes?.length ?? 10;
            return getTimeframeRange(startIndex, startIndex + maxBoxCount);
        } else {
            return getTimeframeRange(localStartIndex, localStartIndex + localMaxBoxCount);
        }
    }, [boxColors?.styles?.globalTimeframeControl, boxColors?.styles?.startIndex, boxColors?.styles?.maxBoxCount, localStartIndex, localMaxBoxCount, boxSlice?.boxes?.length]);

    const handleLocalStyleChange = (property: string, value: number | boolean) => {
        if (property === 'startIndex') {
            setLocalStartIndex(value as number);
        } else if (property === 'maxBoxCount') {
            setLocalMaxBoxCount(value as number);
        }
    };

    // Memoize the box colors configuration
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

    useEffect(() => {
        console.log('PairResoBox Props:', {
            pair,
            hasBoxSlice: Boolean(boxSlice),
            hasCurrentOHLC: Boolean(currentOHLC),
            boxSliceData: boxSlice,
        });
    }, [pair, boxSlice, currentOHLC]);

    // Always return a consistent component structure
    return (
        <div className='group relative flex w-full flex-col overflow-hidden'>
            <div className='relative flex flex-col'>
                <div className='relative flex h-auto flex-col items-center justify-center gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6'>
                    <PriceDisplay pair={pair ?? ''} closePrice={currentOHLC?.close ?? '-'} timeframeRange={timeframeRange} isBoxView={isBoxView} />

                    <div className='relative flex h-full w-full'>
                        {isBoxView ? (
                            <ResoBox slice={boxSlice} className='h-full w-full' boxColors={memoizedBoxColors} />
                        ) : (
                            <div className='relative w-full'>
                                <ResoChart slice={boxSlice} className='w-full' showSidebar={showSidebar} digits={2} boxColors={memoizedBoxColors} />
                            </div>
                        )}
                    </div>

                    {!boxColors?.styles?.globalTimeframeControl && boxSlice?.boxes && (
                        <div className='relative h-24 w-full'>
                            <div className={`absolute inset-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                                <div className='h-24 w-full rounded-md bg-[#222]/50' />
                            </div>
                            <div className={`absolute inset-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
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
