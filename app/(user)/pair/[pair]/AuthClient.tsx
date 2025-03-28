'use client';

import React, { useEffect, useRef, useState } from 'react';
import CandleChart, { ChartDataPoint } from '@/components/Charts/CandleChart';
import { useDraggableHeight } from '@/hooks/useDraggableHeight';
import { useSelectedFrame } from '@/hooks/useSelectedFrame';
import { useUrlParams } from '@/hooks/useUrlParams';
import { Box, BoxSlice } from '@/types/types';
import Histogram from '@/components/Charts/Histogram';

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

const HistogramValues: React.FC<{ data: BoxSlice[] }> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const BOX_WIDTH = 35;
    const BOX_HEIGHT = 20;
    const MAX_FRAMES = 1000;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get last 1000 frames
        const visibleFrames = data.slice(Math.max(0, data.length - MAX_FRAMES));
        console.log('Number of frames after deduplication:', visibleFrames.length);

        // Calculate dimensions
        const totalWidth = visibleFrames.length * BOX_WIDTH;
        const totalHeight = visibleFrames[0].boxes.length * BOX_HEIGHT;

        // Set canvas size
        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // Clear canvas with dark background
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Draw each frame's boxes
        visibleFrames.forEach((frame, frameIndex) => {
            frame.boxes.forEach((box, boxIndex) => {
                const x = frameIndex * BOX_WIDTH;
                const y = boxIndex * BOX_HEIGHT;

                // Draw box background
                ctx.fillStyle = box.value > 0 ? 'rgba(34, 255, 231, 0.1)' : 'rgba(255, 110, 134, 0.1)';
                ctx.fillRect(x, y, BOX_WIDTH, BOX_HEIGHT);

                // Draw value text
                ctx.fillStyle = box.value > 0 ? '#22FFE7' : '#FF6E86';
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Preserve trailing zeros by padding the number to match the box size pattern
                const displayValue = box.value.toString();

                // Adjust font size if the text is too wide
                const textWidth = ctx.measureText(displayValue).width;
                if (textWidth > BOX_WIDTH - 4) {
                    const newFontSize = Math.floor(((BOX_WIDTH - 4) * 8) / textWidth);
                    ctx.font = `8px monospace`;
                }

                // Draw the value with proper sign
                ctx.fillText(box.value >= 0 ? displayValue : `-${displayValue}`, x + BOX_WIDTH / 2, y + BOX_HEIGHT / 2);
            });
        });
    }, [data]);

    if (!data.length) return null;

    return (
        <div className='h-[800px] w-full overflow-auto bg-[#121212]'>
            <canvas ref={canvasRef} className='block' />
        </div>
    );
};

const AuthClient = ({ pair, chartData }: { pair: string; chartData: ChartData }) => {
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
            {/* <div className='relative h-full w-full'>
                <CandleChart candles={candleData} initialVisibleData={chartData.initialVisibleData} pair={pair} />
            </div> */}
            <div className='absolute right-0 bottom-0 left-0 z-[2000]'>
                <HistogramValues data={histogramData} />
                {/* <Histogram
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
                /> */}
            </div>
        </div>
    );
};

export default React.memo(AuthClient);
