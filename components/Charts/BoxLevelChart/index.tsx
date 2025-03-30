'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatTime } from '@/utils/dateUtils';
import { INSTRUMENTS } from '@/utils/instruments';
import { useColorStore } from '@/stores/colorStore';
import { XAxis } from '../CandleChart/Xaxis';
import { YAxis } from '../CandleChart/YAxis';

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
    BOX_LEVELS: {
        LINE_WIDTH: 4,
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

    // Process each box to get its position and dimensions
    const processedBoxes = recentBoxes
        .map((box) => {
            const boxTime = new Date(box.timestamp).getTime();
            const candle = candleMap.get(boxTime);
            if (!candle) return null;

            const scaleY = (price: number) => {
                const normalizedPrice = (price - paddedMin) / (paddedMax - paddedMin);
                return height * (1 - normalizedPrice);
            };

            const slicedBoxes = [...box.boxes].slice(boxOffset, boxOffset + visibleBoxesCount).map((level: any, boxIndex: number) => ({
                ...level,
                id: `${boxTime}-${boxIndex}-${level.high}-${level.low}-${level.value}`,
                scaledHigh: scaleY(level.high),
                scaledLow: scaleY(level.low),
            }));

            return {
                timestamp: boxTime,
                xPosition: candle.scaledX,
                boxes: slicedBoxes,
            };
        })
        .filter(Boolean);

    return (
        <g className='box-levels'>
            {processedBoxes.map((boxFrame, index) => {
                const filteredLevels = boxFrame.boxes.filter((level) => {
                    if (boxVisibilityFilter === 'positive') {
                        return level.value > 0;
                    }
                    if (boxVisibilityFilter === 'negative') {
                        return level.value < 0;
                    }
                    return true;
                });

                return (
                    <g key={`${boxFrame.timestamp}-${index}`} transform={`translate(${boxFrame.xPosition}, 0)`}>
                        {filteredLevels.map((level) => {
                            const color = level.value > 0 ? boxColors.positive : boxColors.negative;
                            const opacity = 0.8;

                            return (
                                <g key={level.id}>
                                    <line
                                        x1={-lineWidth / 2}
                                        y1={level.scaledHigh}
                                        x2={lineWidth / 2}
                                        y2={level.scaledHigh}
                                        stroke={color}
                                        strokeWidth={0.5}
                                        strokeOpacity={opacity}
                                    />
                                    <line
                                        x1={-lineWidth / 2}
                                        y1={level.scaledLow}
                                        x2={lineWidth / 2}
                                        y2={level.scaledLow}
                                        stroke={color}
                                        strokeWidth={0.5}
                                        strokeOpacity={opacity}
                                    />
                                </g>
                            );
                        })}
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

    const { visibleData, minY, maxY } = useChartData(candles, scrollLeft, chartWidth, chartHeight, yAxisScale, CHART_CONFIG.VISIBLE_POINTS);

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
                const maxScale = Math.min(CHART_CONFIG.MAX_ZOOM, chartHeight / CHART_CONFIG.Y_AXIS.MIN_PRICE_HEIGHT);
                return Math.max(minScale, Math.min(maxScale, newScale));
            });
        },
        [chartHeight]
    );

    const dragHandlers = useMemo(() => {
        let lastDragTime = 0;
        let lastScrollUpdate = 0;
        const THROTTLE_MS = 16;

        const updateScroll = (clientX: number) => {
            const now = Date.now();
            if (now - lastScrollUpdate < THROTTLE_MS) return;

            const deltaX = clientX - dragStart;
            const maxScroll = Math.max(0, candles.length * 2 - chartWidth);
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

    const displayedHoverInfo = useMemo(() => {
        if (hoveredTimestamp === null || !visibleData || visibleData.length === 0 || !chartHeight || !minY || !maxY) {
            return null;
        }

        const point = visibleData.find((p) => p.timestamp === hoveredTimestamp);

        if (point) {
            const yRatio = (point.close - minY) / (maxY - minY);
            const y = chartHeight * (1 - yRatio);

            return {
                x: point.scaledX,
                y: y,
                price: point.close,
                time: formatTime(new Date(point.timestamp)),
                timestamp: point.timestamp,
            };
        }

        return null;
    }, [hoveredTimestamp, visibleData, chartHeight, minY, maxY]);

    const hoverHandlers = useMemo(
        () => ({
            onSvgMouseMove: (event: React.MouseEvent<SVGSVGElement>) => {
                if (isDragging || !onHoverChange) return;

                const svgRect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - svgRect.left - chartPadding.left;

                if (x >= 0 && x <= chartWidth) {
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
                        onHoverChange(closestPoint.timestamp);
                    } else {
                        onHoverChange(null);
                    }
                } else {
                    onHoverChange(null);
                }
            },
            onMouseLeave: () => {
                if (onHoverChange) {
                    onHoverChange(null);
                }
            },
        }),
        [isDragging, chartWidth, chartPadding.left, visibleData, onHoverChange]
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
