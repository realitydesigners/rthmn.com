import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, BoxSlice } from '@/types/types';
import { useColorStore, BoxColors } from '@/stores/colorStore';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useParams } from 'next/navigation';
import { drawHistogramLine } from './HistogramLine';

const HistogramControls: React.FC<{
    boxOffset: number;
    onOffsetChange: (newOffset: number) => void;
    totalBoxes: number;
    visibleBoxesCount: number;
}> = ({ boxOffset, onOffsetChange, totalBoxes, visibleBoxesCount }) => {
    // Convert boolean values to string attributes for consistency
    const isFirstDisabled = boxOffset === 0 ? true : false;
    const isLastDisabled = boxOffset >= totalBoxes - visibleBoxesCount ? true : false;

    return (
        <div className='top-0 right-0 bottom-0 flex h-full w-16 flex-col items-center justify-center border-l border-[#181818] bg-black'>
            <button
                onClick={() => onOffsetChange(Math.max(0, boxOffset - 1))}
                disabled={isFirstDisabled}
                className='flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50'>
                <div className='text-2xl'>+</div>
            </button>
            <div className='text-center text-white'>
                <div>{boxOffset}</div>
                <div>{totalBoxes - 1}</div>
            </div>
            <button
                onClick={() => onOffsetChange(Math.min(totalBoxes - visibleBoxesCount, boxOffset + 1))}
                disabled={isLastDisabled}
                className='flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50'>
                <div className='text-2xl'>-</div>
            </button>
        </div>
    );
};

const HistogramSimple: React.FC<{
    data: BoxSlice[];
    boxOffset?: number;
    visibleBoxesCount?: number;
    onOffsetChange?: (newOffset: number) => void;
    showLine?: boolean;
}> = ({ data, boxOffset = 0, visibleBoxesCount = 7, onOffsetChange, showLine = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const BOX_WIDTH = 25;
    const BOX_HEIGHT = 25; // Fixed box height
    const MAX_FRAMES = 1000;
    const VISIBLE_BOXES_COUNT = visibleBoxesCount;
    const { boxColors } = useColorStore();
    const params = useParams();
    const { handleOffsetChange } = useUrlParams(params.pair as string);
    const [isClient, setIsClient] = useState(false);

    // Set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Improved frame deduplication logic
    const uniqueFrames = useMemo(() => {
        if (!data.length) return [];

        const getVisibleBoxesSignature = (frame: BoxSlice) => {
            // Sort boxes by absolute value
            const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));

            // Get visible boxes based on current offset
            const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);

            // Split into negative and positive boxes
            const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);

            // Create ordered boxes array
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Create signature from ordered boxes
            return orderedBoxes.map((box) => `${box.value}`).join('|');
        };

        return data.reduce((acc: BoxSlice[], frame, index) => {
            // Always include the first frame
            if (index === 0) {
                return [frame];
            }

            const prevFrame = acc[acc.length - 1];
            const currentSignature = getVisibleBoxesSignature(frame);
            const prevSignature = getVisibleBoxesSignature(prevFrame);

            // Only add frame if the visible boxes are different
            if (currentSignature !== prevSignature) {
                return [...acc, frame];
            }

            return acc;
        }, []);
    }, [data, boxOffset, VISIBLE_BOXES_COUNT]);

    // Add effect to scroll to the right when offset changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [boxOffset, uniqueFrames]);

    // Update canvas when frames change - only on client side
    useEffect(() => {
        if (!isClient) return;

        const canvas = canvasRef.current;
        if (!canvas || !uniqueFrames.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const visibleFrames = uniqueFrames.slice(Math.max(0, uniqueFrames.length - MAX_FRAMES));
        const totalWidth = visibleFrames.length * BOX_WIDTH;
        const totalHeight = VISIBLE_BOXES_COUNT * BOX_HEIGHT;

        // Set fixed dimensions for canvas
        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // Clear canvas with background color
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Draw boxes for each frame
        visibleFrames.forEach((frame, frameIndex) => {
            const x = frameIndex * BOX_WIDTH;

            // Sort boxes
            const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
            const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);
            const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Find largest box to determine coloring
            const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
            const isLargestPositive = largestBox.value > 0;

            // Draw grid lines
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 0.05)`;
            ctx.lineWidth = 0.3;
            for (let i = 0; i <= VISIBLE_BOXES_COUNT; i++) {
                const y = Math.round(i * BOX_HEIGHT);
                ctx.moveTo(x, y);
                ctx.lineTo(x + BOX_WIDTH, y);
            }
            ctx.stroke();

            // Draw boxes and values
            orderedBoxes.forEach((box, boxIndex) => {
                const currentY = boxIndex * BOX_HEIGHT;
                const isPositiveBox = box.value > 0;

                // Draw box background
                if (isLargestPositive) {
                    if (isPositiveBox) {
                        ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 0.1)`;
                    } else {
                        ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, .3)`;
                    }
                } else {
                    if (isPositiveBox) {
                        ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, .3)`;
                    } else {
                        ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 0.1)`;
                    }
                }
                ctx.fillRect(x, currentY, BOX_WIDTH, BOX_HEIGHT);

                // Draw box value
                ctx.fillStyle = '#ffffff';
                ctx.font = '7px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const absValue = Math.abs(box.value);
                const displayValue = absValue.toFixed(0);
                ctx.fillText(box.value >= 0 ? displayValue : `-${displayValue}`, x + BOX_WIDTH / 2, currentY + BOX_HEIGHT / 2);
            });
        });

        // Draw the line if enabled
        if (showLine) {
            drawHistogramLine({
                ctx,
                uniqueFrames: visibleFrames,
                boxOffset,
                VISIBLE_BOXES_COUNT,
                BOX_WIDTH,
                containerHeight: totalHeight,
                boxColors,
            });
        }

        // Scroll to the latest frame after rendering
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [uniqueFrames, boxColors, boxOffset, showLine, isClient]);

    if (!uniqueFrames.length) return null;

    // Fixed dimensions for the canvas to ensure hydration consistency
    const canvasWidth = uniqueFrames.length * BOX_WIDTH;
    const canvasHeight = VISIBLE_BOXES_COUNT * BOX_HEIGHT;

    // Fixed canvas dimensions for consistent server/client rendering
    return (
        <div className='relative h-full w-full' ref={containerRef}>
            <div ref={scrollContainerRef} className='scrollbar-hide flex h-full w-full items-center overflow-x-auto pr-20'>
                <canvas ref={canvasRef} className='histogram-canvas' width={canvasWidth > 0 ? canvasWidth : 100} height={canvasHeight} />
            </div>
            <div className='absolute top-0 right-0 bottom-0'>
                <HistogramControls
                    boxOffset={boxOffset}
                    onOffsetChange={onOffsetChange || handleOffsetChange}
                    totalBoxes={Math.max(...uniqueFrames.map((frame) => frame.boxes.length))}
                    visibleBoxesCount={VISIBLE_BOXES_COUNT}
                />
            </div>
        </div>
    );
};

export default HistogramSimple;
