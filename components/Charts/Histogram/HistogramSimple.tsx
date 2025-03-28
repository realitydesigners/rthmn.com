import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, BoxSlice } from '@/types/types';
import { useColorStore } from '@/stores/colorStore';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useParams } from 'next/navigation';

const HistogramControls: React.FC<{
    boxOffset: number;
    onOffsetChange: (newOffset: number) => void;
    totalBoxes: number;
    visibleBoxesCount: number;
}> = ({ boxOffset, onOffsetChange, totalBoxes, visibleBoxesCount }) => {
    return (
        <div className='absolute top-0 right-0 bottom-1 flex h-full w-16 flex-col items-center justify-center border-l border-[#181818] bg-black'>
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

const HistogramSimple: React.FC<{ data: BoxSlice[] }> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<{ [key: string]: CanvasGradient }>({});
    const BOX_WIDTH = 25;
    const MAX_FRAMES = 1000;
    const VISIBLE_BOXES_COUNT = 8;
    const { boxColors } = useColorStore();
    const params = useParams();
    const { boxOffset, handleOffsetChange } = useUrlParams(params.pair as string);
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

    // Update gradient calculation
    const getFrameGradient = (frame: BoxSlice, ctx: CanvasRenderingContext2D) => {
        const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
        const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);

        if (visibleBoxes.length === 0) return null;

        const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
        const isPositive = largestBox.value > 0;
        const baseColor = isPositive ? boxColors.positive : boxColors.negative;

        // Create a unique key for this gradient
        const gradientKey = `${isPositive ? 'pos' : 'neg'}-${containerHeight}`;

        // Create gradient if it doesn't exist
        if (!gradientRef.current[gradientKey]) {
            const gradient = ctx.createLinearGradient(0, 0, 0, containerHeight);

            // Convert hex to RGB for manipulation
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);

            // Create gradient from darker to lighter
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);

            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.05)`);
            gradientRef.current[gradientKey] = gradient;
        }

        return {
            gradient: gradientRef.current[gradientKey],
            baseColor,
            gridColor: `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, 0.05)`,
        };
    };

    // Update canvas when frames or container dimensions change
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !uniqueFrames.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const visibleFrames = uniqueFrames.slice(Math.max(0, uniqueFrames.length - MAX_FRAMES));
        const totalWidth = visibleFrames.length * BOX_WIDTH;
        const boxHeight = containerHeight / VISIBLE_BOXES_COUNT;

        // Ensure canvas size matches the number of frames
        canvas.width = totalWidth;
        canvas.height = containerHeight;

        // Clear canvas with background color
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, totalWidth, containerHeight);

        // Draw each frame - boxes first
        visibleFrames.forEach((frame, frameIndex) => {
            const x = frameIndex * BOX_WIDTH;

            // Get gradient and colors for this frame
            const colors = getFrameGradient(frame, ctx);
            if (!colors) return;

            // Draw background gradient for this section
            ctx.fillStyle = colors.gradient;
            ctx.fillRect(x, 0, BOX_WIDTH, containerHeight);

            // Draw grid lines
            ctx.beginPath();
            ctx.strokeStyle = colors.gridColor;
            ctx.lineWidth = 0.3;
            for (let i = 0; i <= VISIBLE_BOXES_COUNT; i++) {
                const y = Math.round(i * boxHeight);
                ctx.moveTo(x, y);
                ctx.lineTo(x + BOX_WIDTH, y);
            }
            ctx.stroke();

            // Sort boxes
            const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
            const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);
            const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Find largest box to determine coloring
            const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
            const isLargestPositive = largestBox.value > 0;

            // Draw boxes and values
            orderedBoxes.forEach((box, boxIndex) => {
                const currentY = boxIndex * boxHeight;
                const isPositiveBox = box.value > 0;

                // Draw box background
                if (isLargestPositive) {
                    // If largest is positive, make positive boxes lighter and negative boxes darker
                    if (isPositiveBox) {
                        // Lighter positive boxes
                        ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 0.1)`;
                    } else {
                        // Darker negative boxes
                        ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, .3)`;
                    }
                } else {
                    // If largest is negative, make negative boxes lighter and positive boxes darker
                    if (isPositiveBox) {
                        // Darker positive boxes
                        ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, .3)`;
                    } else {
                        // Lighter negative boxes
                        ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 0.1)`;
                    }
                }
                ctx.fillRect(x, currentY, BOX_WIDTH, boxHeight);

                ctx.fillStyle = '#000000';
                ctx.font = `3px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const absValue = Math.abs(box.value);
                const displayValue = absValue.toString();
                ctx.fillText(box.value >= 0 ? displayValue : `-${displayValue}`, x + BOX_WIDTH / 2, currentY + boxHeight / 2);
            });
        });

        // Now draw the white line on top of all boxes
        ctx.beginPath();

        // Calculate points for the line based on smallest absolute values
        const linePoints: { x: number; y: number; isPositive: boolean; isLargestPositive: boolean }[] = [];

        visibleFrames.forEach((frame, frameIndex) => {
            const x = frameIndex * BOX_WIDTH;

            // Find smallest absolute value box for line position
            const sortedBoxes = [...frame.boxes].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
            const visibleBoxes = sortedBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);
            const smallestBox = visibleBoxes[0]; // First one is smallest absolute value
            const isPositive = smallestBox.value > 0;

            // Find largest box to determine coloring for this frame
            const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
            const isLargestPositive = largestBox.value > 0;

            // Find vertical position of this box
            const negativeBoxes = visibleBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = visibleBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];
            const boxIndex = orderedBoxes.findIndex((box) => box.value === smallestBox.value);

            // Calculate line Y position
            const lineY = isPositive
                ? boxIndex * boxHeight // Top of box for positive
                : (boxIndex + 1) * boxHeight; // Bottom of box for negative

            // Store points for later use
            linePoints.push({ x, y: lineY, isPositive, isLargestPositive });
        });

        // Create fill areas for each segment with its own color
        for (let i = 0; i < linePoints.length - 1; i++) {
            const currentPoint = linePoints[i];
            const nextPoint = linePoints[i + 1];

            ctx.beginPath();
            if (currentPoint.isLargestPositive) {
                // If largest is positive, draw from top down to line
                ctx.moveTo(currentPoint.x, 0); // Start from top
                ctx.lineTo(nextPoint.x, 0); // Go across the top
                ctx.lineTo(nextPoint.x, nextPoint.y); // Down to the line
                ctx.lineTo(currentPoint.x, currentPoint.y); // Back to start point on line
            } else {
                // If largest is negative, draw from bottom up to line
                ctx.moveTo(currentPoint.x, currentPoint.y); // Start from line
                ctx.lineTo(nextPoint.x, nextPoint.y); // Along the line
                ctx.lineTo(nextPoint.x, containerHeight); // Down to bottom
                ctx.lineTo(currentPoint.x, containerHeight); // Across bottom
            }
            ctx.closePath();

            // Use color based on current frame's largest box
            if (currentPoint.isLargestPositive) {
                // If largest is positive, use positive colors
                ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 1)`;
            } else {
                // If largest is negative, use negative colors
                ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 1)`;
            }
            ctx.fill();
        }

        // Handle the last segment
        if (linePoints.length > 0) {
            const lastPoint = linePoints[linePoints.length - 1];
            ctx.beginPath();
            if (lastPoint.isLargestPositive) {
                // If largest is positive, draw from top down to line
                ctx.moveTo(lastPoint.x, 0); // Start from top
                ctx.lineTo(lastPoint.x + BOX_WIDTH, 0); // Go across top
                ctx.lineTo(lastPoint.x + BOX_WIDTH, lastPoint.y); // Down to line
                ctx.lineTo(lastPoint.x, lastPoint.y); // Back to start point on line
            } else {
                // If largest is negative, draw from bottom up to line
                ctx.moveTo(lastPoint.x, lastPoint.y); // Start from line
                ctx.lineTo(lastPoint.x + BOX_WIDTH, lastPoint.y); // Along the line
                ctx.lineTo(lastPoint.x + BOX_WIDTH, containerHeight); // Down to bottom
                ctx.lineTo(lastPoint.x, containerHeight); // Across bottom
            }
            ctx.closePath();

            // Use color based on last frame's largest box
            if (lastPoint.isLargestPositive) {
                ctx.fillStyle = `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 1)`;
            } else {
                ctx.fillStyle = `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 1)`;
            }
            ctx.fill();
        }

        // Now draw the white line on top
        ctx.beginPath();
        linePoints.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        // Add the final segment to complete the line
        if (linePoints.length > 0) {
            ctx.lineTo(linePoints[linePoints.length - 1].x + BOX_WIDTH, linePoints[linePoints.length - 1].y);
        }

        // Draw the white line
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Scroll to the latest frame after rendering
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [uniqueFrames, boxColors, boxOffset, containerHeight]);

    if (!uniqueFrames.length) return null;

    return (
        <div className='relative flex w-full flex-col'>
            <div ref={containerRef} className='relative flex h-[200px] w-full'>
                <div ref={scrollContainerRef} className='flex h-full w-full overflow-auto'>
                    <canvas ref={canvasRef} className='block pr-20' />
                    <HistogramControls
                        boxOffset={boxOffset}
                        onOffsetChange={handleOffsetChange}
                        totalBoxes={Math.max(...uniqueFrames.map((frame) => frame.boxes.length))}
                        visibleBoxesCount={VISIBLE_BOXES_COUNT}
                    />
                </div>
            </div>
        </div>
    );
};

export default HistogramSimple;
