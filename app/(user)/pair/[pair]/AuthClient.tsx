'use client';

import React, { useEffect, useRef, useState } from 'react';
import CandleChart, { ChartDataPoint } from '@/components/Charts/CandleChart';
import { useDraggableHeight } from '@/hooks/useDraggableHeight';
import { useSelectedFrame } from '@/hooks/useSelectedFrame';
import { useUrlParams } from '@/hooks/useUrlParams';
import { Box, BoxSlice } from '@/types/types';
import Histogram from '@/components/Charts/Histogram';
import { useColorStore } from '@/stores/colorStore';

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
    const HEIGHT_MULTIPLIER = 0.3;
    const MAX_FRAMES = 1000;
    const { boxColors } = useColorStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const visibleFrames = data.slice(Math.max(0, data.length - MAX_FRAMES));
        console.log('Number of frames after deduplication:', visibleFrames.length);

        const totalWidth = visibleFrames.length * BOX_WIDTH;
        const totalHeight = 800;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        visibleFrames.forEach((frame, frameIndex) => {
            const x = frameIndex * BOX_WIDTH;
            let currentY = 0;

            frame.boxes.forEach((box) => {
                const height = Math.abs(box.value) * HEIGHT_MULTIPLIER;
                const color = box.value > 0 ? boxColors.positive : boxColors.negative;
                const opacity = boxColors.styles?.opacity || 0.2;

                // Draw box background with configured opacity
                ctx.fillStyle = `${color}${Math.round(opacity * 255)
                    .toString(16)
                    .padStart(2, '0')}`;
                ctx.fillRect(x, currentY, BOX_WIDTH, height);

                if (boxColors.styles?.showBorder) {
                    // Draw borders with full opacity
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;

                    // Draw top border
                    ctx.beginPath();
                    ctx.moveTo(x, currentY);
                    ctx.lineTo(x + BOX_WIDTH, currentY);
                    ctx.stroke();

                    // Draw bottom border
                    ctx.beginPath();
                    ctx.moveTo(x, currentY + height);
                    ctx.lineTo(x + BOX_WIDTH, currentY + height);
                    ctx.stroke();
                }

                // Draw value text
                ctx.fillStyle = color;
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const displayValue = box.value.toString();
                ctx.fillText(box.value >= 0 ? displayValue : `-${displayValue}`, x + BOX_WIDTH / 2, currentY + height / 2);

                currentY += height;
            });
        });
    }, [data, boxColors]);

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
