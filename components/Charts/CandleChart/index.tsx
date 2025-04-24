'use client';

import { useColorStore } from '@/stores/colorStore';
import { formatTime } from '@/utils/dateUtils';
import { INSTRUMENTS } from '@/utils/instruments';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { XAxis } from './Xaxis';
import { YAxis } from './YAxis';
import BoxLevels from './indicators/BoxLevels';

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

export const useChartData = (
    data: ChartDataPoint[],
    scrollLeft: number,
    chartWidth: number,
    chartHeight: number,
    yAxisScale: number,
    visiblePoints: number
) => {
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

        let minPrice = Number.POSITIVE_INFINITY;
        let maxPrice = Number.NEGATIVE_INFINITY;
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
    PADDING: { top: 20, right: 50, bottom: 30, left: 0 },
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
        RIGHT_MARGIN: 64,
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

// Update CandleSticks props interface
interface CandleSticksProps {
    data: ChartDataPoint[];
    width: number;
    height: number;
    rightMargin: number;
}

const CandleSticks = memo(({ data, width, height, rightMargin }: CandleSticksProps) => {
    const { boxColors } = useColorStore();

    // Use passed rightMargin
    const adjustedWidth = width - rightMargin;

    // Calculate candle width to use 80% of available space (leaving 20% for gaps)
    const candleWidth = Math.max(
        CHART_CONFIG.CANDLES.MIN_WIDTH,
        Math.min(CHART_CONFIG.CANDLES.MAX_WIDTH, (adjustedWidth / data.length) * (1 - CHART_CONFIG.CANDLES.GAP_RATIO))
    );
    const halfCandleWidth = candleWidth / 2;

    // Adjust x positions to account for right margin
    const adjustedData = data.map((point) => ({
        ...point,
        scaledX: (point.scaledX / width) * adjustedWidth,
    }));

    // Filter visible candles before mapping
    const visibleCandles = adjustedData.filter((point) => {
        const isVisible = point.scaledX >= -candleWidth && point.scaledX <= adjustedWidth + candleWidth;
        return isVisible;
    });

    return (
        <g>
            {visibleCandles.map((point) => {
                const candle = point.close > point.open;
                const candleColor = candle ? boxColors.positive : boxColors.negative;

                const bodyTop = Math.min(point.scaledOpen, point.scaledClose);
                const bodyBottom = Math.max(point.scaledOpen, point.scaledClose);
                const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                return (
                    <g key={point.timestamp} transform={`translate(${point.scaledX - halfCandleWidth}, 0)`}>
                        <line
                            x1={halfCandleWidth}
                            y1={point.scaledHigh}
                            x2={halfCandleWidth}
                            y2={bodyTop}
                            stroke={candleColor}
                            strokeWidth={CHART_CONFIG.CANDLES.WICK_WIDTH}
                        />
                        <line
                            x1={halfCandleWidth}
                            y1={bodyBottom}
                            x2={halfCandleWidth}
                            y2={point.scaledLow}
                            stroke={candleColor}
                            strokeWidth={CHART_CONFIG.CANDLES.WICK_WIDTH}
                        />
                        <rect
                            x={0}
                            y={bodyTop}
                            width={candleWidth}
                            height={bodyHeight}
                            fill='none'
                            stroke={candleColor}
                            strokeWidth={1}
                        />
                    </g>
                );
            })}
        </g>
    );
});

const CandleChart = ({
    candles = [],
    initialVisibleData,
    pair,
    histogramBoxes = [],
    boxOffset = 0,
    visibleBoxesCount = 7,
    boxVisibilityFilter = 'all',
    hoveredTimestamp,
    onHoverChange,
    showBoxLevels = true,
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
    showBoxLevels?: boolean;
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
    const { visibleData, minY, maxY } = useChartData(
        candles,
        scrollLeft,
        chartWidth,
        chartHeight,
        yAxisScale,
        CHART_CONFIG.VISIBLE_POINTS
    );

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
            const maxScroll = Math.max(
                0,
                candles.length * (CHART_CONFIG.CANDLES.MIN_WIDTH + CHART_CONFIG.CANDLES.MIN_SPACING) - chartWidth
            );
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
            // Calculate Y position based on the point's actual close price
            const yRatio = (point.close - minY) / (maxY - minY);
            const y = chartHeight * (1 - yRatio);

            // Adjust x position for right margin
            const adjustedWidth = chartWidth - CHART_CONFIG.CANDLES.RIGHT_MARGIN;
            const adjustedX = (point.scaledX / chartWidth) * adjustedWidth;

            return {
                x: adjustedX, // Use adjusted X position
                y: y,
                price: point.close,
                time: formatTime(new Date(point.timestamp)),
                timestamp: point.timestamp,
            };
        }

        return null;
    }, [hoveredTimestamp, visibleData, chartHeight, minY, maxY, chartWidth]);

    // Update hover handlers to account for RIGHT_MARGIN
    const hoverHandlers = useMemo(
        () => ({
            onSvgMouseMove: (event: React.MouseEvent<SVGSVGElement>) => {
                if (isDragging || !onHoverChange) return;

                const svgRect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - svgRect.left - chartPadding.left;
                const adjustedWidth = chartWidth - CHART_CONFIG.CANDLES.RIGHT_MARGIN;

                if (x >= 0 && x <= adjustedWidth) {
                    // Find the closest data point based on cursor position
                    let closestPoint: ChartDataPoint | null = null;
                    let minDist = Number.POSITIVE_INFINITY;

                    visibleData.forEach((point) => {
                        // Scale the point's x position to match the adjusted width
                        const pointX = (point.scaledX / chartWidth) * adjustedWidth;
                        const dist = Math.abs(pointX - x);
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

    const HoverInfoComponent = ({
        x,
        y,
        chartHeight,
        chartWidth,
    }: { x: number; y: number; chartHeight: number; chartWidth: number }) => {
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
            onMouseLeave={dragHandlers.onMouseLeave}
        >
            {(!chartWidth || !chartHeight) && initialVisibleData ? (
                <svg width='100%' height='100%' className='min-h-[500px]'>
                    <g transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}>
                        <CandleSticks
                            data={initialVisibleData}
                            width={1000}
                            height={500}
                            rightMargin={CHART_CONFIG.CANDLES.RIGHT_MARGIN}
                        />
                    </g>
                </svg>
            ) : visibleData.length > 0 ? (
                <svg
                    width='100%'
                    height='100%'
                    onMouseMove={hoverHandlers.onSvgMouseMove}
                    onMouseLeave={hoverHandlers.onMouseLeave}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    <g transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}>
                        {showBoxLevels && (
                            <BoxLevels
                                data={visibleData}
                                histogramBoxes={histogramBoxes}
                                width={chartWidth}
                                height={chartHeight}
                                yAxisScale={yAxisScale}
                                boxOffset={boxOffset}
                                visibleBoxesCount={visibleBoxesCount}
                                boxVisibilityFilter={boxVisibilityFilter}
                                rightMargin={CHART_CONFIG.CANDLES.RIGHT_MARGIN}
                            />
                        )}
                        <CandleSticks
                            data={visibleData}
                            width={chartWidth}
                            height={chartHeight}
                            rightMargin={CHART_CONFIG.CANDLES.RIGHT_MARGIN}
                        />
                        <XAxis
                            data={visibleData}
                            chartWidth={chartWidth}
                            chartHeight={chartHeight}
                            hoverInfo={displayedHoverInfo}
                            formatTime={formatTime}
                            rightMargin={CHART_CONFIG.CANDLES.RIGHT_MARGIN}
                        />
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
                        {displayedHoverInfo && (
                            <HoverInfoComponent
                                x={displayedHoverInfo.x}
                                y={displayedHoverInfo.y}
                                chartHeight={chartHeight}
                                chartWidth={chartWidth}
                            />
                        )}
                    </g>
                </svg>
            ) : (
                <div className='flex h-full items-center justify-center text-neutral-400'>No data to display</div>
            )}
        </div>
    );
};

export default CandleChart;
