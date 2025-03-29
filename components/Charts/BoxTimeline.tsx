'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
// Remove BoxSlice import if not used elsewhere, otherwise keep it
// import { BoxSlice } from '@/types/types';
import { Box } from '@/types/types'; // Assuming Box has { high, low, value }
import { BoxColors } from '@/stores/colorStore'; // Assuming this provides { positive: string, negative: string }
import { BoxSizes } from '@/utils/instruments'; // Import BoxSizes
// Remove the import for the separate file
// import { drawBoxTimelineLine } from './BoxTimelineLine';

// Define the expected shape of the data items passed in the data prop
interface BoxTimelineFrame {
    timestamp: string; // Or number if that's what histogramData uses
    progressiveValues: Box[];
    // Add other properties if they exist on histogramData items, e.g., currentOHLC
}

interface BoxTimelineProps {
    data: BoxTimelineFrame[]; // Use the correct frame type
    boxOffset: number;
    visibleBoxesCount: number;
    boxVisibilityFilter: 'all' | 'positive' | 'negative';
    boxColors: BoxColors;
    className?: string;
    hoveredTimestamp?: number | null;
    onHoverChange?: (timestamp: number | null) => void;
    showLine?: boolean; // Ensure showLine prop is defined
}

// Define the findNearestBoxSize helper function locally
const findNearestBoxSize = (value: number): number => {
    const absValue = Math.abs(value);
    // Find the closest absolute size in BoxSizes
    let nearest = BoxSizes.reduce((prev, curr) => {
        return Math.abs(curr - absValue) < Math.abs(prev - absValue) ? curr : prev;
    });
    // Return the nearest size, preserving the original sign
    return value >= 0 ? nearest : -nearest;
};

const BOX_WIDTH = 15; // Width of each timestamp column
const BOX_HEIGHT = 15; // Height of each box cell
const MAX_FRAMES = 1000; // Limit drawn frames for performance
const FONT_SIZE = 8;

const BoxTimeline: React.FC<BoxTimelineProps> = ({
    data,
    boxOffset,
    visibleBoxesCount,
    boxVisibilityFilter,
    boxColors,
    className = '',
    hoveredTimestamp,
    onHoverChange,
    showLine = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // --- Handle mouse move to detect hover ---
    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current || !onHoverChange || !data || data.length === 0) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left; // X position within the canvas

        // Calculate index based on position and box width
        const frameIndex = Math.floor(x / BOX_WIDTH);
        const framesToDraw = data.slice(Math.max(0, data.length - MAX_FRAMES)); // Use the same slice as in drawing

        if (frameIndex >= 0 && frameIndex < framesToDraw.length) {
            const hoveredFrame = framesToDraw[frameIndex];
            const timestamp = new Date(hoveredFrame.timestamp).getTime(); // Convert timestamp string/number to number
            onHoverChange(timestamp);
        } else {
            onHoverChange(null); // Clear hover if outside canvas bounds
        }
    };

    const handleMouseLeave = () => {
        if (onHoverChange) {
            onHoverChange(null);
        }
    };

    useEffect(() => {
        if (!isClient || !data || data.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Limit frames drawn for performance
        const framesToDraw = data.slice(Math.max(0, data.length - MAX_FRAMES));
        const canvasWidth = framesToDraw.length * BOX_WIDTH;
        const canvasHeight = visibleBoxesCount * BOX_HEIGHT;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Clear canvas
        ctx.fillStyle = '#0a0a0a'; // Background color
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // --- Array to store points for the line ---
        const linePoints: { x: number; y: number; isPositive: boolean; isLargestPositive: boolean }[] = [];

        framesToDraw.forEach((frame, frameIndex) => {
            const x = frameIndex * BOX_WIDTH;
            const frameTimestamp = new Date(frame.timestamp).getTime(); // Get timestamp for comparison
            const isHovered = frameTimestamp === hoveredTimestamp;

            // Draw background highlight if hovered
            if (isHovered) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; // Semi-transparent white highlight
                ctx.fillRect(x, 0, BOX_WIDTH, canvasHeight);
            }

            // Ensure progressiveValues exists and is an array
            if (!frame.progressiveValues || !Array.isArray(frame.progressiveValues)) {
                console.warn(`Frame at index ${frameIndex} missing or invalid progressiveValues.`);
                return;
            }

            // Data is assumed sorted by ascending absolute value from processProgressiveBoxValues
            // 1. Slice based on timeframe slider
            const slicedBoxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);

            // 2. Apply negative-then-positive sorting and snapping (User's Logic)
            const negativeBoxes = slicedBoxes
                .filter((box) => box.value < 0)
                .sort((a, b) => a.value - b.value) // Sort ascending (most negative first)
                .map((box) => ({
                    ...box,
                    value: findNearestBoxSize(box.value),
                }));

            const positiveBoxes = slicedBoxes
                .filter((box) => box.value > 0)
                .sort((a, b) => a.value - b.value) // Sort ascending (smallest positive first)
                .map((box) => ({
                    ...box,
                    value: findNearestBoxSize(box.value),
                }));

            const orderedAndSnappedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Find smallest absolute value box for line position
            const smallestBox = orderedAndSnappedBoxes.length > 0 ? orderedAndSnappedBoxes.reduce((min, box) => (Math.abs(box.value) < Math.abs(min.value) ? box : min)) : null;

            // --- Determine frame background tint based on largest visible box ---
            let isLargestPositive = true; // Default if no boxes
            const largestBox = orderedAndSnappedBoxes.length > 0 ? orderedAndSnappedBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max)) : null;

            if (largestBox) {
                isLargestPositive = largestBox.value >= 0;
            }

            // Calculate line point position
            if (smallestBox) {
                const isPositive = smallestBox.value >= 0;
                const boxIndex = orderedAndSnappedBoxes.findIndex((box) => box.value === smallestBox.value);

                // Calculate Y position based on box position and whether it's positive/negative
                const y = isPositive
                    ? boxIndex * BOX_HEIGHT // Top of box for positive
                    : (boxIndex + 1) * BOX_HEIGHT; // Bottom of box for negative

                linePoints.push({
                    x: x,
                    y: y,
                    isPositive: isPositive,
                    isLargestPositive: isLargestPositive,
                });
            }

            // 3. Filter based on visibility setting (applied *after* sorting/snapping)
            const filteredAndVisibleBoxes = orderedAndSnappedBoxes.filter((level) => {
                if (boxVisibilityFilter === 'positive') return level.value > 0;
                if (boxVisibilityFilter === 'negative') return level.value < 0;
                return true; // 'all'
            });

            // 4. Draw the final filtered and ordered boxes
            filteredAndVisibleBoxes.forEach((box, boxIndex) => {
                const y = boxIndex * BOX_HEIGHT; // Y position determined by final sorted/filtered order
                const snappedValue = box.value; // Value is already snapped from step 2
                const isPositiveBox = snappedValue >= 0; // Sign of the current box

                // --- Apply conditional background color from HistogramSimple ---
                const posColor = boxColors.positive;
                const negColor = boxColors.negative;
                if (isLargestPositive) {
                    if (isPositiveBox) {
                        ctx.fillStyle = `rgba(${parseInt(posColor.slice(1, 3), 16)}, ${parseInt(posColor.slice(3, 5), 16)}, ${parseInt(posColor.slice(5, 7), 16)}, 0.1)`;
                    } else {
                        ctx.fillStyle = `rgba(${parseInt(posColor.slice(1, 3), 16)}, ${parseInt(posColor.slice(3, 5), 16)}, ${parseInt(posColor.slice(5, 7), 16)}, 0.3)`;
                    }
                } else {
                    if (isPositiveBox) {
                        ctx.fillStyle = `rgba(${parseInt(negColor.slice(1, 3), 16)}, ${parseInt(negColor.slice(3, 5), 16)}, ${parseInt(negColor.slice(5, 7), 16)}, 0.3)`;
                    } else {
                        ctx.fillStyle = `rgba(${parseInt(negColor.slice(1, 3), 16)}, ${parseInt(negColor.slice(3, 5), 16)}, ${parseInt(negColor.slice(5, 7), 16)}, 0.1)`;
                    }
                }
                // --- End conditional background color ---

                ctx.fillRect(x, y, BOX_WIDTH, BOX_HEIGHT);

                // Draw value text (optional) - Use snapped value
                ctx.fillStyle = '#000000'; // White text
                ctx.font = `${FONT_SIZE}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const displayValue = snappedValue.toFixed(0); // Display snapped integer value
                ctx.fillText(displayValue, x + BOX_WIDTH / 2, y + BOX_HEIGHT / 2);
            });
        });

        // === Conditionally Draw Line and Fill Area (Integrated Logic) ===
        if (showLine && linePoints.length > 0) {
            // Draw fill areas first
            for (let i = 0; i < linePoints.length - 1; i++) {
                const currentPoint = linePoints[i];
                const nextPoint = linePoints[i + 1];

                ctx.beginPath();
                if (currentPoint.isLargestPositive) {
                    ctx.moveTo(currentPoint.x, 0);
                    ctx.lineTo(nextPoint.x, 0);
                    ctx.lineTo(nextPoint.x, nextPoint.y);
                    ctx.lineTo(currentPoint.x, currentPoint.y);
                } else {
                    ctx.moveTo(currentPoint.x, currentPoint.y);
                    ctx.lineTo(nextPoint.x, nextPoint.y);
                    ctx.lineTo(nextPoint.x, canvasHeight);
                    ctx.lineTo(currentPoint.x, canvasHeight);
                }
                ctx.closePath();

                const fillColor = currentPoint.isLargestPositive ? boxColors.positive : boxColors.negative;
                ctx.fillStyle = `rgba(${parseInt(fillColor.slice(1, 3), 16)}, ${parseInt(fillColor.slice(3, 5), 16)}, ${parseInt(fillColor.slice(5, 7), 16)}, 0.3)`;
                ctx.fill();
            }

            // Handle last segment
            if (linePoints.length > 0) {
                const lastPoint = linePoints[linePoints.length - 1];
                ctx.beginPath();
                if (lastPoint.isLargestPositive) {
                    ctx.moveTo(lastPoint.x, 0);
                    ctx.lineTo(lastPoint.x + BOX_WIDTH, 0);
                    ctx.lineTo(lastPoint.x + BOX_WIDTH, lastPoint.y);
                    ctx.lineTo(lastPoint.x, lastPoint.y);
                } else {
                    ctx.moveTo(lastPoint.x, lastPoint.y);
                    ctx.lineTo(lastPoint.x + BOX_WIDTH, lastPoint.y);
                    ctx.lineTo(lastPoint.x + BOX_WIDTH, canvasHeight);
                    ctx.lineTo(lastPoint.x, canvasHeight);
                }
                ctx.closePath();

                const fillColor = lastPoint.isLargestPositive ? boxColors.positive : boxColors.negative;
                ctx.fillStyle = `rgba(${parseInt(fillColor.slice(1, 3), 16)}, ${parseInt(fillColor.slice(3, 5), 16)}, ${parseInt(fillColor.slice(5, 7), 16)}, 0.3)`;
                ctx.fill();
            }

            // Draw the white line on top
            ctx.beginPath();
            linePoints.forEach((point, index) => {
                const x = point.x; // Remove the BOX_WIDTH/2 offset
                if (index === 0) {
                    ctx.moveTo(x, point.y);
                } else {
                    ctx.lineTo(x, point.y);
                }
            });

            // Extend the line to the end of the last box
            if (linePoints.length > 0) {
                const lastPoint = linePoints[linePoints.length - 1];
                ctx.lineTo(lastPoint.x + BOX_WIDTH, lastPoint.y);
            }

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
        // === End Line and Fill Area ===

        // Scroll to end
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [data, boxOffset, visibleBoxesCount, boxVisibilityFilter, boxColors, isClient, hoveredTimestamp, showLine]);

    // Calculate dimensions for initial render / SSR safety
    const initialFrames = data ? data.slice(Math.max(0, data.length - MAX_FRAMES)) : [];
    const initialWidth = initialFrames.length * BOX_WIDTH;
    const initialHeight = visibleBoxesCount * BOX_HEIGHT;

    return (
        <div ref={scrollContainerRef} className={`scrollbar-hide h-full w-full overflow-x-auto ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <canvas
                ref={canvasRef}
                width={initialWidth > 0 ? initialWidth : 300} // Default width
                height={initialHeight > 0 ? initialHeight : 100} // Default height
                className='block' // Ensure canvas takes space
            />
        </div>
    );
};

export default BoxTimeline;
