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
    return (
        <div className='top-0 right-0 bottom-0 flex h-full w-16 flex-col items-center justify-center border-l border-[#181818] bg-black'>
            <button
                onClick={() => onOffsetChange(Math.max(0, boxOffset - 1))}
                disabled={boxOffset === 0}
                className='flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50'>
                <div className='text-2xl'>+</div>
            </button>
            <div className='text-center text-white'>
                <div>{boxOffset}</div>
                <div>{totalBoxes - 1}</div>
            </div>
            <button
                onClick={() => onOffsetChange(Math.min(totalBoxes - visibleBoxesCount, boxOffset + 1))}
                disabled={boxOffset >= totalBoxes - visibleBoxesCount}
                className='flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50'>
                <div className='text-2xl'>-</div>
            </button>
        </div>
    );
};

const drawHistogramBoxes = ({
    ctx,
    frame,
    frameIndex,
    boxOffset,
    VISIBLE_BOXES_COUNT,
    BOX_WIDTH,
    containerHeight,
    boxColors,
}: {
    ctx: CanvasRenderingContext2D;
    frame: BoxSlice;
    frameIndex: number;
    boxOffset: number;
    VISIBLE_BOXES_COUNT: number;
    BOX_WIDTH: number;
    containerHeight: number;
    boxColors: BoxColors;
}) => {
    const x = frameIndex * BOX_WIDTH;
    const boxHeight = containerHeight / VISIBLE_BOXES_COUNT;

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
        const y = Math.round(i * boxHeight);
        ctx.moveTo(x, y);
        ctx.lineTo(x + BOX_WIDTH, y);
    }
    ctx.stroke();

    // Draw boxes and values
    orderedBoxes.forEach((box, boxIndex) => {
        const currentY = boxIndex * boxHeight;
        const isPositiveBox = box.value > 0;

        // Draw box background
        if (isLargestPositive) {
            // If largest is positive, make positive boxes lighter and negative boxes darker
            if (isPositiveBox) {
                ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 0.1)`;
            } else {
                ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, .3)`;
            }
        } else {
            // If largest is negative, make negative boxes lighter and positive boxes darker
            if (isPositiveBox) {
                ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, .3)`;
            } else {
                ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 0.1)`;
            }
        }
        ctx.fillRect(x, currentY, BOX_WIDTH, boxHeight);

        // Draw box value
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const absValue = Math.abs(box.value);
        const displayValue = absValue.toString();
        ctx.fillText(box.value >= 0 ? displayValue : `-${displayValue}`, x + BOX_WIDTH / 2, currentY + boxHeight / 2);
    });
};

const HistogramSimple: React.FC<{
    data: BoxSlice[];
    boxOffset?: number;
    visibleBoxesCount?: number;
    onOffsetChange?: (newOffset: number) => void;
    showLine?: boolean;
}> = ({ data, boxOffset = 0, visibleBoxesCount = 8, onOffsetChange, showLine = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<{ [key: string]: CanvasGradient }>({});
    const BOX_WIDTH = 25;
    const MAX_FRAMES = 1000;
    const VISIBLE_BOXES_COUNT = visibleBoxesCount;
    const { boxColors } = useColorStore();
    const params = useParams();
    const { handleOffsetChange } = useUrlParams(params.pair as string);
    const [containerHeight, setContainerHeight] = useState(500);

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

    // Update container height and recalculate box heights when container size changes
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setContainerHeight(containerRef.current.clientHeight);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Update canvas when frames or container dimensions change
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !uniqueFrames.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const visibleFrames = uniqueFrames.slice(Math.max(0, uniqueFrames.length - MAX_FRAMES));
        const totalWidth = visibleFrames.length * BOX_WIDTH;

        // Ensure canvas size matches the number of frames
        canvas.width = totalWidth;
        canvas.height = containerHeight;

        // Clear canvas with background color

        ctx.fillRect(0, 0, totalWidth, containerHeight);

        // Draw boxes for each frame
        visibleFrames.forEach((frame, frameIndex) => {
            drawHistogramBoxes({
                ctx,
                frame,
                frameIndex,
                boxOffset,
                VISIBLE_BOXES_COUNT,
                BOX_WIDTH,
                containerHeight,
                boxColors,
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
                containerHeight,
                boxColors,
            });
        }

        // Scroll to the latest frame after rendering
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [uniqueFrames, boxColors, boxOffset, containerHeight, showLine]);

    if (!uniqueFrames.length) return null;

    return (
        <div className='relative h-full w-full'>
            <div ref={containerRef} className='relative h-full w-full bg-[#0a0a0a]'>
                <div ref={scrollContainerRef} className='h-full w-full overflow-x-auto pr-16'>
                    <canvas ref={canvasRef} className='block h-full' style={{ width: `${uniqueFrames.length * BOX_WIDTH}px` }} />
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
        </div>
    );
};

export default HistogramSimple;
