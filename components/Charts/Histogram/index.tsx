'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@/types/types';
import { BoxColors } from '@/stores/colorStore';
import { BoxSizes } from '@/utils/instruments';

interface BoxTimelineProps {
    data: {
        timestamp: string;
        progressiveValues: Box[];
        currentOHLC?: {
            open: number;
            high: number;
            low: number;
            close: number;
        };
    }[];
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

        // Process frames to detect value changes
        const processedFrames = [];
        let prevFrame = null;

        const isFrameDuplicate = (frame1, frame2) => {
            if (!frame1 || !frame2) return false;

            const boxes1 = frame1.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            const boxes2 = frame2.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);

            return boxes1.every((box, index) => box.value === boxes2[index]?.value);
        };

        for (const frame of data) {
            const boxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);

            if (prevFrame) {
                const prevBoxes = prevFrame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);

                // Detect trend change
                const prevLargestBox = prevBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max), prevBoxes[0]);
                const currentLargestBox = boxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max), boxes[0]);
                const trendChanged = prevLargestBox.value >= 0 !== currentLargestBox.value >= 0;

                // Skip if frame is duplicate of previous frame (unless it's a trend change)
                if (!trendChanged && isFrameDuplicate(frame, prevFrame)) {
                    prevFrame = frame;
                    continue;
                }

                if (trendChanged) {
                    // Create transition frames where all boxes move in the same direction
                    const isNewTrendPositive = currentLargestBox.value >= 0;
                    const steps = 5; // More steps for smoother transition

                    // First phase: Move all boxes to their extreme value
                    for (let step = 1; step <= steps / 2; step++) {
                        const zeroProgress = step / (steps / 2);
                        const intermediateBoxes = [...prevFrame.progressiveValues];

                        // Move all boxes to their extreme value based on current trend
                        const extremeValue =
                            prevLargestBox.value >= 0
                                ? Math.max(...prevBoxes.map((b) => Math.abs(b.value))) // Move to top for positive trend
                                : -Math.max(...prevBoxes.map((b) => Math.abs(b.value))); // Move to bottom for negative trend

                        prevBoxes.forEach((box, index) => {
                            intermediateBoxes[index] = {
                                ...box,
                                value: box.value + (extremeValue - box.value) * zeroProgress,
                            };
                        });

                        processedFrames.push({
                            timestamp: frame.timestamp,
                            progressiveValues: intermediateBoxes,
                            currentOHLC: frame.currentOHLC,
                        });
                    }

                    // Second phase: Move from extreme to new values
                    for (let step = 1; step <= steps / 2; step++) {
                        const newProgress = step / (steps / 2);
                        const intermediateBoxes = [...prevFrame.progressiveValues];

                        // Start from the extreme value of the previous trend
                        const startValue = !isNewTrendPositive
                            ? Math.max(...prevBoxes.map((b) => Math.abs(b.value))) // Start from top
                            : -Math.max(...prevBoxes.map((b) => Math.abs(b.value))); // Start from bottom

                        boxes.forEach((box, index) => {
                            intermediateBoxes[index] = {
                                ...box,
                                value: startValue + (box.value - startValue) * newProgress,
                            };
                        });

                        processedFrames.push({
                            timestamp: frame.timestamp,
                            progressiveValues: intermediateBoxes,
                            currentOHLC: frame.currentOHLC,
                        });
                    }
                } else {
                    // Handle normal value changes
                    const changedBoxes = boxes
                        .map((box, index) => {
                            const prevBox = prevBoxes[index];
                            if (!prevBox || box.value === prevBox.value) return null;

                            return {
                                index,
                                prevValue: prevBox.value,
                                newValue: box.value,
                                high: box.high,
                                low: box.low,
                                direction: box.value > prevBox.value ? 1 : -1,
                            };
                        })
                        .filter(Boolean);

                    if (changedBoxes.length > 0) {
                        // Sort changes by magnitude
                        changedBoxes.sort((a, b) => Math.abs(b.newValue - b.prevValue) - Math.abs(a.newValue - a.prevValue));

                        const steps = changedBoxes.length;
                        for (let step = 1; step <= steps; step++) {
                            const intermediateBoxes = [...prevFrame.progressiveValues];
                            const progress = step / steps;

                            changedBoxes.slice(0, step).forEach((change) => {
                                intermediateBoxes[change.index] = {
                                    value: change.prevValue + (change.newValue - change.prevValue) * progress,
                                    high: change.high,
                                    low: change.low,
                                };
                            });

                            processedFrames.push({
                                timestamp: frame.timestamp,
                                progressiveValues: intermediateBoxes,
                                currentOHLC: frame.currentOHLC,
                            });
                        }
                    }
                }
            }

            // Only add the final frame if it's not a duplicate
            const lastProcessedFrame = processedFrames[processedFrames.length - 1];
            if (!isFrameDuplicate(frame, lastProcessedFrame)) {
                processedFrames.push(frame);
            }
            prevFrame = frame;
        }

        // Get frames to draw - use processed frames
        const framesToDraw = processedFrames.slice(Math.max(0, processedFrames.length - MAX_FRAMES));

        // Calculate box dimensions based on container height
        const { boxSize, requiredWidth } = calculateBoxDimensions(rect.height - 24, framesToDraw.length);
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

        // Array to store points for the line
        const linePoints: { x: number; y: number; isPositive: boolean; isLargestPositive: boolean }[] = [];

        framesToDraw.forEach((frame, frameIndex) => {
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
            const negativeBoxes = slicedBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = slicedBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Find smallest absolute value box for line position
            const smallestBox = orderedBoxes.length > 0 ? orderedBoxes.reduce((min, box) => (Math.abs(box.value) < Math.abs(min.value) ? box : min)) : null;

            // Calculate line point position
            if (smallestBox) {
                const isPositive = smallestBox.value >= 0;
                const boxIndex = orderedBoxes.findIndex((box) => box.value === smallestBox.value);
                const y = isPositive ? boxIndex * boxSize : (boxIndex + 1) * boxSize;

                linePoints.push({
                    x: x,
                    y: y,
                    isPositive: isPositive,
                    isLargestPositive: isLargestPositive,
                });
            }

            // Draw boxes
            orderedBoxes.forEach((box, boxIndex) => {
                const y = boxIndex * boxSize;
                const isPositiveBox = box.value >= 0;

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
                ctx.fillStyle = '#FFFFFF';
                const fontSize = Math.min(boxSize / 2, 12);
                ctx.font = `5px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const displayValue =
                    Math.abs(box.value) < 0.1
                        ? box.value.toFixed(3) // Show more decimals for small values
                        : box.value.toFixed(2); // Show 2 decimals for larger values
                ctx.fillText(displayValue, x + boxSize / 2, y + boxSize / 2);
            });
        });

        // Draw fill areas and line
        if (showLine && linePoints.length > 0) {
            // Draw fill areas
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

            // Draw the white line
            ctx.beginPath();
            linePoints.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });

            if (linePoints.length > 0) {
                const lastPoint = linePoints[linePoints.length - 1];
                ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
            }

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }

        setTrendChanges(newTrendChanges);
    }, [isClient, data, boxOffset, visibleBoxesCount, boxColors, hoveredTimestamp, showLine]);

    return (
        <div ref={scrollContainerRef} className={`relative h-full w-full overflow-x-auto ${className}`}>
            <canvas ref={canvasRef} className='absolute top-3 left-0' style={{ imageRendering: 'pixelated' }} />
        </div>
    );
};

export default React.memo(Histogram);
