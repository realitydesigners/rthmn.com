'use client';
import React, { useState, useEffect, useRef } from 'react';
import { BoxSlice, Box } from '@/types/types';
import HistogramManager from '@/components/Histogram/HistogramManager';
import { LineChart, ChartDataPoint } from '@/components/LineChart';
import { useDraggableHeight } from '@/hooks/useDraggableHeight';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useSelectedFrame } from '@/hooks/useSelectedFrame';

interface ChartData {
    processedCandles: ChartDataPoint[];
    initialVisibleData: ChartDataPoint[];
    histogramBoxes: BoxSlice[];
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

const Client = ({ pair, chartData }: { pair: string; chartData: ChartData }) => {
    const [candleData, setCandleData] = useState<ChartDataPoint[]>(chartData.processedCandles);
    const [histogramData, setHistogramData] = useState<BoxSlice[]>(chartData.histogramBoxes);
    const { boxOffset, handleOffsetChange } = useUrlParams(pair);
    const { selectedFrame, selectedFrameIndex, handleFrameSelect } = useSelectedFrame();
    const [visibleBoxesCount, setVisibleBoxesCount] = useState(chartData.histogramPreProcessed.defaultVisibleBoxesCount);
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
        initialHeight: chartData.histogramPreProcessed.defaultHeight,
        minHeight: 100,
        maxHeight: 350,
    });

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
                    selectedFrame={selectedFrame}
                    selectedFrameIndex={selectedFrameIndex}
                    onFrameSelect={handleFrameSelect}
                    isDragging={isDragging}
                    onDragStart={handleDragStart}
                    containerWidth={rthmnVisionDimensions.width}
                    preProcessedData={{
                        maxSize: chartData.histogramPreProcessed.maxSize,
                        initialFramesWithPoints: chartData.histogramPreProcessed.initialFramesWithPoints,
                    }}
                />
            </div>
        </div>
    );
};

export default React.memo(Client);
