'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useWebSocket } from '@/providers/WebsocketProvider';
import CandleChart, { ChartDataPoint } from '@/components/Charts/CandleChart';
import { useUser } from '@/providers/UserProvider';
import { formatPrice } from '@/utils/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { ResoBox } from '@/components/Charts/ResoBox';
import { useTimeframeStore } from '@/stores/timeframeStore';
import { TimeFrameSlider } from '@/components/Panels/PanelComponents/TimeFrameSlider';
import Histogram from '@/components/Charts/Histogram';

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
}

const PairClient = ({ pair, chartData }: { pair: string; chartData: ChartData }) => {
    const { pairData } = useDashboard();
    const { priceData } = useWebSocket();
    const { boxColors } = useUser();
    const [candleData, setCandleData] = useState<ChartDataPoint[]>(chartData.processedCandles);
    const [histogramData, setHistogramData] = useState<ExtendedBoxSlice[]>(chartData.histogramBoxes);
    const settings = useTimeframeStore(useCallback((state) => (pair ? state.getSettingsForPair(pair) : state.global.settings), [pair]));
    const updatePairSettings = useTimeframeStore((state) => state.updatePairSettings);
    const initializePair = useTimeframeStore((state) => state.initializePair);
    const [boxVisibilityFilter, setBoxVisibilityFilter] = useState<'all' | 'positive' | 'negative'>('all');
    const [hoveredTimestamp, setHoveredTimestamp] = useState<number | null>(null);

    const handleHoverChange = useCallback((timestamp: number | null) => {
        setHoveredTimestamp(timestamp);
    }, []);

    const uppercasePair = pair.toUpperCase();
    const currentPrice = priceData[uppercasePair]?.price;
    const boxSlice = pairData[uppercasePair]?.boxes?.[0];

    // Handle timeframe changes for both ResoBox and Histogram
    const handleTimeframeChange = useCallback(
        (property: string, value: number | boolean) => {
            if (pair && typeof value === 'number') {
                updatePairSettings(pair, { [property]: value });
            }
        },
        [pair, updatePairSettings]
    );

    // Initialize timeframe settings
    useEffect(() => {
        if (pair) {
            initializePair(pair);
        }
    }, [pair, initializePair]);

    // Memoize the filtered boxes for ResoBox
    const filteredBoxSlice = useMemo(() => {
        if (!boxSlice?.boxes) {
            return undefined;
        }
        const sliced = {
            ...boxSlice,
            boxes: boxSlice.boxes.slice(settings.startIndex, settings.startIndex + settings.maxBoxCount) || [],
        };
        return sliced;
    }, [boxSlice, settings.startIndex, settings.maxBoxCount]);

    // Add timestamp verification and data synchronization

    // Update candleData and histogramData when chartData changes
    useEffect(() => {
        if (chartData.processedCandles.length > 0) {
            setCandleData(chartData.processedCandles);
            setHistogramData(chartData.histogramBoxes);
        }
    }, [chartData]);

    return (
        <div className='flex h-auto w-full flex-col pt-14'>
            <div className='relative flex h-[calc(100vh-250px-56px)] w-full flex-1 flex-col'>
                <div className='flex h-full w-full flex-1'>
                    <div className='h-full w-3/4 p-4'>
                        <div className='relative flex h-full flex-col overflow-hidden rounded-xl border border-[#222] bg-black'>
                            <div className='absolute top-0 right-0 left-0 z-10 p-4'>
                                <div className='mb-4 flex items-center gap-6'>
                                    <h1 className='font-outfit text-2xl font-bold tracking-wider text-white'>{uppercasePair}</h1>
                                    <div className='font-kodemono text-xl font-medium text-gray-200'>{currentPrice ? formatPrice(currentPrice, uppercasePair) : '-'}</div>
                                </div>
                            </div>
                            <div className='absolute top-4 right-12 left-0 z-10 flex justify-end gap-2'>
                                <button
                                    onClick={() => setBoxVisibilityFilter('all')}
                                    className={`rounded px-2 py-1 text-xs ${boxVisibilityFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                    All Boxes
                                </button>
                                <button
                                    onClick={() => setBoxVisibilityFilter('positive')}
                                    className={`rounded px-2 py-1 text-xs ${boxVisibilityFilter === 'positive' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                    Positive Boxes
                                </button>
                                <button
                                    onClick={() => setBoxVisibilityFilter('negative')}
                                    className={`rounded px-2 py-1 text-xs ${boxVisibilityFilter === 'negative' ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                    Negative Boxes
                                </button>
                            </div>

                            {/* Full-size container for CandleChart */}
                            <div className='h-full min-h-[600px] w-full'>
                                {candleData && candleData.length > 0 ? (
                                    <CandleChart
                                        candles={candleData}
                                        initialVisibleData={candleData.slice(-100)}
                                        pair={pair}
                                        histogramBoxes={histogramData.map((frame) => ({
                                            timestamp: frame.timestamp,
                                            boxes: frame.progressiveValues,
                                        }))}
                                        boxOffset={settings.startIndex}
                                        visibleBoxesCount={settings.maxBoxCount}
                                        boxVisibilityFilter={boxVisibilityFilter}
                                        hoveredTimestamp={hoveredTimestamp}
                                        onHoverChange={handleHoverChange}
                                    />
                                ) : (
                                    <div className='flex h-full items-center justify-center'>Loading Chart...</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='h-full w-1/4 border-r border-[#222] p-4'>
                        <div className='flex h-full flex-col rounded-xl border border-[#222] bg-black p-4'>
                            <div className='relative flex-1 p-2 pr-16'>
                                {filteredBoxSlice && boxColors && (
                                    <ResoBox slice={filteredBoxSlice} className='h-full w-full' boxColors={boxColors} pair={pair} showPriceLines={settings.showPriceLines} />
                                )}
                            </div>
                            {boxSlice?.boxes && (
                                <div className='mt-4 h-16 w-full'>
                                    <TimeFrameSlider
                                        startIndex={settings.startIndex}
                                        maxBoxCount={settings.maxBoxCount}
                                        boxes={boxSlice.boxes}
                                        onStyleChange={handleTimeframeChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='h-[200px] w-full px-4'>
                    <div className='flex h-full flex-col rounded-xl border border-[#222] bg-black p-2'>
                        {boxColors && histogramData && (
                            <Histogram
                                data={histogramData}
                                boxOffset={settings.startIndex}
                                visibleBoxesCount={settings.maxBoxCount}
                                boxVisibilityFilter={boxVisibilityFilter}
                                boxColors={boxColors}
                                className='h-full'
                                hoveredTimestamp={hoveredTimestamp}
                                onHoverChange={handleHoverChange}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(PairClient);
