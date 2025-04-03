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
    showLine?: boolean;
}

const MAX_FRAMES = 1000;

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
    const framesToDrawRef = useRef<BoxTimelineProps['data']>([]);

    const calculateBoxDimensions = (containerHeight: number, frameCount: number) => {
        const boxSize = Math.floor(containerHeight / visibleBoxesCount);
        const totalHeight = boxSize * visibleBoxesCount;
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
        const container = canvas.parentElement;
        if (!container) return;
        const rect = container.getBoundingClientRect();

        const processedFrames: BoxTimelineProps['data'] = [];
        let prevFrame: BoxTimelineProps['data'][number] | null = null;
        const isFrameDuplicate = (frame1, frame2) => {
            if (!frame1 || !frame2) return false;
            const boxes1 = frame1.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            const boxes2 = frame2.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            if (boxes1.length !== boxes2.length) return false;
            return boxes1.every((box, index) => box.value === boxes2[index]?.value);
        };

        for (const frame of data) {
            const boxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            if (boxes.length === 0) continue;

            let frameToAdd = frame;
            let addFrameDirectly = false;

            if (prevFrame) {
                const prevBoxesRaw = prevFrame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
                if (prevBoxesRaw.length === 0) {
                    addFrameDirectly = true;
                } else {
                    const prevLargestBox = prevBoxesRaw.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
                    const currentLargestBox = boxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));
                    const trendChanged = prevLargestBox.value >= 0 !== currentLargestBox.value >= 0;

                    if (trendChanged) {
                        addFrameDirectly = false;
                        const isNewTrendPositive = currentLargestBox.value >= 0;
                        const numIntermediateSteps = 4;

                        const prevBoxesSorted = [...prevBoxesRaw].sort((a, b) => Math.abs(a.value) - Math.abs(b.value));

                        let lastIntermediateValues = [...prevFrame.progressiveValues];

                        // --- Timestamp Interpolation Setup ---
                        const prevTimestamp = new Date(prevFrame.timestamp).getTime();
                        const nextTimestamp = new Date(frame.timestamp).getTime();
                        const timeDiff = nextTimestamp - prevTimestamp;
                        // --- End Timestamp Interpolation Setup ---

                        for (let k = 1; k <= numIntermediateSteps; k++) {
                            const intermediateValues = [...lastIntermediateValues];
                            const boxesToFlipCount = Math.ceil(prevBoxesSorted.length * (k / numIntermediateSteps));
                            let flippedCount = 0;

                            for (let boxIndex = 0; boxIndex < intermediateValues.length; boxIndex++) {
                                const currentBoxValue = intermediateValues[boxIndex].value;
                                const originalBox = prevFrame.progressiveValues[boxIndex];

                                const sortedIndex = prevBoxesSorted.findIndex(
                                    (b) => b.high === originalBox.high && b.low === originalBox.low && Math.abs(b.value - originalBox.value) < 0.00001
                                );

                                if (sortedIndex !== -1 && sortedIndex < boxesToFlipCount) {
                                    if ((isNewTrendPositive && currentBoxValue < 0) || (!isNewTrendPositive && currentBoxValue > 0)) {
                                        intermediateValues[boxIndex] = {
                                            ...intermediateValues[boxIndex],
                                            value: isNewTrendPositive ? Math.abs(originalBox.value) : -Math.abs(originalBox.value),
                                        };
                                        flippedCount++;
                                    }
                                } else if ((isNewTrendPositive && currentBoxValue > 0) || (!isNewTrendPositive && currentBoxValue < 0)) {
                                    // Keep current value if already matches new trend
                                    intermediateValues[boxIndex] = { ...intermediateValues[boxIndex] };
                                } else {
                                    // Keep old value if not yet flipped
                                    intermediateValues[boxIndex] = {
                                        ...intermediateValues[boxIndex],
                                        value: isNewTrendPositive ? -Math.abs(originalBox.value) : Math.abs(originalBox.value),
                                    };
                                }
                            }

                            // --- Calculate and Assign Interpolated Timestamp ---
                            // Ensure timeDiff is positive to avoid issues
                            const safeTimeDiff = Math.max(0, timeDiff);
                            const interpolatedTimestampMillis = prevTimestamp + safeTimeDiff * (k / (numIntermediateSteps + 1));
                            const interpolatedTimestampISO = new Date(interpolatedTimestampMillis).toISOString();
                            // --- End Timestamp Calculation ---

                            processedFrames.push({
                                // --- Use Interpolated Timestamp ---
                                timestamp: interpolatedTimestampISO,
                                progressiveValues: intermediateValues,
                                // Use OHLC from the *next* real frame for context
                                currentOHLC: frame.currentOHLC,
                            });
                            lastIntermediateValues = intermediateValues;
                        }

                        // Add the actual final frame state after transitions
                        frameToAdd = frame;
                        processedFrames.push(frameToAdd);
                    } else {
                        const hasValueChanges = boxes.some((box, index) => {
                            const prevBox = prevBoxesRaw[index];
                            return !prevBox || Math.abs(box.value - prevBox.value) > 0.000001;
                        });
                        if (hasValueChanges) {
                            addFrameDirectly = true;
                        }
                    }
                }
            } else {
                addFrameDirectly = true;
            }

            if (addFrameDirectly) {
                const lastAddedFrame = processedFrames[processedFrames.length - 1];
                if (!lastAddedFrame || !isFrameDuplicate(frameToAdd, lastAddedFrame)) {
                    processedFrames.push(frameToAdd);
                }
            }
            prevFrame = frame;
        }

        const framesToDraw = processedFrames.slice(Math.max(0, processedFrames.length - MAX_FRAMES));
        framesToDrawRef.current = framesToDraw;

        if (framesToDraw.length === 0) return;

        const { boxSize, requiredWidth, totalHeight } = calculateBoxDimensions(rect.height, framesToDraw.length);
        setEffectiveBoxWidth(boxSize);

        canvas.style.width = `${requiredWidth}px`;
        canvas.style.height = `${totalHeight}px`;
        const scale = window.devicePixelRatio;
        canvas.width = Math.floor(requiredWidth * scale);
        canvas.height = Math.floor(totalHeight * scale);
        ctx.scale(scale, scale);

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, requiredWidth, totalHeight);

        // --- Calculate Frame Time Boundaries for Hovering ---
        let highlightIndex = -1;
        if (hoveredTimestamp !== null && hoveredTimestamp !== undefined && framesToDraw.length > 0) {
            const targetTime = Number(hoveredTimestamp);
            const frameTimestamps = framesToDraw.map((frame) => new Date(frame.timestamp).getTime());

            // Calculate midpoints between frames to define hover zones
            const boundaries: number[] = [-Infinity];
            for (let i = 0; i < frameTimestamps.length - 1; i++) {
                // Ensure timestamps are valid before calculating midpoint
                if (!isNaN(frameTimestamps[i]) && !isNaN(frameTimestamps[i + 1])) {
                    boundaries.push((frameTimestamps[i] + frameTimestamps[i + 1]) / 2);
                } else {
                    // Handle potential NaN - push the previous boundary or the current timestamp
                    boundaries.push(boundaries[boundaries.length - 1] !== -Infinity ? boundaries[boundaries.length - 1] : frameTimestamps[i] || Date.now());
                }
            }
            boundaries.push(Infinity);

            // Find which time range the hoveredTimestamp falls into
            if (!isNaN(targetTime)) {
                for (let i = 0; i < boundaries.length - 1; i++) {
                    if (targetTime >= boundaries[i] && targetTime < boundaries[i + 1]) {
                        highlightIndex = i; // Frame i corresponds to the range between boundary i and i+1
                        break;
                    }
                }
            }
            // --- DEBUG LOG ---
            // console.log(`[Highlight Debug] Target: ${targetTime}, Boundaries: ${boundaries.map(t => t === Infinity || t === -Infinity ? t : new Date(t).toISOString())}`);
            // console.log(`[Highlight Debug] Highlight Index: ${highlightIndex}`);
            // --- END DEBUG LOG ---
        }
        // --- End Frame Time Boundaries Calculation ---

        const newTrendChanges: Array<{ timestamp: string; x: number; isPositive: boolean }> = [];
        let prevIsLargestPositive: boolean | null = null;
        const linePoints: { x: number; y: number; isPositive: boolean; isLargestPositive: boolean }[] = [];

        framesToDraw.forEach((frame, frameIndex) => {
            const x = frameIndex * boxSize;
            const boxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            if (boxes.length === 0) return;

            const slicedBoxes = frame.progressiveValues.slice(boxOffset, boxOffset + visibleBoxesCount);
            const negativeBoxes = slicedBoxes.filter((box) => box.value < 0).sort((a, b) => a.value - b.value);
            const positiveBoxes = slicedBoxes.filter((box) => box.value >= 0).sort((a, b) => a.value - b.value);
            const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

            const largestBox = orderedBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max), orderedBoxes[0] || { value: 0 });
            const isLargestPositive = largestBox.value >= 0;

            const smallestBoxData = orderedBoxes.reduce(
                (minData, box) => {
                    const absValue = Math.abs(box.value);
                    if (absValue < minData.minAbsValue) {
                        return { minAbsValue: absValue, box: box };
                    }
                    return minData;
                },
                { minAbsValue: Infinity, box: null as Box | null }
            );
            const smallestBox = smallestBoxData.box;

            if (smallestBox) {
                const isPositive = smallestBox.value >= 0;
                const boxIndex = orderedBoxes.findIndex((box) => box === smallestBox);
                const y = (boxIndex + (isPositive ? 0 : 1)) * boxSize;
                linePoints.push({ x: x, y: y, isPositive: isPositive, isLargestPositive: isLargestPositive });
            }

            if (prevIsLargestPositive !== null && prevIsLargestPositive !== isLargestPositive) {
                newTrendChanges.push({ timestamp: frame.timestamp, x: x, isPositive: isLargestPositive });
            }
            prevIsLargestPositive = isLargestPositive;
        });
        setTrendChanges(newTrendChanges);

        if (showLine && linePoints.length > 0) {
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
                    ctx.lineTo(nextPoint.x, totalHeight);
                    ctx.lineTo(currentPoint.x, totalHeight);
                }
                ctx.closePath();
                const fillColor = currentPoint.isLargestPositive ? boxColors.positive : boxColors.negative;
                const gradient = ctx.createLinearGradient(currentPoint.x, 0, nextPoint.x, 0);
                try {
                    const r = parseInt(fillColor.slice(1, 3), 16) || 0;
                    const g = parseInt(fillColor.slice(3, 5), 16) || 0;
                    const b = parseInt(fillColor.slice(5, 7), 16) || 0;
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                } catch (e) {
                    console.error('Error parsing fill color:', fillColor, e);
                }
            }
            if (linePoints.length > 0) {
                const lastPoint = linePoints[linePoints.length - 1];
                ctx.beginPath();
                if (lastPoint.isLargestPositive) {
                    ctx.moveTo(lastPoint.x, 0);
                    ctx.lineTo(lastPoint.x + boxSize, 0);
                    ctx.lineTo(lastPoint.x + boxSize, totalHeight);
                    ctx.lineTo(lastPoint.x, lastPoint.y);
                } else {
                    ctx.moveTo(lastPoint.x, lastPoint.y);
                    ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
                    ctx.lineTo(lastPoint.x + boxSize, totalHeight);
                    ctx.lineTo(lastPoint.x, totalHeight);
                }
                ctx.closePath();
                const fillColor = lastPoint.isLargestPositive ? boxColors.positive : boxColors.negative;
                const gradient = ctx.createLinearGradient(lastPoint.x, 0, lastPoint.x + boxSize, 0);
                try {
                    const r = parseInt(fillColor.slice(1, 3), 16) || 0;
                    const g = parseInt(fillColor.slice(3, 5), 16) || 0;
                    const b = parseInt(fillColor.slice(5, 7), 16) || 0;
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                } catch (e) {
                    console.error('Error parsing fill color:', fillColor, e);
                }
            }
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

        if (highlightIndex !== -1) {
            const highlightX = highlightIndex * boxSize;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // Subtle highlight
            ctx.fillRect(highlightX, 0, boxSize, totalHeight);
        }
    }, [isClient, data, boxOffset, visibleBoxesCount, boxColors, hoveredTimestamp, showLine]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const currentFrames = framesToDrawRef.current;
        if (!onHoverChange || !canvasRef.current || currentFrames.length === 0 || !effectiveBoxWidth) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;

        // Ensure effectiveBoxWidth is positive to avoid division by zero
        if (effectiveBoxWidth <= 0) return;

        const frameIndex = Math.floor(x / effectiveBoxWidth);

        if (frameIndex >= 0 && frameIndex < currentFrames.length) {
            const frame = currentFrames[frameIndex];
            if (frame) {
                const timestamp = new Date(frame.timestamp).getTime();
                // --- DEBUG LOG ---
                // console.log(`Mouse Hover: x=${x.toFixed(1)}, width=${effectiveBoxWidth.toFixed(1)}, index=${frameIndex}, ts=${timestamp}`);
                // --- END DEBUG LOG ---
                if (!isNaN(timestamp)) {
                    // Ensure valid timestamp before sending
                    onHoverChange(timestamp);
                }
            }
        } else {
            // --- DEBUG LOG ---
            // console.log(`Mouse Hover: x=${x.toFixed(1)}, width=${effectiveBoxWidth.toFixed(1)}, index=${frameIndex} (Out of bounds)`);
            // --- END DEBUG LOG ---
            onHoverChange(null);
        }
    };
    const handleMouseLeave = () => {
        if (onHoverChange) {
            onHoverChange(null);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div
                ref={scrollContainerRef}
                className='scrollbar-hide h-full w-full overflow-x-auto'
                {...(onHoverChange && { onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave })}>
                <div className='relative h-full pt-6'>
                    <div className='pointer-events-none absolute -top-0 right-0 left-0 z-0 ml-[18px] h-6'>
                        {trendChanges.map((change, index) => (
                            <div
                                key={`${change.timestamp}-${index}-${change.x}`}
                                className='absolute -translate-x-1/2 transform'
                                style={{
                                    left: `${change.x}px`,
                                    color: change.isPositive ? boxColors.positive : boxColors.negative,
                                }}>
                                ▼
                            </div>
                        ))}
                    </div>

                    <div className='h-full'>
                        <canvas ref={canvasRef} className='block h-full overflow-y-hidden' style={{ imageRendering: 'pixelated' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Histogram);
