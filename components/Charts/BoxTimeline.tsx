'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
// Remove BoxSlice import if not used elsewhere, otherwise keep it
// import { BoxSlice } from '@/types/types';
import { Box } from '@/types/types'; // Assuming Box has { high, low, value }
import { BoxColors } from '@/stores/colorStore'; // Assuming this provides { positive: string, negative: string }
import { BoxSizes } from '@/utils/instruments'; // Import BoxSizes

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

const BoxTimeline: React.FC<BoxTimelineProps> = ({ data, boxOffset, visibleBoxesCount, boxVisibilityFilter, boxColors, className = '', hoveredTimestamp, onHoverChange }) => {
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
                const isPositive = snappedValue >= 0;
                ctx.fillStyle = isPositive ? boxColors.positive : boxColors.negative;
                ctx.fillRect(x, y, BOX_WIDTH, BOX_HEIGHT);

                // Draw value text (optional) - Use snapped value
                ctx.fillStyle = '#ffffff'; // White text
                ctx.font = `${FONT_SIZE}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const displayValue = snappedValue.toFixed(0); // Display snapped integer value
                ctx.fillText(displayValue, x + BOX_WIDTH / 2, y + BOX_HEIGHT / 2);

                // Draw thin grid lines (adjust if hovered?)
                ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x, y, BOX_WIDTH, BOX_HEIGHT);
            });
        });

        // Scroll to end
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [data, boxOffset, visibleBoxesCount, boxVisibilityFilter, boxColors, isClient, hoveredTimestamp]);

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
