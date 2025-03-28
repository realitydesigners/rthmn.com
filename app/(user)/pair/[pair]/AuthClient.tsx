'use client';

import React, { useEffect, useState } from 'react';
import { ChartDataPoint } from '@/components/Charts/CandleChart';
import { Box, BoxSlice } from '@/types/types';
import { PairResoBox } from '@/app/(user)/dashboard/PairResoBox';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useUser } from '@/providers/UserProvider';
import { formatPrice } from '@/utils/instruments';
import HistogramSimple from '@/components/Charts/Histogram/HistogramSimple';
import { useDashboard } from '@/providers/DashboardProvider/client';

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

interface PriceStats {
    dailyHigh: number;
    dailyLow: number;
    dailyChange: number;
    dailyChangePercent: number;
}

const AuthClient = ({ pair, chartData }: { pair: string; chartData: ChartData }) => {
    const { pairData, isLoading } = useDashboard();
    const { priceData } = useWebSocket();
    const { boxColors } = useUser();
    const [histogramData, setHistogramData] = useState<ExtendedBoxSlice[]>(chartData.histogramBoxes);

    // Convert pair to uppercase for consistency with pairData keys
    const uppercasePair = pair.toUpperCase();

    // Debug logs
    useEffect(() => {
        console.log('Pair (uppercase):', uppercasePair);
        console.log('PairData:', pairData);
        console.log('Box data for pair:', pairData[uppercasePair]);
        console.log('Box slice being passed:', pairData[uppercasePair]?.boxes?.[0]);
    }, [uppercasePair, pairData]);

    const [priceStats, setPriceStats] = useState<PriceStats>({
        dailyHigh: 0,
        dailyLow: 0,
        dailyChange: 0,
        dailyChangePercent: 0,
    });

    // Calculate price statistics
    useEffect(() => {
        if (chartData.processedCandles.length > 0) {
            const last24Hours = chartData.processedCandles.slice(-24);
            const high = Math.max(...last24Hours.map((c) => c.high));
            const low = Math.min(...last24Hours.map((c) => c.low));
            const openPrice = last24Hours[0].open;
            const currentPrice = priceData[uppercasePair]?.price || last24Hours[last24Hours.length - 1].close;
            const change = currentPrice - openPrice;
            const changePercent = (change / openPrice) * 100;

            setPriceStats({
                dailyHigh: high,
                dailyLow: low,
                dailyChange: change,
                dailyChangePercent: changePercent,
            });
        }
    }, [chartData.processedCandles, priceData, uppercasePair]);

    const currentPrice = priceData[uppercasePair]?.price;

    return (
        <div className='flex h-screen w-full flex-col bg-[#0a0a0a] pt-14'>
            {/* Header Section */}

            {/* Main Content Area */}
            <div className='relative flex flex-1'>
                {/* Side Panel - PairResoBox */}
                <div className='h-[calc(100%-300px)] w-[300px] border-r border-[#222] p-4'>
                    <PairResoBox
                        pair={uppercasePair}
                        boxSlice={pairData[uppercasePair]?.boxes?.[0]}
                        boxColors={boxColors}
                        isLoading={isLoading || !pairData[uppercasePair]?.boxes?.[0]}
                    />
                </div>

                {/* Main Chart Area */}
                <div className='h-[calc(100%-300px)] flex-1'>
                    <div className='h-full p-4'>
                        <div className='h-full rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-1'>
                            <div className='flex items-center gap-6'>
                                <h1 className='font-outfit text-2xl font-bold tracking-wider text-white'>{uppercasePair}</h1>
                                <div className='font-kodemono text-xl font-medium text-gray-200'>{currentPrice ? formatPrice(currentPrice, uppercasePair) : '-'}</div>
                            </div>
                            <div className='flex h-full items-center justify-center text-gray-500'>Main Chart Area</div>
                        </div>
                    </div>
                </div>

                {/* Histogram Section */}
                <div className='absolute right-0 bottom-0 left-0 h-[300px]'>
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
