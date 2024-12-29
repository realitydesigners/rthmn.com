'use client';

import { BoxSlice, OHLC } from '@/types/types';
import { ResoBox } from '@/components/ResoBox';
import { BoxColors } from '@/utils/localStorage';
import { getTimeframeRange } from '@/utils/timeframe';
import { TimeFrameVisualizer } from '@/components/SettingsBar/Visualizers';
import React, { useMemo, useState } from 'react';
import { ResoChart } from '@/components/ResoChart';
import { symbolsToDigits } from '@/utils/Constants';

export const PairResoBox = React.memo(
    ({ pair = '', boxSlice, currentOHLC, boxColors, isLoading }: PairResoBoxProps) => {
        const [localStartIndex, setLocalStartIndex] = useState(boxColors?.styles?.startIndex ?? 0);
        const [localMaxBoxCount, setLocalMaxBoxCount] = useState(boxColors?.styles?.maxBoxCount ?? 10);
        const [showSidebar, setShowSidebar] = useState(false);

        const isBoxView = !boxColors?.styles?.showLineChart;
        const closePrice = useMemo(() => currentOHLC?.close || 'N/A', [currentOHLC?.close]);
        const boxKey = useMemo(() => `${pair}-${boxSlice?.timestamp}`, [pair, boxSlice?.timestamp]);
        const digits = useMemo(() => {
            const formattedPair = pair.replace(/^(.{3})(.{3})$/, '$1_$2');
            return symbolsToDigits[formattedPair]?.digits ?? 5;
        }, [pair]);

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

        return (
            <div className='group relative flex w-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px]'>
                <div className='relative flex flex-col rounded-lg border border-[#111] bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a]'>
                    <div className='relative flex h-auto flex-col items-center justify-center gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6'>
                        {/* Price Display Section */}
                        <div className='relative h-[42px] w-full'>
                            <div className={`absolute inset-0 transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                                <PriceDisplaySkeleton />
                            </div>
                            <div className={`absolute inset-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                <PriceDisplay pair={pair} closePrice={closePrice} timeframeRange={timeframeRange} isBoxView={isBoxView} />
                            </div>
                        </div>

                        {/* Visualization Section */}
                        <div className='relative flex aspect-square h-full w-full'>
                            {isBoxView ? (
                                <ResoBox
                                    key={`box-${boxKey}`}
                                    slice={boxSlice}
                                    className='h-full w-full'
                                    boxColors={{
                                        ...boxColors,
                                        styles: {
                                            ...boxColors.styles,
                                            startIndex: boxColors.styles?.globalTimeframeControl ? boxColors.styles.startIndex : localStartIndex,
                                            maxBoxCount: boxColors.styles?.globalTimeframeControl ? boxColors.styles.maxBoxCount : localMaxBoxCount,
                                        },
                                    }}
                                />
                            ) : (
                                <div className='relative w-full'>
                                    <ResoChart
                                        key={`chart-${boxKey}`}
                                        slice={boxSlice}
                                        className='w-full'
                                        digits={digits}
                                        showSidebar={showSidebar}
                                        boxColors={{
                                            ...boxColors,
                                            styles: {
                                                ...boxColors.styles,
                                                startIndex: boxColors.styles?.globalTimeframeControl ? boxColors.styles.startIndex : localStartIndex,
                                                maxBoxCount: boxColors.styles?.globalTimeframeControl ? boxColors.styles.maxBoxCount : localMaxBoxCount,
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className='relative z-10 rounded bg-[#222] px-2 py-1 text-xs text-white opacity-50 transition-opacity hover:opacity-100'>
                            {showSidebar ? 'Hide' : 'Show'} Prices
                        </button>

                        {!boxColors?.styles?.globalTimeframeControl && boxSlice?.boxes && (
                            <div className='relative h-24 w-full'>
                                <div className={`absolute inset-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
                                    <TimeFrameVisualizerSkeleton />
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
    },
    (prevProps, nextProps) => {
        if (prevProps.isLoading !== nextProps.isLoading) return false;
        if (prevProps.isLoading || nextProps.isLoading) return true;

        if (
            prevProps.pair !== nextProps.pair ||
            prevProps.boxSlice?.timestamp !== nextProps.boxSlice?.timestamp ||
            prevProps.currentOHLC?.close !== nextProps.currentOHLC?.close ||
            prevProps.boxColors?.styles?.globalTimeframeControl !== nextProps.boxColors?.styles?.globalTimeframeControl ||
            prevProps.boxColors?.styles?.showLineChart !== nextProps.boxColors?.styles?.showLineChart
        ) {
            return false;
        }

        const colorsDiff = prevProps.boxColors?.positive === nextProps.boxColors?.positive && prevProps.boxColors?.negative === nextProps.boxColors?.negative;

        if (!colorsDiff) return false;

        return JSON.stringify(prevProps.boxColors?.styles) === JSON.stringify(nextProps.boxColors?.styles);
    }
);

PairResoBox.displayName = 'PairResoBox';

// Memoize the price display to prevent unnecessary re-renders
const PriceDisplay = React.memo(
    ({ pair, closePrice, timeframeRange, isBoxView }: { pair: string; closePrice: string | number; timeframeRange: { start: string; end: string }; isBoxView: boolean }) => (
        <div className='flex w-full flex-col items-center gap-2'>
            <div className='flex w-full items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='font-outfit text-lg font-bold tracking-wider'>{pair.toUpperCase()}</div>
                    <div className='font-kodemono text-sm font-medium text-gray-200'>{closePrice}</div>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='font-kodemono text-xs text-gray-400'>
                        <span className='mr-1 text-gray-500'>Range:</span>
                        <span className='font-medium text-gray-300'>{timeframeRange.start}</span>
                        <span className='mx-1 text-gray-500'>→</span>
                        <span className='font-medium text-gray-300'>{timeframeRange.end}</span>
                    </div>
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

const PriceDisplaySkeleton = () => (
    <div className='flex w-full flex-col items-center gap-2'>
        <div className='flex w-full items-center justify-between'>
            <div className='flex items-center gap-4'>
                <div className='h-5 w-20 rounded-md bg-[#222]/50' />
                <div className='h-4 w-16 rounded-md bg-[#222]/50' />
                <div className='h-6 w-20 rounded-md bg-[#222]/50' />
            </div>
            <div className='h-4 w-32 rounded-md bg-[#222]/50' />
        </div>
    </div>
);

const TimeFrameVisualizerSkeleton = () => <div className='h-10 w-full max-w-lg rounded-lg bg-[#222]/20' />;
