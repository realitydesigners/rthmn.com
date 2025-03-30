'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@/types/types';
import { BoxColors } from '@/stores/colorStore';
import { BoxSizes } from '@/utils/instruments';

interface BoxTimelineProps {
    data: { timestamp: string; progressiveValues: Box[] }[];
    boxOffset: number;
    visibleBoxesCount: number;
    boxVisibilityFilter: 'all' | 'positive' | 'negative';
    boxColors: BoxColors;
    className?: string;
    hoveredTimestamp?: number | null;
    onHoverChange?: (timestamp: number | null) => void;
    showLine?: boolean; // Ensure showLine prop is defined
}

const findNearestBoxSize = (value: number): number => {
    const absValue = Math.abs(value);
    let nearest = BoxSizes.reduce((prev, curr) => {
        return Math.abs(curr - absValue) < Math.abs(prev - absValue) ? curr : prev;
    });

    return value >= 0 ? nearest : -nearest;
};

const MAX_FRAMES = 1000; // Limit drawn frames for performance

const Histogram: React.FC<BoxTimelineProps> = ({
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
    const [trendChanges, setTrendChanges] = useState<Array<{ timestamp: string; x: number; isPositive: boolean }>>([]);
    const [effectiveBoxWidth, setEffectiveBoxWidth] = useState(0);

    // Calculate dynamic box dimensions based on container and visible boxes
    const calculateBoxDimensions = (containerHeight: number, frameCount: number) => {
        // Force boxes to fill the container height
        const boxSize = Math.floor(containerHeight / visibleBoxesCount);

        // Calculate required width for square boxes
        const requiredWidth = boxSize * frameCount;

        return { boxSize, requiredWidth };
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getFrameSignature = (frame: { timestamp: string; progressiveValues: Box[] }) => {
        const slicedBoxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
        const negativeBoxes = slicedBoxes
            .filter((box) => box.value < 0)
            .sort((a, b) => a.value - b.value)
            .map((box) => findNearestBoxSize(box.value));
        const positiveBoxes = slicedBoxes
            .filter((box) => box.value > 0)
            .sort((a, b) => a.value - b.value)
            .map((box) => findNearestBoxSize(box.value));
        return [...negativeBoxes, ...positiveBoxes].join('|');
    };

    useEffect(() => {
        if (!isClient || !data || data.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get container dimensions
        const container = canvas.parentElement;
        if (!container) return;
        const rect = container.getBoundingClientRect();

        // Get frames to draw
        const framesToDraw = data.slice(Math.max(0, data.length - MAX_FRAMES));
        const uniqueFrames = framesToDraw.reduce((acc: typeof framesToDraw, frame, index) => {
            if (index === 0) return [frame];

            const prevFrame = acc[acc.length - 1];
            const currentSignature = getFrameSignature(frame);
            const prevSignature = getFrameSignature(prevFrame);

            if (currentSignature !== prevSignature) {
                return [...acc, frame];
            }
            return acc;
        }, []);

        // Calculate box dimensions based on container height
        const { boxSize, requiredWidth } = calculateBoxDimensions(rect.height - 24, uniqueFrames.length);
        setEffectiveBoxWidth(boxSize);

        // Set canvas size
        canvas.style.width = `${requiredWidth}px`;
        canvas.style.height = `${rect.height}px`;

        // Set high-DPI canvas
        const scale = window.devicePixelRatio;
        canvas.width = Math.floor(requiredWidth * scale);
        canvas.height = Math.floor(rect.height * scale);
        ctx.scale(scale, scale);

        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, requiredWidth, rect.height);

        // Track trend changes
        const newTrendChanges: Array<{ timestamp: string; x: number; isPositive: boolean }> = [];
        let prevIsLargestPositive: boolean | null = null;

        // --- Array to store points for the line ---
        const linePoints: { x: number; y: number; isPositive: boolean; isLargestPositive: boolean }[] = [];

        uniqueFrames.forEach((frame, frameIndex) => {
            const x = frameIndex * boxSize;
            const boxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            const largestBox = boxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max), boxes[0]);
            const isLargestPositive = largestBox.value >= 0;

            if (prevIsLargestPositive !== null && prevIsLargestPositive !== isLargestPositive) {
                newTrendChanges.push({
                    timestamp: frame.timestamp,
                    x: x,
                    isPositive: isLargestPositive,
                });
            }
            prevIsLargestPositive = isLargestPositive;

            // Draw boxes
            const frameTimestamp = new Date(frame.timestamp).getTime();
            const isHovered = frameTimestamp === hoveredTimestamp;

            if (isHovered) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(x, 0, boxSize, rect.height);
            }

            // Process boxes
            const slicedBoxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            const negativeBoxes = slicedBoxes
                .filter((box) => box.value < 0)
                .sort((a, b) => a.value - b.value)
                .map((box) => ({
                    ...box,
                    value: findNearestBoxSize(box.value),
                }));

            const positiveBoxes = slicedBoxes
                .filter((box) => box.value > 0)
                .sort((a, b) => a.value - b.value)
                .map((box) => ({
                    ...box,
                    value: findNearestBoxSize(box.value),
                }));

            const orderedAndSnappedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Find smallest absolute value box for line position
            const smallestBox = orderedAndSnappedBoxes.length > 0 ? orderedAndSnappedBoxes.reduce((min, box) => (Math.abs(box.value) < Math.abs(min.value) ? box : min)) : null;

            // Calculate line point position
            if (smallestBox) {
                const isPositive = smallestBox.value >= 0;
                const boxIndex = orderedAndSnappedBoxes.findIndex((box) => box.value === smallestBox.value);
                const y = isPositive ? boxIndex * boxSize : (boxIndex + 1) * boxSize;

                linePoints.push({
                    x: x,
                    y: y,
                    isPositive: isPositive,
                    isLargestPositive: isLargestPositive,
                });
            }

            // Draw boxes with new dimensions
            orderedAndSnappedBoxes.forEach((box, boxIndex) => {
                const y = boxIndex * boxSize;
                const snappedValue = box.value;
                const isPositiveBox = snappedValue >= 0;

                // Set colors
                if (isLargestPositive) {
                    ctx.fillStyle = isPositiveBox
                        ? `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 0.1)`
                        : `rgba(${parseInt(boxColors.positive.slice(1, 3), 16)}, ${parseInt(boxColors.positive.slice(3, 5), 16)}, ${parseInt(boxColors.positive.slice(5, 7), 16)}, 0.3)`;
                } else {
                    ctx.fillStyle = isPositiveBox
                        ? `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 0.3)`
                        : `rgba(${parseInt(boxColors.negative.slice(1, 3), 16)}, ${parseInt(boxColors.negative.slice(3, 5), 16)}, ${parseInt(boxColors.negative.slice(5, 7), 16)}, 0.1)`;
                }

                // Draw box
                ctx.fillRect(x, y, boxSize, boxSize);

                // Draw text
                ctx.fillStyle = '#000000';
                const fontSize = Math.min(boxSize / 2, boxSize / 2);
                ctx.font = `0px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const displayValue = snappedValue.toFixed(0);
                ctx.fillText(displayValue, x + boxSize / 2, y + boxSize / 2);
            });
        });

        // === Draw Line and Fill Area ===
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
                    ctx.lineTo(nextPoint.x, rect.height);
                    ctx.lineTo(currentPoint.x, rect.height);
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
                    ctx.lineTo(lastPoint.x + boxSize, 0);
                    ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
                    ctx.lineTo(lastPoint.x, lastPoint.y);
                } else {
                    ctx.moveTo(lastPoint.x, lastPoint.y);
                    ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
                    ctx.lineTo(lastPoint.x + boxSize, rect.height);
                    ctx.lineTo(lastPoint.x, rect.height);
                }
                ctx.closePath();

                const fillColor = lastPoint.isLargestPositive ? boxColors.positive : boxColors.negative;
                ctx.fillStyle = `rgba(${parseInt(fillColor.slice(1, 3), 16)}, ${parseInt(fillColor.slice(3, 5), 16)}, ${parseInt(fillColor.slice(5, 7), 16)}, 0.3)`;
                ctx.fill();
            }

            // Draw the white line on top
            ctx.beginPath();
            linePoints.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });

            // Extend the line to the end of the last box
            if (linePoints.length > 0) {
                const lastPoint = linePoints[linePoints.length - 1];
                ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
            }

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
        // === End Line and Fill Area ===

        setTrendChanges(newTrendChanges);
    }, [data, boxOffset, visibleBoxesCount, boxVisibilityFilter, boxColors, isClient, hoveredTimestamp, showLine]);

    // Effect to scroll the histogram when hoveredTimestamp changes
    useEffect(() => {
        if (hoveredTimestamp && scrollContainerRef.current && effectiveBoxWidth > 0 && data.length > 0) {
            // Regenerate uniqueFrames based on current data (consistent with drawing logic)
            // Note: This might be inefficient if data is huge. Consider optimizing if needed.
            const framesToDraw = data.slice(Math.max(0, data.length - MAX_FRAMES));
            const uniqueFrames = framesToDraw.reduce((acc: typeof framesToDraw, frame, index) => {
                if (index === 0) return [frame];
                const prevFrame = acc[acc.length - 1];
                const currentSignature = getFrameSignature(frame);
                const prevSignature = getFrameSignature(prevFrame);
                if (currentSignature !== prevSignature) {
                    return [...acc, frame];
                }
                return acc;
            }, []);

            // Find the index of the frame matching the hovered timestamp
            const targetIndex = uniqueFrames.findIndex((frame) => new Date(frame.timestamp).getTime() === hoveredTimestamp);

            if (targetIndex !== -1) {
                const container = scrollContainerRef.current;
                const containerWidth = container.clientWidth;

                // Calculate the target scrollLeft position
                // We want the right edge of the target frame to be at the right edge of the container
                const targetFrameRightEdge = (targetIndex + 1) * effectiveBoxWidth;
                let targetScrollLeft = targetFrameRightEdge - containerWidth;

                // Clamp the scroll value
                const maxScrollLeft = container.scrollWidth - containerWidth;
                targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

                // Scroll smoothly to the calculated position
                container.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth',
                });
            }
        }
        // Dependencies: React when hover changes, or when data/layout impacting scroll calculations change.
    }, [hoveredTimestamp, data, effectiveBoxWidth, boxOffset, visibleBoxesCount]);

    return (
        <div className={`relative ${className}`}>
            <div ref={scrollContainerRef} className='scrollbar-hide h-full w-full overflow-x-auto'>
                <div className='relative h-full'>
                    {/* Trend Change Markers */}
                    <div className='absolute -top-6 right-0 left-0 ml-4 h-6'>
                        {trendChanges.map((change, index) => (
                            <div
                                key={`${change.timestamp}-${index}`}
                                className='absolute -translate-x-1/2 transform'
                                style={{
                                    left: `${change.x}px`,
                                    color: change.isPositive ? boxColors.positive : boxColors.negative,
                                }}>
                                <div className='text-[8px] whitespace-nowrap'>{new Date(change.timestamp).toLocaleTimeString()}</div>▼
                            </div>
                        ))}
                    </div>

                    {/* Canvas */}
                    <div className='mt-6 h-full'>
                        <canvas ref={canvasRef} className='block h-full' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Histogram;
