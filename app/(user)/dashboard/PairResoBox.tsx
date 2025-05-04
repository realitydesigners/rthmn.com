'use client';

import { ResoBox } from '@/components/Charts/ResoBox';
import { ResoBox3D } from '@/components/Charts/ResoBox/ResoBox3D';
import { TimeFrameSlider } from '@/components/Panels/PanelComponents/TimeFrameSlider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import type { BoxColors } from '@/stores/colorStore';
import { useTimeframeStore } from '@/stores/timeframeStore';
import type { BoxSlice } from '@/types/types';
import { formatPrice } from '@/utils/instruments';
import React, { useCallback, useEffect, useMemo } from 'react';

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
        <div className='no-select group relative flex w-full flex-col overflow-hidden bg-[#0A0B0D]'>
            {/* Grid Pattern Background */}

            <div className='relative flex min-h-[250px] flex-col border-[0.5px] border-white/[0.02] bg-gradient-to-b from-[#0A0B0D] to-[#040505]'>
                {/* <div className='absolute inset-0'>
                    <svg className='h-full w-full opacity-[0.07]' xmlns='http://www.w3.org/2000/svg'>
                        <title>Background Grid Pattern</title>
                        <defs>
                            <pattern id='grid' width='30' height='30' patternUnits='userSpaceOnUse'>
                                <path d='M 30 0 L 0 0 0 30' fill='none' stroke='currentColor' strokeWidth='0.5' />
                                <path
                                    d='M 15 0 L 0 0 0 15'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='0.25'
                                    opacity='0.5'
                                />
                            </pattern>
                            <linearGradient id='gridFade' x1='0%' y1='0%' x2='100%' y2='100%'>
                                <stop offset='0%' stopColor='white' stopOpacity='0.12' />
                                <stop offset='50%' stopColor='white' stopOpacity='0.08' />
                                <stop offset='100%' stopColor='white' stopOpacity='0.02' />
                            </linearGradient>
                            <radialGradient id='gridVignette' cx='50%' cy='50%' r='70%'>
                                <stop offset='0%' stopColor='white' stopOpacity='1' />
                                <stop offset='100%' stopColor='white' stopOpacity='0' />
                            </radialGradient>
                        </defs>
                        <rect width='100%' height='100%' fill='url(#grid)' />
                        <rect width='100%' height='100%' fill='url(#gridFade)' />
                        <rect width='100%' height='100%' fill='url(#gridVignette)' opacity='0.1' />
                    </svg>
                </div> */}
                {/* Enhanced depth effects */}
                <div className='absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_50%)]' />

                {/* Main content container */}
                <div className='relative flex flex-grow flex-col items-center justify-start gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6'>
                    {/* Header section with enhanced depth */}
                    <div className='flex w-full flex-col items-center gap-2'>
                        <div className='flex w-full items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='font-outfit text-lg font-bold tracking-wider text-white/90 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]'>
                                    {pair?.toUpperCase()}
                                </div>
                                {isLoading || !currentPrice ? (
                                    <TextSkeleton className='h-4 w-16' />
                                ) : (
                                    <div className='font-kodemono text-sm font-medium text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'>
                                        {formatPrice(currentPrice, pair)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chart Section with enhanced container */}
                    <div
                        className={`relative flex h-full min-h-[100px] w-full flex-grow  ${
                            boxColors?.styles?.viewMode !== '3d' && settings.showPriceLines ? 'pr-16' : 'p-0'
                        }`}
                    >
                        <div className='absolute inset-0 ' />
                        {showChart ? (
                            boxColors?.styles?.viewMode === '3d' ? (
                                <div className='relative h-full w-full aspect-square'>
                                    <div className='absolute inset-0' />
                                    <ResoBox3D slice={filteredBoxSlice} pair={pair} boxColors={boxColors} />
                                </div>
                            ) : (
                                <div className='relative h-full w-full aspect-square'>
                                    <div className='absolute inset-0' />
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

                    {/* Timeframe Control with enhanced separator */}
                    <div className='relative h-14 w-full flex-shrink-0'>
                        <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent' />
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
