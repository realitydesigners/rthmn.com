'use client';

import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useWebSocket } from '@/providers/WebsocketProvider';
import CandleChart, { ChartDataPoint } from '@/components/Charts/CandleChart';
import { useUser } from '@/providers/UserProvider';
import { formatPrice } from '@/utils/instruments';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { ResoBox } from '@/components/Charts/ResoBox';
import { useTimeframeStore } from '@/stores/timeframeStore';
import { TimeFrameSlider } from '@/components/Panels/PanelComponents/TimeFrameSlider';
import Histogram from '@/components/Charts/Histogram';
import ChartControls from '@/components/Charts/CandleChart/ChartControls';
import { Box } from '@/types/types';
import { BoxValuesDebug } from '@/components/Debug/BoxValuesDebug';
import { processLiveCandleUpdate } from '@/utils/chartDataProcessor';

export interface ExtendedBoxSlice {
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

    // Add refs for box management
    const boxMapRef = useRef<Map<string, Box[]>>(new Map());
    const lastPriceRef = useRef<number | null>(null);
    const currentCandleRef = useRef<ChartDataPoint | null>(null);

    const settings = useTimeframeStore(useCallback((state) => (pair ? state.getSettingsForPair(pair) : state.global.settings), [pair]));
    const updatePairSettings = useTimeframeStore((state) => state.updatePairSettings);
    const initializePair = useTimeframeStore((state) => state.initializePair);
    const [boxVisibilityFilter, setBoxVisibilityFilter] = useState<'all' | 'positive' | 'negative'>('all');
    const [showBoxLevels, setShowBoxLevels] = useState(false);
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

    // Initialize box data
    useEffect(() => {
        if (chartData.histogramBoxes.length > 0) {
            setHistogramData(chartData.histogramBoxes);
        }
    }, [chartData]);

    // Update candle data when price updates
    useEffect(() => {
        if (!currentPrice || !boxSlice?.currentOHLC) return;

        // Update both candle and histogram data together to ensure synchronization
        const timestamp = new Date().getTime();

        setCandleData((prev) => {
            return processLiveCandleUpdate(
                prev,
                {
                    timestamp,
                    price: currentPrice,
                    ohlc: boxSlice.currentOHLC,
                },
                currentCandleRef
            );
        });

        // Update histogram data with current box values
        setHistogramData((prev) => {
            const newSlice: ExtendedBoxSlice = {
                timestamp: new Date(timestamp).toISOString(),
                progressiveValues: boxSlice.boxes.map((box) => ({
                    high: box.high,
                    low: box.low,
                    value: box.value,
                })),
                currentOHLC: boxSlice.currentOHLC,
            };

            // Keep only the last N frames to prevent memory buildup
            const MAX_FRAMES = 2000;
            const updatedFrames = [...prev, newSlice];
            return updatedFrames.slice(-MAX_FRAMES);
        });
    }, [currentPrice, boxSlice?.currentOHLC, boxSlice?.boxes]);

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

    useEffect(() => {
        if (chartData.processedCandles.length > 0) {
            setCandleData(chartData.processedCandles);
            setHistogramData(chartData.histogramBoxes);
        }
    }, [chartData]);

    console.log(histogramData);

    return (
        <div className='flex h-auto w-full flex-col pt-14'>
            <div className='relative flex h-[calc(100vh-250px-56px)] w-full flex-1 flex-col'>
                <div className='flex h-full w-full flex-1'>
                    <div className='h-full w-3/4 p-4'>
                        <div className='relative flex h-full flex-col overflow-hidden border border-[#222] bg-black'>
                            <ChartControls
                                showBoxLevels={showBoxLevels}
                                setShowBoxLevels={setShowBoxLevels}
                                boxVisibilityFilter={boxVisibilityFilter}
                                setBoxVisibilityFilter={setBoxVisibilityFilter}
                                currentPrice={currentPrice ? formatPrice(currentPrice, uppercasePair) : undefined}
                                pair={uppercasePair}
                            />
                            <div className='h-full min-h-[600px] w-full'>
                                {candleData && candleData.length > 0 ? (
                                    <>
                                        <CandleChart
                                            candles={candleData}
                                            initialVisibleData={candleData}
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
                                            showBoxLevels={showBoxLevels}
                                        />
                                    </>
                                ) : (
                                    <div className='flex h-full items-center justify-center'>Loading Chart...</div>
                                )}
                            </div>
                        </div>
                        <div className='mt-8 h-[200px] w-full px-4'>
                            <div className='flex h-full flex-col border border-[#222] bg-black p-2'>
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
                    <div className='h-full w-1/4 border-r border-[#222] p-4'>
                        <div className='flex h-full flex-col border border-[#222] bg-black p-4'>
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
                        <div className='mt-4'>
                            <BoxValuesDebug resoBoxes={boxSlice?.boxes} histogramData={histogramData} startIndex={settings.startIndex} maxBoxCount={settings.maxBoxCount} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(PairClient);
