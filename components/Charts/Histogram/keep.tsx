'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
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
        // Force boxes to fill the container height exactly
        const boxSize = Math.floor(containerHeight / visibleBoxesCount);
        // Calculate total height that will be filled by boxes
        const totalHeight = boxSize * visibleBoxesCount;
        // Calculate required width for square boxes
        const requiredWidth = boxSize * frameCount;
        return { boxSize, requiredWidth, totalHeight };
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

                    // Get the maximum absolute value to ensure proper connections at extremes
                    const maxAbsValue = Math.max(Math.max(...prevBoxes.map((b) => Math.abs(b.value))), Math.max(...boxes.map((b) => Math.abs(b.value))));

                    // First frame: Move all boxes to their current extreme
                    const extremeBoxes = [...prevFrame.progressiveValues];
                    prevBoxes.forEach((box, index) => {
                        extremeBoxes[index] = {
                            ...box,
                            value: prevLargestBox.value >= 0 ? maxAbsValue : -maxAbsValue,
                        };
                    });
                    processedFrames.push({
                        timestamp: frame.timestamp,
                        progressiveValues: extremeBoxes,
                        currentOHLC: frame.currentOHLC,
                    });

                    // Second frame: Move to the opposite extreme before new trend
                    const transitionBoxes = [...prevFrame.progressiveValues];
                    boxes.forEach((box, index) => {
                        transitionBoxes[index] = {
                            ...box,
                            value: isNewTrendPositive ? maxAbsValue : -maxAbsValue,
                        };
                    });
                    processedFrames.push({
                        timestamp: frame.timestamp,
                        progressiveValues: transitionBoxes,
                        currentOHLC: frame.currentOHLC,
                    });

                    // Final frame: Move to actual new values
                    processedFrames.push(frame);
                } else {
                    // For non-trend changes, just add the frame if values changed
                    const hasChanges = boxes.some((box, index) => {
                        const prevBox = prevBoxes[index];
                        return prevBox && Math.abs(box.value - prevBox.value) > 0.000001;
                    });

                    if (hasChanges) {
                        processedFrames.push(frame);
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
        const { boxSize, requiredWidth, totalHeight } = calculateBoxDimensions(rect.height, framesToDraw.length);
        setEffectiveBoxWidth(boxSize);

        // Set canvas size
        canvas.style.width = `${requiredWidth}px`;
        canvas.style.height = `${totalHeight}px`;

        // Set high-DPI canvas
        const scale = window.devicePixelRatio;
        canvas.width = Math.floor(requiredWidth * scale);
        canvas.height = Math.floor(totalHeight * scale);
        ctx.scale(scale, scale);

        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, requiredWidth, totalHeight);

        // Track trend changes
        const newTrendChanges: Array<{ timestamp: string; x: number; isPositive: boolean }> = [];
        let prevIsLargestPositive: boolean | null = null;

        // Array to store points for the line
        const linePoints: { x: number; y: number; isPositive: boolean; isLargestPositive: boolean }[] = [];

        framesToDraw.forEach((frame, frameIndex) => {
            const x = frameIndex * boxSize;
            const boxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);

            // Process boxes
            const slicedBoxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            const negativeBoxes = slicedBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = slicedBoxes.filter((box) => box.value > 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            // Find largest absolute value box for trend
            const largestBox = orderedBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max), orderedBoxes[0]);
            const isLargestPositive = largestBox ? largestBox.value >= 0 : true;

            // Find smallest absolute value box for line position
            const smallestBox = orderedBoxes.length > 0 ? orderedBoxes.reduce((min, box) => (Math.abs(box.value) < Math.abs(min.value) ? box : min), orderedBoxes[0]) : null;

            // Calculate line point position
            if (smallestBox) {
                const isPositive = smallestBox.value >= 0;
                const boxIndex = orderedBoxes.findIndex((box) => box === smallestBox);
                const y = (boxIndex + (isPositive ? 0 : 1)) * boxSize;

                linePoints.push({
                    x: x, // Start from left edge of box
                    y: y,
                    isPositive: isPositive,
                    isLargestPositive: isLargestPositive,
                });
            }

            // Draw boxes
            orderedBoxes.forEach((box, boxIndex) => {
                const y = boxIndex * boxSize;
                const isPositiveBox = box.value >= 0;

                // Set colors based on largest trend
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
            });

            // Track trend changes
            if (prevIsLargestPositive !== null && prevIsLargestPositive !== isLargestPositive) {
                newTrendChanges.push({
                    timestamp: frame.timestamp,
                    x: x,
                    isPositive: isLargestPositive,
                });
            }
            prevIsLargestPositive = isLargestPositive;

            // Draw hover highlight if this is the hovered frame
            const frameTimestamp = new Date(frame.timestamp).getTime();
            if (hoveredTimestamp === frameTimestamp) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, 0, boxSize, rect.height); // Leave space for X-axis
            }
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

            // Draw to the end of the last box
            const lastPoint = linePoints[linePoints.length - 1];
            ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }

        setTrendChanges(newTrendChanges);
    }, [isClient, data, boxOffset, visibleBoxesCount, boxColors, hoveredTimestamp, showLine]);

    return (
        <div className={`relative ${className}`}>
            <div ref={scrollContainerRef} className='scrollbar-hide h-full w-full overflow-x-auto'>
                <div className='relative h-full pt-6'>
                    {/* Trend Change Markers */}
                    <div className='absolute -top-0 right-0 left-0 z-0 ml-[18px] h-6'>
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
                    <div className='h-full'>
                        <canvas ref={canvasRef} className='block h-full overflow-y-hidden' style={{ imageRendering: 'pixelated' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Histogram);
