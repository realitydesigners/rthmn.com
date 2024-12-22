'use client';

import { BoxSlice, OHLC } from '@/types/types';
import { ResoBox } from '@/components/ResoBox';
import { BoxColors } from '@/utils/localStorage';
import { getTimeframeRange } from '@/utils/timeframe';
import { PatternVisualizer } from '@/components/SettingsBar/Visualizers';
import React, { useMemo, useState } from 'react';

interface PairResoBoxProps {
    pair: string;
    boxSlice: BoxSlice;
    currentOHLC: OHLC;
    boxColors: BoxColors;
}

// Memoize the price display to prevent unnecessary re-renders
const PriceDisplay = React.memo(({ pair, closePrice, timeframeRange }: { pair: string; closePrice: string | number; timeframeRange: { start: string; end: string } }) => (
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
));

PriceDisplay.displayName = 'PriceDisplay';

export const PairResoBox = React.memo(
    ({ pair, boxSlice, currentOHLC, boxColors }: PairResoBoxProps) => {
        // Local state for individual timeframe control
        const [localStartIndex, setLocalStartIndex] = useState(boxColors.styles?.startIndex ?? 0);
        const [localMaxBoxCount, setLocalMaxBoxCount] = useState(boxColors.styles?.maxBoxCount ?? 10);

        // Memoize the close price calculation
        const closePrice = useMemo(() => currentOHLC?.close || 'N/A', [currentOHLC?.close]);

        // Create a stable key for ResoBox that only changes when necessary
        const boxKey = useMemo(() => `${pair}-${boxSlice.timestamp}`, [pair, boxSlice.timestamp]);

        // Calculate timeframe range based on whether we're using global or individual control
        const timeframeRange = useMemo(() => {
            if (boxColors.styles?.globalTimeframeControl) {
                const startIndex = boxColors.styles?.startIndex ?? 0;
                const maxBoxCount = boxColors.styles?.maxBoxCount ?? boxSlice.boxes.length;
                return getTimeframeRange(startIndex, startIndex + maxBoxCount);
            } else {
                return getTimeframeRange(localStartIndex, localStartIndex + localMaxBoxCount);
            }
        }, [boxColors.styles?.globalTimeframeControl, boxColors.styles?.startIndex, boxColors.styles?.maxBoxCount, localStartIndex, localMaxBoxCount, boxSlice.boxes.length]);

        // Handle local style changes
        const handleLocalStyleChange = (property: string, value: number | boolean) => {
            if (property === 'startIndex') {
                setLocalStartIndex(value as number);
            } else if (property === 'maxBoxCount') {
                setLocalMaxBoxCount(value as number);
            }
        };

        return (
            <div className='group relative flex w-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#333]/30 to-[#111]/30 p-[1px] transition-all duration-300'>
                <div className='relative flex flex-col rounded-lg'>
                    {/* Background Effects */}

                    {/* Main content */}
                    <div className='relative flex flex-col items-center justify-center gap-4 p-6 lg:p-8'>
                        <PriceDisplay pair={pair} closePrice={closePrice} timeframeRange={timeframeRange} />
                        <div className='w-full'>
                            <ResoBox
                                key={boxKey}
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
                        </div>

                        {!boxColors.styles?.globalTimeframeControl && (
                            <div className='w-full max-w-lg'>
                                <PatternVisualizer
                                    startIndex={localStartIndex}
                                    maxBoxCount={localMaxBoxCount}
                                    boxes={boxSlice.boxes}
                                    onStyleChange={handleLocalStyleChange}
                                    timeframeRange={timeframeRange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        // Fast equality checks first
        if (
            prevProps.pair !== nextProps.pair ||
            prevProps.boxSlice.timestamp !== nextProps.boxSlice.timestamp ||
            prevProps.currentOHLC?.close !== nextProps.currentOHLC?.close ||
            prevProps.boxColors.styles?.globalTimeframeControl !== nextProps.boxColors.styles?.globalTimeframeControl
        ) {
            return false;
        }

        // Color equality checks
        const colorsDiff = prevProps.boxColors.positive === nextProps.boxColors.positive && prevProps.boxColors.negative === nextProps.boxColors.negative;

        if (!colorsDiff) return false;

        // Only do the expensive JSON.stringify if everything else matches
        return JSON.stringify(prevProps.boxColors.styles) === JSON.stringify(nextProps.boxColors.styles);
    }
);
