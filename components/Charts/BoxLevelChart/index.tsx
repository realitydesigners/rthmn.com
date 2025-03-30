'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatTime } from '@/utils/dateUtils';
import { INSTRUMENTS } from '@/utils/instruments';
import { useColorStore } from '@/stores/colorStore';
import { XAxis } from './Xaxis';
import { YAxis } from './YAxis';
import { Box } from '@/types/types';

export interface ChartDataPoint {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    scaledX: number;
    scaledY: number;
    scaledOpen: number;
    scaledHigh: number;
    scaledLow: number;
    scaledClose: number;
}

export const useChartData = (data: ChartDataPoint[], scrollLeft: number, chartWidth: number, chartHeight: number, yAxisScale: number, visiblePoints: number) => {
    return useMemo(() => {
        if (!data.length || !chartWidth || !chartHeight) {
            return { visibleData: [], minY: 0, maxY: 0 };
        }

        // Calculate how many points can fit in the visible area
        const pointWidth = Math.max(2, chartWidth / visiblePoints); // Ensure minimum width of 2px per point

        const RIGHT_MARGIN = chartWidth * 0.1;
        const totalWidth = chartWidth + RIGHT_MARGIN;

        // Calculate visible range based on scroll position
        const startIndex = Math.max(0, Math.floor(scrollLeft / pointWidth));
        const endIndex = Math.min(data.length, Math.ceil((scrollLeft + totalWidth) / pointWidth));
        const visibleData = data.slice(startIndex, endIndex);

        if (!visibleData.length) {
            return { visibleData: [], minY: 0, maxY: 0 };
        }

        // Find min/max prices in visible range with a small context buffer
        const contextStartIndex = Math.max(0, startIndex - Math.floor(visiblePoints * 0.1));
        const contextEndIndex = Math.min(data.length, endIndex + Math.floor(visiblePoints * 0.1));
        const contextData = data.slice(contextStartIndex, contextEndIndex);

        let minPrice = Infinity;
        let maxPrice = -Infinity;
        contextData.forEach((point) => {
            minPrice = Math.min(minPrice, point.low);
            maxPrice = Math.max(maxPrice, point.high);
        });

        // Calculate the center price for the visible range
        const centerPrice = (minPrice + maxPrice) / 2;

        // Calculate the price range based on the visible data and scale
        const baseRange = maxPrice - minPrice;
        const scaledRange = baseRange / yAxisScale;

        // Add a small padding (5%) to prevent prices from touching the edges
        const padding = scaledRange * 0.05;
        const paddedMin = centerPrice - scaledRange / 2 - padding;
        const paddedMax = centerPrice + scaledRange / 2 + padding;

        // Scale the data points
        const scaledData = visibleData.map((point, i) => {
            const scaledX = i * (chartWidth / visibleData.length);
            const scaleY = (price: number) => {
                const normalizedPrice = (price - paddedMin) / (paddedMax - paddedMin);
                return chartHeight * (1 - normalizedPrice);
            };

            return {
                ...point,
                scaledX,
                scaledY: scaleY(point.close),
                scaledOpen: scaleY(point.open),
                scaledHigh: scaleY(point.high),
                scaledLow: scaleY(point.low),
                scaledClose: scaleY(point.close),
            };
        });

        return {
            visibleData: scaledData,
            minY: paddedMin,
            maxY: paddedMax,
        };
    }, [data, scrollLeft, chartWidth, chartHeight, yAxisScale, visiblePoints]);
};

export const CHART_CONFIG = {
    VISIBLE_POINTS: 1000,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 2,
    PADDING: { top: 20, right: 70, bottom: 40, left: 0 },
    COLORS: {
        AXIS: '#ffffff',
        HOVER_BG: '#fff',
        LAST_PRICE: '#2563eb',
    },
    Y_AXIS: {
        MIN_PRICE_HEIGHT: 50,
        LABEL_WIDTH: 65,
    },
    CANDLES: {
        MIN_WIDTH: 2,
        MAX_WIDTH: 15,
        MIN_SPACING: 1,
        WICK_WIDTH: 1.5,
        GAP_RATIO: 0.5, // 40% gap between candles
    },
    BOX_LEVELS: {
        LINE_WIDTH: 4, // Moderate line width
    },
} as const;

// Add this hook at the top of the file after imports
export const useInstrumentConfig = (pair: string) => {
    return useMemo(() => {
        const upperPair = pair.toUpperCase();
        // Search in all instrument categories
        for (const category of Object.values(INSTRUMENTS)) {
            if (category[upperPair]) {
                return category[upperPair];
            }
        }
        console.warn(`No instrument configuration found for ${upperPair}, using default`);
        return { point: 0.00001, digits: 5 };
    }, [pair]);
};

// Core chart components
const CandleSticks = memo(({ data, width, height }: { data: ChartDataPoint[]; width: number; height: number }) => {
    const { boxColors } = useColorStore();

    // Calculate candle width to use 80% of available space (leaving 20% for gaps)
    const candleWidth = Math.max(CHART_CONFIG.CANDLES.MIN_WIDTH, Math.min(CHART_CONFIG.CANDLES.MAX_WIDTH, (width / data.length) * (1 - CHART_CONFIG.CANDLES.GAP_RATIO)));
    const halfCandleWidth = candleWidth / 2;

    // Filter visible candles before mapping
    const visibleCandles = data.filter((point) => {
        const isVisible = point.scaledX >= -candleWidth && point.scaledX <= width + candleWidth;
        return isVisible;
    });

    return (
        <g>
            {visibleCandles.map((point, i) => {
                const candle = point.close > point.open;
                const candleColor = candle ? boxColors.positive : boxColors.negative;

                const bodyTop = Math.min(point.scaledOpen, point.scaledClose);
                const bodyBottom = Math.max(point.scaledOpen, point.scaledClose);
                const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                return (
                    <g key={point.timestamp} transform={`translate(${point.scaledX - halfCandleWidth}, 0)`}>
                        <line x1={halfCandleWidth} y1={point.scaledHigh} x2={halfCandleWidth} y2={bodyTop} stroke={candleColor} strokeWidth={CHART_CONFIG.CANDLES.WICK_WIDTH} />
                        <line x1={halfCandleWidth} y1={bodyBottom} x2={halfCandleWidth} y2={point.scaledLow} stroke={candleColor} strokeWidth={CHART_CONFIG.CANDLES.WICK_WIDTH} />
                        <rect x={0} y={bodyTop} width={candleWidth} height={bodyHeight} fill='none' stroke={candleColor} strokeWidth={1} />
                    </g>
                );
            })}
        </g>
    );
});

// Update BoxLevels props interface
interface BoxLevelsProps {
    data: ChartDataPoint[];
    histogramBoxes: any[];
    width: number;
    height: number;
    yAxisScale: number;
    boxOffset: number;
    visibleBoxesCount: number;
    boxVisibilityFilter: 'all' | 'positive' | 'negative';
}

// Add this new component after CandleSticks
const BoxLevels = memo(({ data, histogramBoxes, width, height, yAxisScale, boxOffset, visibleBoxesCount, boxVisibilityFilter }: BoxLevelsProps) => {
    const { boxColors } = useColorStore();

    if (!histogramBoxes?.length || !data.length) return null;

    // Get the timestamp of the most recent candle
    const lastCandleTime = data[data.length - 1].timestamp;
    const oneHourAgo = lastCandleTime - 60 * 120 * 1000;

    // Create a map of timestamp to candle data for scaling
    const candleMap = new Map(data.map((point) => [point.timestamp, point]));

    // Find min/max prices in visible range
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    data.forEach((point) => {
        minPrice = Math.min(minPrice, point.low);
        maxPrice = Math.max(maxPrice, point.high);
    });

    // Calculate the center price and range (same as useChartData)
    const centerPrice = (minPrice + maxPrice) / 2;
    const baseRange = maxPrice - minPrice;
    const scaledRange = baseRange / yAxisScale;
    const padding = scaledRange * 0.05;
    const paddedMin = centerPrice - scaledRange / 2 - padding;
    const paddedMax = centerPrice + scaledRange / 2 + padding;

    // Get boxes from the last hour relative to the last candle
    const recentBoxes = histogramBoxes.filter((box) => {
        const boxTime = new Date(box.timestamp).getTime();
        return boxTime >= oneHourAgo && boxTime <= lastCandleTime;
    });

    if (!recentBoxes.length) return null;

    // Calculate line width with gap
    const lineWidth = CHART_CONFIG.BOX_LEVELS.LINE_WIDTH;

    // First, preprocess the data to get all the levels
    const rawBoxData = recentBoxes
        .map((box) => {
            const boxTime = new Date(box.timestamp).getTime();
            const candle = candleMap.get(boxTime);
            if (!candle) return null;

            // Make sure we slice with the correct indices from the timeframe slider
            // This ensures we use the correct boxOffset and visibleBoxesCount
            const slicedBoxes = [...box.boxes].slice(boxOffset, boxOffset + visibleBoxesCount);

            if (!slicedBoxes.length) return null;

            return {
                timestamp: boxTime,
                boxes: slicedBoxes,
                originalIndex: box.boxes.findIndex((b) => b === slicedBoxes[0]), // Store original index for value lookup
                currentOHLC: box.currentOHLC,
                xPosition: candle.scaledX, // Store X position from candle
            };
        })
        .filter(Boolean);

    if (rawBoxData.length < 2) return null; // Need at least 2 points to draw a line

    // Find the smallest box size
    let smallestBoxSize = Infinity;
    rawBoxData.forEach((box) => {
        box.boxes.forEach((level) => {
            const boxSize = Math.abs(level.high - level.low);
            smallestBoxSize = Math.min(smallestBoxSize, boxSize);
        });
    });

    // Add a debug message to help track changes
    console.log(`BoxLevelChart render: boxOffset=${boxOffset}, visibleBoxesCount=${visibleBoxesCount}, ${rawBoxData.length} data points`);

    // Sort boxes by size and initialize paths
    const sortedInitialBoxes = [...rawBoxData[0].boxes].sort((a, b) => {
        const sizeA = Math.abs(a.high - a.low);
        const sizeB = Math.abs(b.high - b.low);
        return sizeA - sizeB;
    });

    // Initialize a mapping to track which box in the current slice corresponds to which original index
    // This is critical when the timeframe slider changes
    const boxIndexMap = new Map();

    // Map each visible box index to its original position in the full array
    // This ensures we can look up the correct value no matter what slice we're viewing
    rawBoxData[0].boxes.forEach((box, idx) => {
        const originalIdx = idx + rawBoxData[0].originalIndex;
        boxIndexMap.set(idx, originalIdx);
    });

    console.log('Box index mapping:', Object.fromEntries(boxIndexMap));

    // Helper to create a diagonal line segment
    const createDiagonalSegment = (
        start: { x: number; high: number; low: number; value?: any; timestamp?: number; boxIndex?: number },
        end: { high: number; low: number; value?: any; timestamp?: number; boxIndex?: number }
    ) => {
        const highDiff = end.high - start.high;
        const lowDiff = end.low - start.low;
        const maxDiff = Math.max(Math.abs(highDiff), Math.abs(lowDiff));

        // Calculate x step to maintain 45° angle
        const xStep = maxDiff;

        return {
            x: start.x + xStep,
            high: end.high,
            low: end.low,
            value: end.value,
            timestamp: end.timestamp,
            boxIndex: end.boxIndex,
        };
    };

    // Initialize levels with value tracking and box indices
    const levels = sortedInitialBoxes.map((box, idx) => ({
        points: [
            {
                x: 0,
                high: box.high,
                low: box.low,
                value: box.value, // Store value with each point
                timestamp: 0, // Store timestamp index for coloring
                boxIndex: boxIndexMap.get(idx), // Store ORIGINAL box index to use for lookups
            },
        ],
        lastHigh: box.high,
        lastLow: box.low,
        currentX: 0,
    }));

    // Process each time slice
    for (let i = 1; i < rawBoxData.length; i++) {
        const currentBoxes = [...rawBoxData[i].boxes].sort((a, b) => {
            const sizeA = Math.abs(a.high - a.low);
            const sizeB = Math.abs(b.high - b.low);
            return sizeA - sizeB;
        });

        // First process the smallest box
        const smallestBox = currentBoxes[0];
        const smallestLevel = levels[0];
        const lastSmallPoint = smallestLevel.points[smallestLevel.points.length - 1];
        const smallestBoxSize = Math.abs(smallestBox.high - smallestBox.low);

        // Check if smallest box needs to move
        const smallHighChange = smallestBox.high - lastSmallPoint.high;
        const smallLowChange = smallestBox.low - lastSmallPoint.low;

        if (Math.abs(smallHighChange) >= smallestBoxSize * 0.01 || Math.abs(smallLowChange) >= smallestBoxSize * 0.01) {
            // Create new point with diagonal movement for smallest box
            const newSmallPoint = createDiagonalSegment(
                { ...lastSmallPoint, value: smallestBox.value },
                {
                    high: smallestBox.high,
                    low: smallestBox.low,
                    value: smallestBox.value,
                    boxIndex: lastSmallPoint.boxIndex, // Maintain box index
                }
            );

            // Store timestamp index for coloring
            newSmallPoint.timestamp = i;

            smallestLevel.points.push(newSmallPoint);
            smallestLevel.currentX = newSmallPoint.x;
            smallestLevel.lastHigh = smallestBox.high;
            smallestLevel.lastLow = smallestBox.low;

            // Group boxes by shared values
            const boxGroups = new Map<string, number[]>();
            currentBoxes.forEach((box, idx) => {
                // Create keys for high and low values
                const highKey = `high:${box.high}`;
                const lowKey = `low:${box.low}`;

                if (!boxGroups.has(highKey)) boxGroups.set(highKey, []);
                if (!boxGroups.has(lowKey)) boxGroups.set(lowKey, []);

                boxGroups.get(highKey)!.push(idx);
                boxGroups.get(lowKey)!.push(idx);
            });

            // Process larger boxes
            for (let j = 1; j < levels.length; j++) {
                const currentBox = currentBoxes[j];
                const currentLevel = levels[j];
                const lastPoint = currentLevel.points[currentLevel.points.length - 1];
                const boxSize = Math.abs(currentBox.high - currentBox.low);

                // Find all boxes that share values with this box
                const sharesHighWith = boxGroups.get(`high:${currentBox.high}`) || [];
                const sharesLowWith = boxGroups.get(`low:${currentBox.low}`) || [];

                // Remove self from shared groups using Array.from
                const sharingBoxes = Array.from(new Set([...sharesHighWith, ...sharesLowWith])).filter((idx) => idx !== j);

                // If this box shares values with any other box that has moved
                const sharesWithMoved = sharingBoxes.some((idx) => idx < j);

                if (sharesWithMoved) {
                    // Find the leading box (the one that's moved the furthest)
                    const leadingBox = sharingBoxes
                        .filter((idx) => idx < j)
                        .reduce(
                            (lead, idx) => {
                                const level = levels[idx];
                                return level.currentX > lead.currentX ? level : lead;
                            },
                            { currentX: 0 }
                        );

                    // Move to align with the leading box
                    const newPoint = {
                        x: leadingBox.currentX,
                        high: currentBox.high,
                        low: currentBox.low,
                        value: currentBox.value, // Store the current value
                        timestamp: i, // Store timestamp index
                        boxIndex: lastPoint.boxIndex, // Maintain the box index
                    };

                    currentLevel.points.push(newPoint);
                    currentLevel.currentX = newPoint.x;
                    currentLevel.lastHigh = currentBox.high;
                    currentLevel.lastLow = currentBox.low;
                }
                // Otherwise check if box needs to move based on its own changes
                else {
                    const highChange = currentBox.high - lastPoint.high;
                    const lowChange = currentBox.low - lastPoint.low;

                    if (Math.abs(highChange) >= boxSize * 0.01 || Math.abs(lowChange) >= boxSize * 0.01) {
                        const newPoint = createDiagonalSegment(
                            { ...lastPoint, value: currentBox.value },
                            {
                                high: currentBox.high,
                                low: currentBox.low,
                                value: currentBox.value,
                                boxIndex: lastPoint.boxIndex, // Maintain box index
                            }
                        );

                        // Store timestamp index for coloring
                        newPoint.timestamp = i;

                        currentLevel.points.push(newPoint);
                        currentLevel.currentX = newPoint.x;
                        currentLevel.lastHigh = currentBox.high;
                        currentLevel.lastLow = currentBox.low;
                    } else {
                        // Add a flatline point at the current X position of the smallest box's new point
                        const flatPoint = {
                            x: newSmallPoint.x, // Use the X position from the smallest box
                            high: lastPoint.high, // Keep current high
                            low: lastPoint.low, // Keep current low
                            value: currentBox.value, // Store the current value
                            timestamp: i, // Store timestamp index
                            boxIndex: lastPoint.boxIndex, // Maintain box index
                        };

                        // Add the flat point
                        currentLevel.points.push(flatPoint);
                        currentLevel.currentX = flatPoint.x;

                        // Update state for next iteration's comparison
                        currentLevel.lastHigh = currentBox.high;
                        currentLevel.lastLow = currentBox.low;
                    }
                }
            }
        }
    }

    // Scale x positions to fit width
    const maxX = Math.max(...levels.flatMap((level) => level.points.map((p) => p.x)));
    const xScale = (width * 0.95) / maxX;

    // Define scale function for y-axis
    const scaleY = (price: number) => {
        const normalizedPrice = (price - paddedMin) / (paddedMax - paddedMin);
        return height * (1 - normalizedPrice);
    };

    // Force colors for positive and negative values
    const POSITIVE_COLOR = '#3FFFA2'; // Green
    const NEGATIVE_COLOR = '#FF3F3F'; // Red

    return (
        <g className='box-levels'>
            {levels.map((level, levelIndex) => {
                // Get the latest box values for filtering
                // Use the original boxIndex instead of levelIndex to account for timeframe slider changes
                const latestBoxValue = rawBoxData[rawBoxData.length - 1].boxes[levelIndex]?.value;

                // Apply visibility filter
                if (boxVisibilityFilter === 'positive' && latestBoxValue <= 0) return null;
                if (boxVisibilityFilter === 'negative' && latestBoxValue >= 0) return null;

                // For each level, we'll create multiple line segments based on value changes
                const points = level.points;
                if (points.length < 2) return null;

                // Create high and low segments, directly tied to the raw data
                const segments = [];

                // Create segments for high and low lines
                for (let i = 1; i < points.length; i++) {
                    const startPoint = points[i - 1];
                    const endPoint = points[i];

                    // Get the timestamp and boxIndex for accessing the original data
                    const timeIndex = endPoint.timestamp;
                    const boxIndex = endPoint.boxIndex ?? levelIndex; // Fallback to levelIndex if boxIndex missing

                    // Skip if we don't have valid indices
                    if (timeIndex === undefined || timeIndex >= rawBoxData.length) continue;

                    // Determine color based on direction (not value)
                    // For high line: if end point is higher than start point, it's going up (green)
                    const highDirection = endPoint.high <= startPoint.high ? NEGATIVE_COLOR : POSITIVE_COLOR;

                    // For low line: if end point is higher than start point, it's going up (green)
                    const lowDirection = endPoint.low <= startPoint.low ? NEGATIVE_COLOR : POSITIVE_COLOR;

                    // Create high segment
                    segments.push({
                        x1: startPoint.x * xScale,
                        y1: scaleY(startPoint.high),
                        x2: endPoint.x * xScale,
                        y2: scaleY(endPoint.high),
                        color: highDirection,
                        type: 'high',
                    });

                    // Create low segment
                    segments.push({
                        x1: startPoint.x * xScale,
                        y1: scaleY(startPoint.low),
                        x2: endPoint.x * xScale,
                        y2: scaleY(endPoint.low),
                        color: lowDirection,
                        type: 'low',
                    });
                }

                return (
                    <g key={`level-${levelIndex}`}>
                        {segments.map((segment, idx) => (
                            <line
                                key={`${segment.type}-${levelIndex}-${idx}`}
                                x1={segment.x1}
                                y1={segment.y1}
                                x2={segment.x2}
                                y2={segment.y2}
                                stroke={segment.color}
                                strokeWidth={1}
                                strokeOpacity={0.8}
                            />
                        ))}
                    </g>
                );
            })}
        </g>
    );
});

const BoxLevelChart = ({
    candles = [],
    initialVisibleData,
    pair,
    histogramBoxes = [],
    boxOffset = 0,
    visibleBoxesCount = 7,
    boxVisibilityFilter = 'all',
    hoveredTimestamp,
    onHoverChange,
}: {
    candles?: ChartDataPoint[];
    initialVisibleData: ChartDataPoint[];
    pair: string;
    histogramBoxes?: any[];
    boxOffset?: number;
    visibleBoxesCount?: number;
    boxVisibilityFilter?: 'all' | 'positive' | 'negative';
    hoveredTimestamp?: number | null;
    onHoverChange?: (timestamp: number | null) => void;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [yAxisScale, setYAxisScale] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isYAxisDragging, setIsYAxisDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [scrollStart, setScrollStart] = useState(0);

    const chartPadding = CHART_CONFIG.PADDING;
    const chartWidth = dimensions.width - chartPadding.left - chartPadding.right;
    const chartHeight = dimensions.height - chartPadding.top - chartPadding.bottom;

    // Get chart data directly
    const { visibleData, minY, maxY } = useChartData(candles, scrollLeft, chartWidth, chartHeight, yAxisScale, CHART_CONFIG.VISIBLE_POINTS);

    // Update dimension effect to use parent's full dimensions
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (parent) {
                    const rect = parent.getBoundingClientRect();
                    setDimensions({
                        width: rect.width,
                        height: rect.height,
                    });
                }
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current?.parentElement) {
            resizeObserver.observe(containerRef.current.parentElement);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const handleYAxisDrag = useCallback(
        (deltaY: number) => {
            setYAxisScale((prev) => {
                const newScale = prev * (1 - deltaY * 0.7);
                const minScale = CHART_CONFIG.MIN_ZOOM;
                const maxScale = Math.min(
                    CHART_CONFIG.MAX_ZOOM,
                    // Prevent scaling that would make prices too close together
                    chartHeight / CHART_CONFIG.Y_AXIS.MIN_PRICE_HEIGHT
                );
                return Math.max(minScale, Math.min(maxScale, newScale));
            });
        },
        [chartHeight]
    );

    // Optimize drag handlers with throttling
    const dragHandlers = useMemo(() => {
        let lastDragTime = 0;
        let lastScrollUpdate = 0;
        const THROTTLE_MS = 16; // Approx. 60fps

        const updateScroll = (clientX: number) => {
            const now = Date.now();
            if (now - lastScrollUpdate < THROTTLE_MS) return;

            const deltaX = clientX - dragStart;
            const maxScroll = Math.max(0, candles.length * (CHART_CONFIG.CANDLES.MIN_WIDTH + CHART_CONFIG.CANDLES.MIN_SPACING) - chartWidth);
            const newScrollLeft = Math.max(0, Math.min(maxScroll, scrollStart - deltaX));

            setScrollLeft(newScrollLeft);
            lastScrollUpdate = now;
        };

        return {
            onMouseDown: (event: React.MouseEvent) => {
                if (!isYAxisDragging) {
                    event.preventDefault();
                    setIsDragging(true);
                    setDragStart(event.clientX);
                    setScrollStart(scrollLeft);
                    lastDragTime = Date.now();
                }
            },
            onMouseMove: (event: React.MouseEvent) => {
                if (isDragging && !isYAxisDragging) {
                    event.preventDefault();
                    const now = Date.now();
                    if (now - lastDragTime < THROTTLE_MS) return;
                    lastDragTime = now;
                    updateScroll(event.clientX);
                }
            },
            onMouseUp: () => {
                setIsDragging(false);
            },
            onMouseLeave: () => {
                setIsDragging(false);
            },
        };
    }, [isDragging, isYAxisDragging, dragStart, scrollStart, chartWidth, candles.length, scrollLeft]);

    // --- Derive displayed hover info from the hoveredTimestamp prop ---
    const displayedHoverInfo = useMemo(() => {
        if (hoveredTimestamp === null || !visibleData || visibleData.length === 0 || !chartHeight || !minY || !maxY) {
            return null;
        }

        // Find the visible data point matching the timestamp
        const point = visibleData.find((p) => p.timestamp === hoveredTimestamp);

        if (point) {
            // Calculate Y position based on the point's *actual* close price,
            // rather than trying to guess from a potentially inaccurate cursor Y
            // (especially if hover originated elsewhere)
            const yRatio = (point.close - minY) / (maxY - minY);
            const y = chartHeight * (1 - yRatio);

            return {
                x: point.scaledX, // Use the point's calculated X
                y: y, // Use the point's price-derived Y
                price: point.close, // Show the point's closing price
                time: formatTime(new Date(point.timestamp)),
                // Add raw timestamp if needed by subcomponents
                timestamp: point.timestamp,
            };
        }

        return null; // No matching point found in visible data
    }, [hoveredTimestamp, visibleData, chartHeight, minY, maxY]);

    // Update hover handlers to use shared state
    const hoverHandlers = useMemo(
        () => ({
            onSvgMouseMove: (event: React.MouseEvent<SVGSVGElement>) => {
                if (isDragging || !onHoverChange) return;

                const svgRect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - svgRect.left - chartPadding.left;

                if (x >= 0 && x <= chartWidth) {
                    // Find the closest data point based on X coordinate
                    let closestPoint: ChartDataPoint | null = null;
                    let minDist = Infinity;

                    visibleData.forEach((point) => {
                        const dist = Math.abs(point.scaledX - x);
                        if (dist < minDist) {
                            minDist = dist;
                            closestPoint = point;
                        }
                    });

                    if (closestPoint) {
                        // Call the shared handler with the timestamp
                        onHoverChange(closestPoint.timestamp);
                    } else {
                        onHoverChange(null); // No close point found
                    }
                } else {
                    onHoverChange(null); // Cursor is outside chart area
                }
            },
            onMouseLeave: () => {
                if (onHoverChange) {
                    onHoverChange(null);
                }
            },
        }),
        [isDragging, chartWidth, chartPadding.left, visibleData, onHoverChange] // Add onHoverChange dependency
    );

    const HoverInfoComponent = ({ x, y, chartHeight, chartWidth }: { x: number; y: number; chartHeight: number; chartWidth: number }) => {
        if (!isFinite(x) || !isFinite(y)) return null;

        return (
            <g>
                <line x1={x} y1={0} x2={x} y2={chartHeight} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
                <line x1={0} y1={y} x2={chartWidth} y2={y} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
            </g>
        );
    };

    return (
        <div
            ref={containerRef}
            className='absolute inset-0 h-full overflow-hidden'
            onMouseDown={dragHandlers.onMouseDown}
            onMouseMove={dragHandlers.onMouseMove}
            onMouseUp={dragHandlers.onMouseUp}
            onMouseLeave={dragHandlers.onMouseLeave}>
            {(!chartWidth || !chartHeight) && initialVisibleData ? (
                <svg width='100%' height='100%' className='min-h-[500px]'>
                    <g transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}>
                        <BoxLevels
                            data={initialVisibleData}
                            histogramBoxes={histogramBoxes}
                            width={1000}
                            height={500}
                            yAxisScale={yAxisScale}
                            boxOffset={boxOffset}
                            visibleBoxesCount={visibleBoxesCount}
                            boxVisibilityFilter={boxVisibilityFilter}
                        />
                    </g>
                </svg>
            ) : visibleData.length > 0 ? (
                <svg
                    width='100%'
                    height='100%'
                    onMouseMove={hoverHandlers.onSvgMouseMove}
                    onMouseLeave={hoverHandlers.onMouseLeave}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
                    <g transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}>
                        <BoxLevels
                            data={visibleData}
                            histogramBoxes={histogramBoxes}
                            width={chartWidth}
                            height={chartHeight}
                            yAxisScale={yAxisScale}
                            boxOffset={boxOffset}
                            visibleBoxesCount={visibleBoxesCount}
                            boxVisibilityFilter={boxVisibilityFilter}
                        />
                        <XAxis data={visibleData} chartWidth={chartWidth} chartHeight={chartHeight} hoverInfo={displayedHoverInfo} formatTime={formatTime} />
                        <YAxis
                            minY={minY}
                            maxY={maxY}
                            chartHeight={chartHeight}
                            chartWidth={chartWidth}
                            onDrag={handleYAxisDrag}
                            hoverInfo={displayedHoverInfo}
                            onYAxisDragStart={() => setIsYAxisDragging(true)}
                            onYAxisDragEnd={() => setIsYAxisDragging(false)}
                            pair={pair}
                            lastPrice={visibleData[visibleData.length - 1].close}
                            lastPriceY={visibleData[visibleData.length - 1].scaledClose}
                        />
                        {displayedHoverInfo && <HoverInfoComponent x={displayedHoverInfo.x} y={displayedHoverInfo.y} chartHeight={chartHeight} chartWidth={chartWidth} />}
                    </g>
                </svg>
            ) : (
                <div className='flex h-full items-center justify-center text-gray-400'>No data to display</div>
            )}
        </div>
    );
};

export default BoxLevelChart;
