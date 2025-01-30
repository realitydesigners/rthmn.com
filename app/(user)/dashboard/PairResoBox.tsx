'use client';

import { BoxSlice, OHLC } from '@/types/types';
import { ResoBox } from '@/components/ResoBox';
import { BoxColors } from '@/utils/localStorage';
import { getTimeframeRange } from '@/utils/timeframe';
import { TimeFrameVisualizer } from '@/components/SettingsBar/Visualizers';
import React, { useMemo, useState } from 'react';
import { ResoChart } from '@/components/ResoChart';

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
    const [viewMode, setViewMode] = useState<'default' | 'perspective' | 'centered'>(boxColors?.styles?.viewMode ?? 'default');

    // Memoize values that depend on props
    const memoizedBoxColors = useMemo(
        () => ({
            ...boxColors,
            styles: {
                ...boxColors?.styles,
                startIndex: boxColors?.styles?.globalTimeframeControl ? boxColors?.styles?.startIndex : localStartIndex,
                maxBoxCount: boxColors?.styles?.globalTimeframeControl ? boxColors?.styles?.maxBoxCount : localMaxBoxCount,
                viewMode: viewMode,
            },
        }),
        [boxColors, localStartIndex, localMaxBoxCount, viewMode]
    );

    const isBoxView = useMemo(() => !memoizedBoxColors?.styles?.showLineChart, [memoizedBoxColors?.styles?.showLineChart]);

    const timeframeRange = useMemo(() => {
        const startIndex = memoizedBoxColors.styles?.globalTimeframeControl ? memoizedBoxColors.styles?.startIndex : localStartIndex;
        const maxBoxCount = memoizedBoxColors.styles?.globalTimeframeControl ? memoizedBoxColors.styles?.maxBoxCount : localMaxBoxCount;
        return getTimeframeRange(startIndex ?? 0, (startIndex ?? 0) + (maxBoxCount ?? 10));
    }, [memoizedBoxColors.styles, localStartIndex, localMaxBoxCount]);

    const handleLocalStyleChange = (property: string, value: number | boolean) => {
        if (property === 'startIndex') setLocalStartIndex(value as number);
        if (property === 'maxBoxCount') setLocalMaxBoxCount(value as number);
    };

    // Always return a consistent structure
    return (
        <div className='no-select group relative flex w-full flex-col rounded-lg bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px]'>
            <div className='relative flex flex-col rounded-lg border border-[#111] bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a]'>
                <div className='relative flex h-auto flex-col items-center justify-center gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6'>
                    {/* Price Display */}
                    <div className='flex w-full flex-col items-center gap-2'>
                        <div className='flex w-full items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='font-outfit text-lg font-bold tracking-wider'>{pair?.toUpperCase()}</div>
                                <div className='font-kodemono text-sm font-medium text-gray-200'>{currentOHLC?.close ?? '-'}</div>
                            </div>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => {
                                        const newMode = viewMode === 'default' ? 'perspective' : viewMode === 'perspective' ? 'centered' : 'default';
                                        setViewMode(newMode);
                                        if (boxColors?.styles) {
                                            boxColors.styles.viewMode = newMode;
                                        }
                                    }}
                                    className={`rounded px-2 py-1 text-sm transition-colors ${
                                        viewMode === 'default'
                                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            : viewMode === 'perspective'
                                              ? 'bg-blue-500/20 text-blue-400'
                                              : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {viewMode === 'default' ? 'Default View' : viewMode === 'perspective' ? '3D View' : 'Center View'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className={`relative flex h-full w-full items-center justify-center`}>
                        {isBoxView ? (
                            <div
                                className='h-full w-full transition-transform duration-300'
                                style={{
                                    transform: viewMode === 'perspective' ? 'scale(0.7)' : undefined,
                                }}>
                                <ResoBox slice={boxSlice} className='h-full w-full' boxColors={memoizedBoxColors} />
                            </div>
                        ) : (
                            <div className='relative aspect-[2/1] w-full'>
                                <ResoChart slice={boxSlice} className='w-full' showSidebar={showSidebar} digits={2} boxColors={memoizedBoxColors} />
                            </div>
                        )}
                    </div>

                    {/* Timeframe Control */}
                    {!memoizedBoxColors?.styles?.globalTimeframeControl && boxSlice?.boxes && (
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
