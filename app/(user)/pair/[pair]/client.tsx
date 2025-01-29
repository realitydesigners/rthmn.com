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
    histogramBoxes: BoxSlice[];
}

interface DashboardClientProps {
    pair: string;
    chartData: ChartData;
}

const Client: React.FC<DashboardClientProps> = ({ pair, chartData }) => {
    const { session } = useAuth();
    const [candleData, setCandleData] = useState<ChartDataPoint[]>(chartData.processedCandles);
    const [histogramData, setHistogramData] = useState<BoxSlice[]>(chartData.histogramBoxes);
    const { boxOffset, handleOffsetChange } = useUrlParams(pair);
    const { selectedFrame, selectedFrameIndex, handleFrameSelect } = useSelectedFrame();
    const [visibleBoxesCount, setVisibleBoxesCount] = useState(8);
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

    // Update data when chartData changes
    useEffect(() => {
        setCandleData(chartData.processedCandles);
        setHistogramData(chartData.histogramBoxes);
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
    console.log(histogramData);

    return (
        <div className='relative flex h-screen w-full'>
            {/* <div className='relative h-[90vh] w-full'>
                <LineChart candles={candleData} initialVisibleData={chartData.initialVisibleData} />
            </div> */}
            <div className='fixed bottom-0 z-[2000] -ml-16 max-w-screen shrink-0'>
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
            </div>
        </div>
    );
};

export default React.memo(Client);
