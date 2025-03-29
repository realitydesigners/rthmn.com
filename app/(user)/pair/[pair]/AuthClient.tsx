'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { ChartDataPoint } from '@/components/Charts/CandleChart';
import { Box, BoxSlice } from '@/types/types';
import { PairResoBox } from '@/app/(user)/dashboard/PairResoBox';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useUser } from '@/providers/UserProvider';
import { formatPrice } from '@/utils/instruments';
import HistogramSimple from '@/components/Charts/Histogram/HistogramSimple';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { ResoBox } from '@/components/Charts/ResoBox';
import { useTimeframeStore } from '@/stores/timeframeStore';
import { TimeFrameSlider } from '@/components/Panels/PanelComponents/TimeFrameSlider';

interface ExtendedBoxSlice {
    timestamp: string;
    progressiveValues: {
        high: number;
        low: number;
        value: number;
    }[];
    currentOHLC: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
}

interface ChartData {
    processedCandles: ChartDataPoint[];
    initialVisibleData: ChartDataPoint[];
    histogramBoxes: ExtendedBoxSlice[];
    histogramPreProcessed: {
        maxSize: number;
        initialFramesWithPoints: {
            frameData: {
                boxArray: Box[];
                isSelected: boolean;
                meetingPointY: number;
                sliceWidth: number;
                price: number;
                high: number;
                low: number;
            };
            meetingPointY: number;
            sliceWidth: number;
        }[];
        defaultVisibleBoxesCount: number;
        defaultHeight: number;
    };
}

const AuthClient = ({ pair, chartData }: { pair: string; chartData: ChartData }) => {
    const { pairData, isLoading } = useDashboard();
    const { priceData } = useWebSocket();
    const { boxColors } = useUser();
    const [histogramData, setHistogramData] = useState<ExtendedBoxSlice[]>(chartData.histogramBoxes);
    const settings = useTimeframeStore(useCallback((state) => (pair ? state.getSettingsForPair(pair) : state.global.settings), [pair]));
    const updatePairSettings = useTimeframeStore((state) => state.updatePairSettings);
    const initializePair = useTimeframeStore((state) => state.initializePair);

    // Convert pair to uppercase for consistency with pairData keys
    const uppercasePair = pair.toUpperCase();
    const currentPrice = priceData[uppercasePair]?.price;
    const boxSlice = pairData[uppercasePair]?.boxes?.[0];

    // Initialize timeframe settings for this pair when component mounts
    useEffect(() => {
        if (pair) {
            initializePair(pair);
        }
    }, [pair, initializePair]);

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
        if (!boxSlice?.boxes) {
            console.log('No boxes available:', { boxSlice });
            return undefined;
        }
        const filtered = {
            ...boxSlice,
            boxes: boxSlice.boxes.slice(settings.startIndex, settings.startIndex + settings.maxBoxCount) || [],
        };
        console.log('Filtered boxes:', {
            boxCount: filtered.boxes.length,
            startIndex: settings.startIndex,
            maxBoxCount: settings.maxBoxCount,
        });
        return filtered;
    }, [boxSlice, settings.startIndex, settings.maxBoxCount]);

    // Debug data availability
    useEffect(() => {
        console.log('Data check:', {
            hasPairData: !!pairData[uppercasePair],
            hasBoxes: !!pairData[uppercasePair]?.boxes,
            boxCount: pairData[uppercasePair]?.boxes?.[0]?.boxes?.length,
            isLoading,
        });
    }, [pairData, uppercasePair, isLoading]);

    return (
        <div className='flex h-screen w-full flex-col bg-[#0a0a0a] pt-14'>
            {/* Header Section */}

            {/* Main Content Area */}
            <div className='relative flex w-full flex-wrap'>
                {/* Side Panel - PairResoBox */}
                <div className='h-full w-1/4 border-r border-[#222] p-4'>
                    <div className='flex h-full flex-col rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-4'>
                        <div className='relative aspect-square min-h-[400px] flex-1'>
                            {filteredBoxSlice && boxColors && (
                                <ResoBox slice={filteredBoxSlice} className='h-full w-full' boxColors={boxColors} pair={pair} showPriceLines={settings.showPriceLines} />
                            )}
                        </div>

                        {/* Timeframe Control */}
                        {boxSlice?.boxes && (
                            <div className='mt-4 h-16 w-full'>
                                <TimeFrameSlider startIndex={settings.startIndex} maxBoxCount={settings.maxBoxCount} boxes={boxSlice.boxes} onStyleChange={handleTimeframeChange} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Chart Area */}
                <div className='h-full w-3/4 p-4'>
                    <div className='flex h-full flex-col rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-4'>
                        <h1 className='font-outfit text-2xl font-bold tracking-wider text-white'>{uppercasePair}</h1>
                        <div className='font-kodemono text-xl font-medium text-gray-200'>{currentPrice ? formatPrice(currentPrice, uppercasePair) : '-'}</div>
                    </div>
                </div>

                {/* Histogram Section */}
                <div className='relative right-0 bottom-0 left-0 h-[300px]'>
                    <HistogramSimple
                        data={histogramData.map((frame) => ({
                            timestamp: frame.timestamp,
                            boxes: frame.progressiveValues,
                            currentOHLC: frame.currentOHLC,
                        }))}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(AuthClient);
