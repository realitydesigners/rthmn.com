'use client';
import React, { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react';
import { formatTime } from '@/utils/dateUtils';
import { useChartData } from '@/hooks/useChartData';
import { INSTRUMENTS } from '@/utils/instruments';

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

const CHART_CONFIG = {
    VISIBLE_POINTS: 1000,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 5,
    PADDING: { top: 20, right: 70, bottom: 40, left: 0 },
    COLORS: {
        BULLISH: '#22c55e', // Green for bullish
        BEARISH: '#ef4444', // Red for bearish
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
        MAX_WIDTH: 16,
        MIN_SPACING: 1,
        WICK_WIDTH: 1,
    },
} as const;

// Add this hook at the top of the file after imports
const useInstrumentConfig = (pair: string) => {
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
    const candleWidth = Math.max(CHART_CONFIG.CANDLES.MIN_WIDTH, Math.min(CHART_CONFIG.CANDLES.MAX_WIDTH, (width / data.length) * 0.7));
    const halfCandleWidth = candleWidth / 2;

    // Filter visible candles before mapping
    const visibleCandles = data.filter((point) => {
        // Add a buffer of one candle width on each side
        const isVisible = point.scaledX >= -candleWidth && point.scaledX <= width + candleWidth;
        return isVisible;
    });

    // Log the number of rendered candles vs total
    console.log('Rendered candles:', visibleCandles.length, 'of', data.length);

    return (
        <g>
            {visibleCandles.map((point, i) => {
                const candle = point.close > point.open;
                const candleColor = candle ? CHART_CONFIG.COLORS.BULLISH : CHART_CONFIG.COLORS.BEARISH;

                const bodyTop = Math.min(point.scaledOpen, point.scaledClose);
                const bodyBottom = Math.max(point.scaledOpen, point.scaledClose);
                const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                return (
                    <g key={point.timestamp} transform={`translate(${point.scaledX - halfCandleWidth}, 0)`}>
                        <line x1={halfCandleWidth} y1={point.scaledHigh} x2={halfCandleWidth} y2={bodyTop} stroke={candleColor} strokeWidth={CHART_CONFIG.CANDLES.WICK_WIDTH} />
                        <line x1={halfCandleWidth} y1={bodyBottom} x2={halfCandleWidth} y2={point.scaledLow} stroke={candleColor} strokeWidth={CHART_CONFIG.CANDLES.WICK_WIDTH} />
                        <rect x={0} y={bodyTop} width={candleWidth} height={bodyHeight} fill={candle ? 'none' : candleColor} stroke={candleColor} strokeWidth={1} />
                    </g>
                );
            })}
        </g>
    );
});

const CandleChart = ({ candles = [], initialVisibleData, pair }: { candles: ChartDataPoint[]; initialVisibleData: ChartDataPoint[]; pair: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [yAxisScale, setYAxisScale] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isYAxisDragging, setIsYAxisDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [scrollStart, setScrollStart] = useState(0);
    const [hoverInfo, setHoverInfo] = useState<any | null>(null);

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

    // Update hover handlers to use scaled prices
    const hoverHandlers = useMemo(
        () => ({
            onSvgMouseMove: (event: React.MouseEvent<SVGSVGElement>) => {
                if (isDragging) return;

                const svgRect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - svgRect.left - chartPadding.left;
                const y = event.clientY - svgRect.top - chartPadding.top;

                if (x >= 0 && x <= chartWidth) {
                    const xRatio = x / chartWidth;
                    const index = Math.floor(xRatio * (visibleData.length - 1));

                    // Find the closest data point
                    if (index >= 0 && index < visibleData.length) {
                        const point = visibleData[index];
                        // Calculate the actual price at hover position
                        const yRatio = (chartHeight - y) / chartHeight;
                        const hoverPrice = minY + (maxY - minY) * yRatio;

                        setHoverInfo({
                            x, // Use exact cursor X position instead of point.scaledX
                            y,
                            price: hoverPrice,
                            actualPrice: point.close,
                            time: formatTime(new Date(point.timestamp)),
                        });
                    }
                } else {
                    setHoverInfo(null);
                }
            },
            onMouseLeave: () => setHoverInfo(null),
        }),
        [isDragging, chartWidth, chartHeight, chartPadding.left, chartPadding.top, visibleData, minY, maxY]
    );

    return (
        <div
            ref={containerRef}
            className='no-select h-full w-full overflow-hidden bg-black'
            onMouseDown={dragHandlers.onMouseDown}
            onMouseMove={dragHandlers.onMouseMove}
            onMouseUp={dragHandlers.onMouseUp}
            onMouseLeave={dragHandlers.onMouseLeave}>
            {(!chartWidth || !chartHeight) && initialVisibleData ? (
                <svg width='100%' height='100%'>
                    <g transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}>
                        <CandleSticks data={initialVisibleData} width={chartWidth || 1000} height={chartHeight || 500} />
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
                        <CandleSticks data={visibleData} width={chartWidth} height={chartHeight} />
                        <XAxis data={visibleData} chartWidth={chartWidth} chartHeight={chartHeight} hoverInfo={hoverInfo} formatTime={formatTime} />
                        <YAxis
                            minY={minY}
                            maxY={maxY}
                            chartHeight={chartHeight}
                            chartWidth={chartWidth}
                            onDrag={handleYAxisDrag}
                            hoverInfo={hoverInfo}
                            onYAxisDragStart={() => setIsYAxisDragging(true)}
                            onYAxisDragEnd={() => setIsYAxisDragging(false)}
                            pair={pair}
                            lastPrice={visibleData[visibleData.length - 1].close}
                            lastPriceY={visibleData[visibleData.length - 1].scaledClose}
                        />
                        {hoverInfo && <HoverInfoComponent x={hoverInfo.x} y={hoverInfo.y} chartHeight={chartHeight} chartWidth={chartWidth} />}
                    </g>
                </svg>
            ) : (
                <div className='flex h-full items-center justify-center text-gray-400'>No data to display</div>
            )}
        </div>
    );
};

export default CandleChart;

const XAxis: React.FC<{
    data: ChartDataPoint[];
    chartWidth: number;
    chartHeight: number;
    hoverInfo: any | null;
    formatTime: (date: Date) => string;
}> = memo(({ data, chartWidth, chartHeight, hoverInfo, formatTime }) => {
    const TICK_HEIGHT = 6;
    const LABEL_PADDING = 5;
    const FONT_SIZE = 12;
    const HOVER_BG_HEIGHT = 15;

    const intervals = useMemo(() => {
        if (data.length === 0) return [];

        const hourMs = 60 * 60 * 1000;
        const firstTime = new Date(data[0].timestamp);
        const startTime = new Date(firstTime).setMinutes(0, 0, 0);
        const endTime = data[data.length - 1].timestamp;
        const result = [];

        for (let time = startTime; time <= endTime; time += hourMs) {
            const closestPoint = data.reduce((prev, curr) => (Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time) ? curr : prev));
            result.push(closestPoint);
        }

        // Show fewer labels for better spacing
        const maxPoints = chartWidth < 400 ? 4 : 6;
        if (result.length > maxPoints) {
            const step = Math.ceil(result.length / maxPoints);
            return result.filter((_, i) => i % step === 0);
        }

        return result;
    }, [data, chartWidth]);

    if (data.length === 0) return null;

    // Calculate Y positions for consistent alignment
    const labelY = TICK_HEIGHT + LABEL_PADDING + FONT_SIZE;
    const hoverY = TICK_HEIGHT + LABEL_PADDING;

    return (
        <g className='x-axis'>
            {/* Main axis line */}
            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke='#777' strokeWidth='1' />

            {/* Time intervals */}
            {intervals.map((point, index) => (
                <g key={`time-${point.timestamp}-${index}`} transform={`translate(${point.scaledX}, ${chartHeight})`}>
                    <line y2={TICK_HEIGHT} stroke='#777' strokeWidth='1' />
                    <text y={labelY} textAnchor='middle' fill='#fff' fontSize={FONT_SIZE} style={{ userSelect: 'none' }}>
                        {formatTime(new Date(point.timestamp))}
                    </text>
                </g>
            ))}

            {/* Hover time indicator */}
            {hoverInfo && (
                <g transform={`translate(${hoverInfo.x}, ${chartHeight})`}>
                    <rect x={-40} y={hoverY} width={80} height={HOVER_BG_HEIGHT} fill={CHART_CONFIG.COLORS.HOVER_BG} rx={4} />
                    <text
                        x={0}
                        y={hoverY + HOVER_BG_HEIGHT / 2 + FONT_SIZE / 3}
                        textAnchor='middle'
                        fill='black'
                        fontSize={FONT_SIZE}
                        fontWeight='bold'
                        style={{ userSelect: 'none' }}>
                        {hoverInfo.time}
                    </text>
                </g>
            )}
        </g>
    );
});

interface YAxisProps {
    minY: number;
    maxY: number;
    chartHeight: number;
    chartWidth: number;
    onDrag: (deltaY: number) => void;
    hoverInfo: any | null;
    onYAxisDragStart: () => void;
    onYAxisDragEnd: () => void;
    pair: string;
    lastPrice: number;
    lastPriceY: number;
}

const YAxis: React.FC<YAxisProps> = ({ minY, maxY, chartHeight, chartWidth, onDrag, hoverInfo, onYAxisDragStart, onYAxisDragEnd, pair, lastPrice, lastPriceY }) => {
    const handleMouseDown = (event: React.MouseEvent) => {
        event.stopPropagation();
        onYAxisDragStart();
        const startY = event.clientY;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = (e.clientY - startY) / chartHeight;
            onDrag(deltaY);
        };

        const handleMouseUp = () => {
            onYAxisDragEnd();
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const instrumentConfig = useInstrumentConfig(pair);

    // Generate price levels with fixed 5-pip intervals
    const PIP_SIZE = instrumentConfig.point * 10; // Adjust for actual pip size (point is usually 0.00001, pip is 0.0001)
    const FIXED_INTERVAL_PIPS = 5; // Always show every 5 pips
    const PRICE_INTERVAL = PIP_SIZE * FIXED_INTERVAL_PIPS;
    const priceRange = maxY - minY;

    // Round min and max to nearest 5-pip interval
    const roundedMin = Math.floor(minY / PRICE_INTERVAL) * PRICE_INTERVAL;
    const roundedMax = Math.ceil(maxY / PRICE_INTERVAL) * PRICE_INTERVAL;

    const levels = [];
    for (let price = roundedMin; price <= roundedMax; price += PRICE_INTERVAL) {
        const y = chartHeight - ((price - minY) / priceRange) * chartHeight;
        // Only add levels that are visible or just slightly outside the view
        if (y >= -20 && y <= chartHeight + 20) {
            levels.push({
                price,
                y,
                digits: instrumentConfig.digits,
            });
        }
    }

    return (
        <g className='y-axis' transform={`translate(${chartWidth}, 0)`} onMouseDown={handleMouseDown}>
            {/* Background for price labels */}
            <rect x={0} y={0} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={chartHeight} fill='transparent' cursor='ns-resize' />

            {/* Vertical axis line */}
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke={CHART_CONFIG.COLORS.AXIS} strokeWidth={1} />

            {/* Last price line and label */}
            <g>
                <line x1={-chartWidth} y1={lastPriceY} x2={0} y2={lastPriceY} stroke='white' strokeWidth='1.5' strokeDasharray='2 2' />
                <rect x={3} y={lastPriceY - 10} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={20} fill='black' rx={4} />
                <text x={33} y={lastPriceY + 4} textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
                    {lastPrice.toFixed(instrumentConfig.digits)}
                </text>
            </g>

            {/* Price levels and grid lines */}
            {levels.map(({ price, y, digits }) => (
                <g key={price}>
                    <line x1={-chartWidth} y1={y} x2={0} y2={y} stroke={CHART_CONFIG.COLORS.AXIS} strokeOpacity={0.1} strokeWidth={1} />
                    <line x1={0} x2={5} y1={y} y2={y} stroke={CHART_CONFIG.COLORS.AXIS} />
                    <text x={10} y={y + 4} fill='white' fontSize='12' textAnchor='start'>
                        {price.toFixed(digits)}
                    </text>
                </g>
            ))}

            {/* Hover price indicator */}
            {hoverInfo && (
                <g transform={`translate(0, ${hoverInfo.y})`}>
                    <rect x={3} y={-10} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={20} fill={CHART_CONFIG.COLORS.HOVER_BG} rx={4} />
                    <text x={33} y={4} textAnchor='middle' fill='black' fontSize='12' fontWeight='bold'>
                        {hoverInfo.price.toFixed(instrumentConfig.digits)}
                    </text>
                </g>
            )}
        </g>
    );
};

const HoverInfoComponent = ({ x, y, chartHeight, chartWidth }: { x: number; y: number; chartHeight: number; chartWidth: number }) => {
    if (!isFinite(x) || !isFinite(y)) return null;

    return (
        <g>
            <line x1={x} y1={0} x2={x} y2={chartHeight} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
            <line x1={0} y1={y} x2={chartWidth} y2={y} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
        </g>
    );
};
