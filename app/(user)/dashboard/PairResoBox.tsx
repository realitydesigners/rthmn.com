'use client';

import React, { useCallback, useMemo } from 'react';
import { ResoBox } from '@/app/(user)/_components/ResoBox';
import { TimeFrameSlider } from '@/app/(user)/_components/TimeFrameSlider';
import { BoxSlice, OHLC } from '@/types/types';
import type { BoxColors } from '@/stores/colorStore';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { INSTRUMENTS } from '@/utils/instruments';
import { useTimeframeStore } from '@/stores/timeframeStore';

const getInstrumentDigits = (pair: string): number => {
    const categories = INSTRUMENTS as Record<string, Record<string, { digits: number }>>;
    for (const [category, pairs] of Object.entries(categories)) {
        if (pair in pairs) {
            return pairs[pair].digits;
        }
    }
    return 5;
};

interface PairResoBoxProps {
    pair?: string;
    boxSlice?: BoxSlice;
    currentOHLC?: OHLC;
    boxColors?: BoxColors;
    isLoading?: boolean;
}

export const PairResoBox = ({ pair, boxSlice, currentOHLC, boxColors, isLoading }: PairResoBoxProps) => {
    const { priceData } = useWebSocket();

    // Get timeframe state and actions
    const isGlobalControl = useTimeframeStore((state) => state.global.isGlobalControl);
    const settings = useTimeframeStore((state) => (pair ? state.getSettingsForPair(pair) : state.global.settings));
    const updatePairSettings = useTimeframeStore((state) => state.updatePairSettings);

    const currentPrice = pair ? priceData[pair]?.price : null;
    const digits = pair ? getInstrumentDigits(pair) : 5;

    const handleTimeframeChange = useCallback(
        (property: string, value: number) => {
            if (!isGlobalControl && pair) {
                updatePairSettings(pair, { [property]: value });
            }
        },
        [pair, isGlobalControl, updatePairSettings]
    );

    return (
        <div className='no-select group relative flex w-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px]'>
            <div className='relative flex flex-col rounded-lg border border-[#111] bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a]'>
                <div className='relative flex h-auto flex-col items-center justify-center gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6'>
                    {/* Price Display */}
                    <div className='flex w-full flex-col items-center gap-2'>
                        <div className='flex w-full items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='font-outfit text-lg font-bold tracking-wider'>{pair?.toUpperCase()}</div>
                                <div className='font-kodemono text-sm font-medium text-gray-200'>{currentPrice ? currentPrice.toFixed(digits) : '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className='relative flex h-full w-full pr-12'>
                        <ResoBox
                            slice={{
                                ...boxSlice,
                                boxes: boxSlice?.boxes?.slice(settings.startIndex, settings.startIndex + settings.maxBoxCount) || [],
                            }}
                            className='h-full w-full'
                            boxColors={boxColors}
                            pair={pair}
                        />
                    </div>

                    {/* Timeframe Control */}
                    {boxSlice?.boxes && (
                        <div className='relative h-24 w-full'>
                            <div className={`absolute right-0 bottom-0 left-0 transition-opacity delay-200 duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                <div className={`relative ${isGlobalControl ? 'pointer-events-none opacity-50' : ''}`}>
                                    <TimeFrameSlider
                                        startIndex={settings.startIndex}
                                        maxBoxCount={settings.maxBoxCount}
                                        boxes={boxSlice.boxes}
                                        onStyleChange={handleTimeframeChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
