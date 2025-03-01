'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { ResoBox } from '@/components/Charts/ResoBox';
import { TimeFrameSlider } from '@/components/Panels/PanelComponents/TimeFrameSlider';
import { BoxSlice, OHLC } from '@/types/types';
import type { BoxColors } from '@/stores/colorStore';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useTimeframeStore } from '@/stores/timeframeStore';
import { formatPrice } from '@/utils/instruments';

interface PairResoBoxProps {
    pair?: string;
    boxSlice?: BoxSlice;
    boxColors?: BoxColors;
    isLoading?: boolean;
}

export const PairResoBox = ({ pair, boxSlice, boxColors, isLoading }: PairResoBoxProps) => {
    const { priceData } = useWebSocket();

    // Get timeframe state and actions - memoize selectors
    const settings = useTimeframeStore(useCallback((state) => (pair ? state.getSettingsForPair(pair) : state.global.settings), [pair]));
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

    return (
        <div className='no-select group relative flex w-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px]'>
            <div className='relative flex flex-col rounded-lg border border-[#111] bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a]'>
                <div className='relative flex h-auto flex-col items-center justify-center gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6'>
                    {/* Price Display */}
                    <div className='flex w-full flex-col items-center gap-2'>
                        <div className='flex w-full items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='font-outfit text-lg font-bold tracking-wider'>{pair?.toUpperCase()}</div>
                                <div className='font-kodemono text-sm font-medium text-gray-200'>{currentPrice ? formatPrice(currentPrice, pair) : '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className={`relative flex h-full w-full ${settings.showPriceLines ? 'pr-12' : 'p-0'} transition-all duration-300`}>
                        <ResoBox slice={filteredBoxSlice} className='h-full w-full' boxColors={boxColors} pair={pair} showPriceLines={settings.showPriceLines} />
                    </div>

                    {/* Timeframe Control */}
                    {boxSlice?.boxes && (
                        <div className='relative h-16 w-full'>
                            <div className={`absolute right-0 bottom-0 left-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                <TimeFrameSlider startIndex={settings.startIndex} maxBoxCount={settings.maxBoxCount} boxes={boxSlice.boxes} onStyleChange={handleTimeframeChange} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
