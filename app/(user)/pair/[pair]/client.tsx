'use client';
import React, { useState, useEffect, useRef } from 'react';
import { BoxSlice, PairData, ViewType } from '@/types/types';
import HistogramManager from '@/components/Histogram/HistogramManager';
import { LineChart, ChartDataPoint } from '@/components/LineChart';
import { useAuth } from '@/providers/SupabaseProvider';
import { useDraggableHeight } from '@/hooks/useDraggableHeight';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useSelectedFrame } from '@/hooks/useSelectedFrame';
import { createBoxCalculator } from '../boxCalculator';

interface ChartData {
    processedCandles: ChartDataPoint[];
    initialVisibleData: ChartDataPoint[];
}

interface DashboardClientProps {
    pair: string;
    chartData: ChartData;
}

const Client: React.FC<DashboardClientProps> = ({ pair, chartData }) => {
    const { session } = useAuth();
    const [initialData, setInitialData] = useState<BoxSlice[]>([]);
    const [candleData, setCandleData] = useState<ChartDataPoint[]>(chartData.processedCandles);
    const [boxData, setBoxData] = useState<any>(null);
    const [histogramData, setHistogramData] = useState<BoxSlice[]>([]);
    const { boxOffset, handleOffsetChange } = useUrlParams(pair);
    const { selectedFrame, selectedFrameIndex, handleFrameSelect } = useSelectedFrame();
    const [visibleBoxesCount, setVisibleBoxesCount] = useState(16);
    const [viewType, setViewType] = useState<ViewType>('oscillator');
    const containerRef = useRef<HTMLDivElement>(null);
    const [rthmnVisionDimensions, setRthmnVisionDimensions] = useState({
        width: 0,
        height: 0,
    });

    const {
        height: histogramHeight,
        isDragging,
        handleDragStart,
    } = useDraggableHeight({
        initialHeight: 200,
        minHeight: 100,
        maxHeight: 350,
    });

    const handleViewChange = (newViewType: ViewType) => {
        setViewType(newViewType);
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const containerWidth = containerRef.current.clientWidth;
                const newRthmnVisionHeight = containerHeight - histogramHeight - 80;
                setRthmnVisionDimensions({
                    width: containerWidth,
                    height: Math.max(newRthmnVisionHeight, 200),
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, [histogramHeight]);

    useEffect(() => {
        if (session?.access_token) {
            const token = session.access_token;
            const CANDLE_LIMIT = 200;

            const fetchCandles = async () => {
                try {
                    const response = await fetch(`/api/getCandles?pair=${pair.toUpperCase()}&limit=${CANDLE_LIMIT}&token=${token}`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const { data } = await response.json();

                    // Create a reversed copy of the data
                    const reversedData = [...data].reverse();

                    // Transform the data to match LineChart's expected format
                    const formattedCandles = reversedData.map((candle) => ({
                        timestamp: new Date(candle.timestamp).getTime(),
                        close: Number(candle.close),
                        high: Number(candle.high),
                        low: Number(candle.low),
                        open: Number(candle.open),
                        volume: Number(candle.volume),
                        scaledX: 0,
                        scaledY: 0,
                        scaledOpen: 0,
                        scaledHigh: 0,
                        scaledLow: 0,
                        scaledClose: 0,
                    }));

                    // Calculate boxes for each timestamp
                    const boxTimeseriesData = reversedData.map((_, index) => {
                        const candleSlice = reversedData.slice(0, index + 1);
                        const boxCalculator = createBoxCalculator(pair.toUpperCase());
                        const boxResults = boxCalculator.calculateBoxArrays(candleSlice);
                        return {
                            timestamp: reversedData[index].timestamp,
                            boxes: boxResults,
                            currentOHLC: {
                                open: Number(reversedData[index].open),
                                high: Number(reversedData[index].high),
                                low: Number(reversedData[index].low),
                                close: Number(reversedData[index].close),
                            },
                        };
                    });

                    // Transform box data for HistogramManager
                    const histogramBoxes = boxTimeseriesData.map((timepoint) => ({
                        timestamp: timepoint.timestamp,
                        boxes: Object.entries(timepoint.boxes).map(([size, data]: [string, { high: number; low: number; value: number }]) => ({
                            high: Number(data.high),
                            low: Number(data.low),
                            value: data.value,
                        })),
                        currentOHLC: timepoint.currentOHLC,
                    }));

                    console.log('Box timeseries data:', boxTimeseriesData);
                    console.log('Histogram data:', histogramBoxes);

                    setCandleData(formattedCandles);
                    setBoxData(boxTimeseriesData);
                    setHistogramData(histogramBoxes);
                } catch (error) {
                    console.error('Error fetching candle data:', error);
                    // On error, keep using the server-processed data
                    setCandleData(chartData.processedCandles);
                }
            };

            fetchCandles();
        }
    }, [session, pair, chartData.processedCandles]);

    const BoxTable = () => {
        if (!boxData?.length) return null;

        return (
            <div className='max-h-[400px] overflow-auto'>
                <table className='w-full text-left text-sm text-gray-300'>
                    <thead className='sticky top-0 bg-gray-900 text-xs uppercase'>
                        <tr>
                            <th className='px-6 py-3'>Timestamp</th>
                            {Object.keys(boxData[0].boxes).map((size) => (
                                <th key={size} className='px-6 py-3'>
                                    Box {size}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-800'>
                        {boxData.map((timepoint) => (
                            <tr key={timepoint.timestamp} className='bg-black hover:bg-gray-900'>
                                <td className='px-6 py-4 whitespace-nowrap'>{new Date(timepoint.timestamp).toLocaleString()}</td>
                                {Object.entries(timepoint.boxes).map(([size, data]: [string, any]) => (
                                    <td key={size} className='px-6 py-4'>
                                        <div className='space-y-1'>
                                            <div className='text-gray-400'>H: {data.high.toFixed(3)}</div>
                                            <div className='text-gray-400'>L: {data.low.toFixed(3)}</div>
                                            <div className={`font-medium ${data.value > 0 ? 'text-green-500' : 'text-red-500'}`}>V: {data.value}</div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className='relative flex h-screen w-full'>
            <LineChart candles={candleData} initialVisibleData={chartData.initialVisibleData} />
            {/* <div className='relative bottom-0 z-90 shrink-0'>
                <HistogramManager
                    data={histogramData}
                    height={histogramHeight}
                    boxOffset={boxOffset}
                    onOffsetChange={handleOffsetChange}
                    visibleBoxesCount={visibleBoxesCount}
                    viewType={viewType}
                    onViewChange={handleViewChange}
                    selectedFrame={selectedFrame}
                    selectedFrameIndex={selectedFrameIndex}
                    onFrameSelect={handleFrameSelect}
                    isDragging={isDragging}
                    onDragStart={handleDragStart}
                    containerWidth={rthmnVisionDimensions.width}
                />
            </div> */}
        </div>
    );
};

export default React.memo(Client);
