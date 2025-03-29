'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';

import { processProgressiveBoxValues } from '@/utils/boxDataProcessor';

import { Box, BoxSlice } from '@/types/types';
import { PairResoBox } from '@/app/(user)/dashboard/PairResoBox';
import { useWebSocket } from '@/providers/WebsocketProvider';
import CandleChart, { ChartDataPoint } from '@/components/Charts/CandleChart';
import { useUser } from '@/providers/UserProvider';
import { formatPrice } from '@/utils/instruments';
import HistogramSimple from '@/components/Charts/Histogram/HistogramSimple';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { ResoBox } from '@/components/Charts/ResoBox';
import { useTimeframeStore } from '@/stores/timeframeStore';
import { TimeFrameSlider } from '@/components/Panels/PanelComponents/TimeFrameSlider';
import BoxTimeline from '@/components/Charts/BoxTimeline';

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
    const [candleData, setCandleData] = useState<ChartDataPoint[]>(chartData.processedCandles);
    const [histogramData, setHistogramData] = useState<ExtendedBoxSlice[]>(chartData.histogramBoxes);
    const [showHistogramLine, setShowHistogramLine] = useState(false);
    const settings = useTimeframeStore(useCallback((state) => (pair ? state.getSettingsForPair(pair) : state.global.settings), [pair]));
    const updatePairSettings = useTimeframeStore((state) => state.updatePairSettings);
    const initializePair = useTimeframeStore((state) => state.initializePair);

    // Add state for box visibility filter
    const [boxVisibilityFilter, setBoxVisibilityFilter] = useState<'all' | 'positive' | 'negative'>('all');

    // --- Add state for shared hover ---
    const [hoveredTimestamp, setHoveredTimestamp] = useState<number | null>(null);

    // --- Add callback for hover changes ---
    const handleHoverChange = useCallback((timestamp: number | null) => {
        setHoveredTimestamp(timestamp);
    }, []);

    // Convert pair to uppercase for consistency with pairData keys
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

    useEffect(() => {
        setCandleData(chartData.processedCandles);
        setHistogramData(chartData.histogramBoxes);
    }, [chartData]);

    // Memoize the filtered boxes for ResoBox
    const filteredBoxSlice = useMemo(() => {
        if (!boxSlice?.boxes) {
            return undefined;
        }
        const sliced = {
            ...boxSlice,
            boxes: boxSlice.boxes.slice(settings.startIndex, settings.startIndex + settings.maxBoxCount) || [],
        };
        // console.log('[AuthClient] ResoBox Slice Values:', sliced.boxes.map(b => b.value));
        return sliced;
    }, [boxSlice, settings.startIndex, settings.maxBoxCount]);

    // Calculate the slice from the *actual processed data* used by Chart/Histogram
    const chartActualSliceValues = useMemo(() => {
        // Get the latest frame from the processed histogram data
        const latestFrame = histogramData && histogramData.length > 0 ? histogramData[histogramData.length - 1] : null;

        if (!latestFrame?.progressiveValues) {
            return [];
        }
        // Apply the same slice to the *already processed* values for the latest frame
        // (These values should already be sorted by descending absolute value)
        const sliced = latestFrame.progressiveValues.slice(settings.startIndex, settings.startIndex + settings.maxBoxCount);
        // Extract values
        return sliced.map((b) => b.value);
    }, [histogramData, settings.startIndex, settings.maxBoxCount]);

    // console.log('candleData', candleData);
    // console.log(filteredBoxSlice);

    console.log(histogramData, '    histogramData');

    return (
        <div className='flex h-auto w-full flex-col bg-[#0a0a0a] pt-14'>
            {/* Main Content Area - Adjust layout */}
            <div className='relative flex h-[calc(100vh-250px-56px)] w-full flex-1 flex-col'>
                {' '}
                {/* Adjusted height calc */}
                {/* Top row: ResoBox and Chart */}
                <div className='flex h-[calc(100%-120px)] w-full flex-1'>
                    {' '}
                    {/* Adjusted height for new rows */}
                    <div className='h-full w-1/4 border-r border-[#222] p-4'>
                        <div className='flex h-full flex-col rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-4'>
                            <div className='relative min-h-[400px] flex-1 p-2 pr-16'>
                                {filteredBoxSlice && boxColors && (
                                    <ResoBox slice={filteredBoxSlice} className='h-full w-full' boxColors={boxColors} pair={pair} showPriceLines={settings.showPriceLines} />
                                )}
                            </div>

                            {/* Timeframe Control */}
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
                    {/* Main Chart Area */}
                    <div className='h-full w-3/4 p-4'>
                        <div className='flex h-full flex-col rounded-xl border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-4'>
                            <div className='mb-4 flex items-center gap-6'>
                                <h1 className='font-outfit text-2xl font-bold tracking-wider text-white'>{uppercasePair}</h1>
                                <div className='font-kodemono text-xl font-medium text-gray-200'>{currentPrice ? formatPrice(currentPrice, uppercasePair) : '-'}</div>
                            </div>

                            {/* Add Visibility Toggle Buttons */}
                            <div className='mb-2 flex justify-end gap-2'>
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

                            <div className='relative min-h-[500px] w-full flex-1'>
                                {candleData && candleData.length > 0 ? (
                                    <CandleChart
                                        candles={candleData}
                                        initialVisibleData={candleData.slice(-100)} // Example initial slice
                                        pair={pair}
                                        histogramBoxes={histogramData.map((frame) => ({
                                            timestamp: frame.timestamp,
                                            boxes: frame.progressiveValues,
                                        }))}
                                        boxOffset={settings.startIndex}
                                        visibleBoxesCount={settings.maxBoxCount}
                                        boxVisibilityFilter={boxVisibilityFilter}
                                        // --- Pass hover state down ---
                                        hoveredTimestamp={hoveredTimestamp}
                                        onHoverChange={handleHoverChange}
                                    />
                                ) : (
                                    <div className='flex h-full items-center justify-center'>Loading Chart...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Middle row: Debug Table */}
                {/* <div className='w-full border-t border-[#222] bg-[#0f0f0f] p-4 text-xs text-gray-400'>
                    <h3 className='mb-2 font-semibold text-gray-200'>Debug: Box Slice Comparison (Live Data)</h3>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <h4 className='mb-1 font-medium text-gray-300'>ResoBox Slice Values:</h4>
                            <pre className='overflow-x-auto rounded bg-black p-2 text-xs'>{JSON.stringify(filteredBoxSlice?.boxes.map((b) => b.value) || [], null, 2)}</pre>
                        </div>
                        <div>
                            <h4 className='mb-1 font-medium text-gray-300'>Chart/Histogram Slice Values (Latest Processed):</h4>
                            <pre className='overflow-x-auto rounded bg-black p-2 text-xs'>{JSON.stringify(chartActualSliceValues, null, 2)}</pre>
                        </div>
                    </div>
                    <p className='mt-2 text-gray-500'>Comparing slice applied to raw live data (ResoBox) vs slice applied to latest processed data frame (Chart/Histogram).</p>
                </div> */}
                {/* Bottom row: BoxTimeline Component */}
                <div className='h-[200px] w-full border-t border-b border-[#222] bg-[#111] p-2'>
                    {' '}
                    {/* Added height and bottom border */}
                    <h3 className='mb-1 pl-2 text-sm font-semibold text-gray-200'>Box Timeline</h3>
                    {boxColors && histogramData && (
                        <BoxTimeline
                            data={histogramData}
                            boxOffset={settings.startIndex}
                            visibleBoxesCount={settings.maxBoxCount}
                            boxVisibilityFilter={boxVisibilityFilter}
                            boxColors={boxColors}
                            className='h-full' // Ensure it fills its container
                            // --- Pass hover state down ---
                            hoveredTimestamp={hoveredTimestamp}
                            onHoverChange={handleHoverChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(AuthClient);
