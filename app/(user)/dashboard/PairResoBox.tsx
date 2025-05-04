'use client';

import { ResoBox } from '@/components/Charts/ResoBox';
import { TimeFrameSlider } from '@/components/Panels/PanelComponents/TimeFrameSlider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import type { BoxColors } from '@/stores/colorStore';
import { useTimeframeStore } from '@/stores/timeframeStore';
import type { BoxSlice } from '@/types/types';
import { formatPrice } from '@/utils/instruments';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ResoBox3D } from '@/components/Charts/ResoBox/ResoBox3D';

interface PairResoBoxProps {
    pair?: string;
    boxSlice?: BoxSlice;
    boxColors?: BoxColors;
    isLoading?: boolean;
}

// Simple inline skeleton components
const TextSkeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-[#333] ${className}`} />
);

const ChartSkeleton = () => <div className='aspect-square h-full w-full animate-pulse rounded bg-[#222]' />;

const SliderSkeleton = () => <div className='h-16 w-full animate-pulse rounded bg-[#282828]' />;

export const PairResoBox = ({ pair, boxSlice, boxColors, isLoading }: PairResoBoxProps) => {
    const { priceData } = useWebSocket();

    // Get timeframe state and actions - memoize selectors
    const settings = useTimeframeStore(
        useCallback((state) => (pair ? state.getSettingsForPair(pair) : state.global.settings), [pair])
    );
    const updatePairSettings = useTimeframeStore((state) => state.updatePairSettings);
    const initializePair = useTimeframeStore((state) => state.initializePair);

    // Initialize timeframe settings for this pair when component mounts
    useEffect(() => {
        if (pair) {
            initializePair(pair);
        }
    }, [pair, initializePair]);

    const currentPrice = pair ? priceData[pair]?.price : null;

    const handleTimeframeChange = useCallback(
        (property: string, value: number | boolean) => {
            if (pair) {
                updatePairSettings(pair, { [property]: value });
            }
        },
        [pair, updatePairSettings]
    );

    // Memoize the filtered boxes based on timeframe settings
    const filteredBoxSlice = useMemo(() => {
        if (!boxSlice?.boxes) return undefined;
        return {
            ...boxSlice,
            boxes: boxSlice.boxes.slice(settings.startIndex, settings.startIndex + settings.maxBoxCount) || [],
        };
    }, [boxSlice, settings.startIndex, settings.maxBoxCount]);

    const showChart = !isLoading && filteredBoxSlice;
    const showSlider = true;

    return (
        <div className='no-select group relative flex w-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px]'>
            <div className='relative flex min-h-[250px] flex-col rounded-lg border border-[#111] bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a]'>
                <div className='relative flex flex-grow flex-col items-center justify-start gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6'>
                    {/* Price Display - Always render structure, show skeleton for value */}
                    <div className='flex w-full flex-col items-center gap-2'>
                        <div className='flex w-full items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='font-outfit text-lg font-bold tracking-wider'>
                                    {pair?.toUpperCase()}
                                </div>
                                {/* Conditional Skeleton for Price */}
                                {isLoading || !currentPrice ? (
                                    <TextSkeleton className='h-4 w-16' />
                                ) : (
                                    <div className='font-kodemono text-sm font-medium text-neutral-200'>
                                        {formatPrice(currentPrice, pair)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div
                        className={`relative flex h-full min-h-[100px] w-full flex-grow ${boxColors?.styles?.viewMode !== '3d' && settings.showPriceLines ? 'pr-16' : 'p-0'}`}
                    >
                        {showChart ? (
                            boxColors?.styles?.viewMode === '3d' ? (
                                <div className='relative h-full w-full aspect-square'>
                                    <ResoBox3D slice={filteredBoxSlice} pair={pair} boxColors={boxColors} />
                                </div>
                            ) : (
                                <div className='relative h-full w-full aspect-square'>
                                    <ResoBox
                                        slice={filteredBoxSlice}
                                        className='h-full w-full'
                                        boxColors={boxColors}
                                        pair={pair}
                                        showPriceLines={settings.showPriceLines}
                                    />
                                </div>
                            )
                        ) : (
                            <ChartSkeleton />
                        )}
                    </div>

                    {/* Timeframe Control */}
                    <div className='relative h-14 w-full flex-shrink-0'>
                        <TimeFrameSlider
                            startIndex={settings.startIndex}
                            maxBoxCount={settings.maxBoxCount}
                            boxes={boxSlice?.boxes || []}
                            onStyleChange={handleTimeframeChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
