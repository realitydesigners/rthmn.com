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

    // Calculate box data whenever candleData changes
    useEffect(() => {
        if (!candleData.length) return;

        try {
            // Convert candleData back to the format needed for box calculations
            const reversedData = candleData.map((candle) => ({
                timestamp: new Date(candle.timestamp).toISOString(),
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                mid: {
                    o: candle.open.toString(),
                    h: candle.high.toString(),
                    l: candle.low.toString(),
                    c: candle.close.toString(),
                },
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
                        open: reversedData[index].open,
                        high: reversedData[index].high,
                        low: reversedData[index].low,
                        close: reversedData[index].close,
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

            setBoxData(boxTimeseriesData);
            setHistogramData(histogramBoxes);
        } catch (error) {
            console.error('Error calculating box data:', error);
        }
    }, [candleData, pair]);

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

    // Update candleData when chartData changes
    useEffect(() => {
        setCandleData(chartData.processedCandles);
    }, [chartData]);

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

    return (
        <div className='relative flex h-screen w-full'>
            <div className='relative h-[90vh] w-full'>
                <LineChart candles={candleData} initialVisibleData={chartData.initialVisibleData} />
            </div>
            {/* <div className='fixed bottom-2 z-90 shrink-0'>
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
