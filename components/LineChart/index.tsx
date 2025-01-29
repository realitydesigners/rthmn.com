'use client';
import React, { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react';
import { formatTime } from '@/utils/dateUtils';
import { useChartData } from '@/hooks/useChartData';

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
    PADDING: { top: 0, right: 60, bottom: 60, left: 0 },
    COLORS: {
        UP: '#22c55e',
        DOWN: '#ef4444',
        AXIS: '#777',
        HOVER_BG: '#1f2937',
        LAST_PRICE: '#2563eb',
    },
    Y_AXIS: {
        MIN_PRICE_HEIGHT: 50,
        LABEL_WIDTH: 65,
    },
    CANDLES: {
        MIN_WIDTH: 4, // Minimum width of a candle
        MAX_WIDTH: 12, // Maximum width of a candle
        MIN_SPACING: 2, // Minimum pixels between candles
    },
} as const;

// Core chart components
const CandleSticks = memo(({ data, width, height }: { data: ChartDataPoint[]; width: number; height: number }) => {
    const candleWidth = Math.max(4, Math.min(12, (width / data.length) * 0.8));
    const halfCandleWidth = candleWidth / 2;

    return (
        <g>
            {data.map((point, i) => {
                if (point.scaledX < -candleWidth || point.scaledX > width + candleWidth) return null;

                const isGreen = point.close >= point.open;
                const candleColor = isGreen ? CHART_CONFIG.COLORS.UP : CHART_CONFIG.COLORS.DOWN;
                const bodyTop = Math.min(point.scaledOpen, point.scaledClose);
                const bodyHeight = Math.max(1, Math.max(point.scaledOpen, point.scaledClose) - bodyTop);

                return (
                    <g key={i} transform={`translate(${point.scaledX - halfCandleWidth}, 0)`}>
                        <line x1={halfCandleWidth} y1={point.scaledHigh} x2={halfCandleWidth} y2={point.scaledLow} stroke={candleColor} strokeWidth='1.5' />
                        <rect x={0} y={bodyTop} width={candleWidth} height={bodyHeight} fill={candleColor} />
                    </g>
                );
            })}
        </g>
    );
});

const LastPriceLine = memo(({ price, scaledY, chartWidth }: { price: number; scaledY: number; chartWidth: number }) => (
    <g>
        <line x1={0} y1={scaledY} x2={chartWidth} y2={scaledY} stroke={CHART_CONFIG.COLORS.LAST_PRICE} strokeWidth='1.5' strokeDasharray='4 4' />
        <rect x={chartWidth - 65} y={scaledY - 12} width={55} height={24} fill={CHART_CONFIG.COLORS.LAST_PRICE} rx={6} />
        <text x={chartWidth - 37.5} y={scaledY + 4} fill='white' fontSize='13' fontWeight='600' textAnchor='middle'>
            {price.toFixed(5)}
        </text>
    </g>
));

// Main chart component
export const LineChart = ({ candles = [] }: { candles: any[] }) => {
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

    const { processedCandles, visibleData, minY, maxY } = useChartData(candles, scrollLeft, chartWidth, chartHeight, yAxisScale, CHART_CONFIG.VISIBLE_POINTS);

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

        // Create ResizeObserver to watch parent size changes
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current?.parentElement) {
            resizeObserver.observe(containerRef.current.parentElement);
        }

        window.addEventListener('resize', updateDimensions);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateDimensions);
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

    // Combine all drag-related handlers into one object
    const dragHandlers = useMemo(
        () => ({
            onMouseDown: (event: React.MouseEvent) => {
                if (!isYAxisDragging) {
                    setIsDragging(true);
                    setDragStart(event.clientX);
                    setScrollStart(scrollLeft);
                    if (containerRef.current) {
                        containerRef.current.style.cursor = 'grabbing';
                    }
                }
            },
            onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => {
                if (isDragging && !isYAxisDragging) {
                    const deltaX = event.clientX - dragStart;
                    const maxScroll = Math.max(0, processedCandles.length * (CHART_CONFIG.CANDLES.MIN_WIDTH + CHART_CONFIG.CANDLES.MIN_SPACING) - chartWidth);
                    const newScrollLeft = Math.max(0, Math.min(maxScroll, scrollStart - deltaX));
                    setScrollLeft(newScrollLeft);
                }
            },
            onMouseUp: () => {
                if (!isYAxisDragging) {
                    setIsDragging(false);
                    if (containerRef.current) {
                        containerRef.current.style.cursor = 'grab';
                    }
                }
            },
        }),
        [isDragging, isYAxisDragging, dragStart, scrollStart, chartWidth, processedCandles.length]
    );

    // Replace the separate hover handlers with a single object
    const hoverHandlers = useMemo(
        () => ({
            onSvgMouseMove: (event: React.MouseEvent<SVGSVGElement>) => {
                if (isDragging) return;

                const svgRect = event.currentTarget.getBoundingClientRect();
                const x = event.clientX - svgRect.left - chartPadding.left;

                if (x >= 0 && x <= chartWidth) {
                    const xRatio = x / chartWidth;
                    const index = Math.floor(xRatio * (visibleData.length - 1));
                    if (index >= 0 && index < visibleData.length) {
                        const point = visibleData[index];
                        setHoverInfo({
                            x: point.scaledX,
                            y: point.scaledClose,
                            price: point.close,
                            time: formatTime(new Date(point.timestamp)),
                        });
                    }
                } else {
                    setHoverInfo(null);
                }
            },
            onMouseLeave: () => setHoverInfo(null),
        }),
        [isDragging, chartWidth, chartPadding.left, visibleData]
    );

    return (
        <div
            ref={containerRef}
            className='no-select absolute inset-0 overflow-hidden border-t border-[#222] bg-[#0a0a0a]'
            onMouseDown={dragHandlers.onMouseDown}
            onMouseMove={dragHandlers.onMouseMove}
            onMouseUp={dragHandlers.onMouseUp}
            onMouseLeave={dragHandlers.onMouseUp}>
            <svg
                width='100%'
                height='100%'
                viewBox={`0 0 ${dimensions.width} ${dimensions.height + 25}`}
                onMouseMove={hoverHandlers.onSvgMouseMove}
                onMouseLeave={hoverHandlers.onMouseLeave}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
                <g transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}>
                    <path d={`M ${visibleData.map((p) => `${p.scaledX} ${p.scaledClose}`).join(' L ')}`} stroke='rgba(34, 197, 94, 0.3)' strokeWidth='1' fill='none' />
                    <CandleSticks data={visibleData} width={chartWidth} height={chartHeight} />
                    {visibleData.length > 0 && (
                        <LastPriceLine price={visibleData[visibleData.length - 1].close} scaledY={visibleData[visibleData.length - 1].scaledClose} chartWidth={chartWidth} />
                    )}
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
                    />
                    {hoverInfo && <HoverInfoComponent x={hoverInfo.x} y={hoverInfo.y} chartHeight={chartHeight} chartWidth={chartWidth} />}
                </g>
            </svg>
        </div>
    );
};

const XAxis: React.FC<{
    data: ChartDataPoint[];
    chartWidth: number;
    chartHeight: number;
    hoverInfo: any | null;
    formatTime: (date: Date) => string;
}> = memo(({ data, chartWidth, chartHeight, hoverInfo, formatTime }) => {
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

    return (
        <g className='x-axis'>
            <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke='#777' strokeWidth='1' />
            {intervals.map((point, index) => (
                <g key={`time-${point.timestamp}-${index}`} transform={`translate(${point.scaledX}, ${chartHeight})`}>
                    <line y2={6} stroke='#777' strokeWidth='1' />
                    <text y={25} textAnchor='middle' fill='#fff' fontSize='12' style={{ userSelect: 'none' }}>
                        {formatTime(new Date(point.timestamp))}
                    </text>
                </g>
            ))}
            {hoverInfo && (
                <g transform={`translate(${hoverInfo.x}, ${chartHeight - 5})`}>
                    <rect x={-40} y={5} width={80} height={20} fill='#1f2937' rx={4} />
                    <text x={0} y={20} textAnchor='middle' fill='white' fontSize='12' fontWeight='bold' style={{ userSelect: 'none' }}>
                        {hoverInfo.time}
                    </text>
                </g>
            )}
        </g>
    );
});

const YAxis: React.FC<{
    minY: number;
    maxY: number;
    chartHeight: number;
    chartWidth: number;
    onDrag: (deltaY: number) => void;
    hoverInfo: any | null;
    onYAxisDragStart: () => void;
    onYAxisDragEnd: () => void;
}> = memo(({ minY, maxY, chartHeight, chartWidth, onDrag, hoverInfo, onYAxisDragStart, onYAxisDragEnd }) => {
    const handleMouseDown = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation(); // Prevent container drag from starting
            onYAxisDragStart(); // Start Y-axis drag
            const startY = event.clientY;

            const handleMouseMove = (e: MouseEvent) => {
                const deltaY = (e.clientY - startY) / chartHeight;
                onDrag(deltaY);
            };

            const handleMouseUp = () => {
                onYAxisDragEnd(); // End Y-axis drag
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        },
        [onDrag, chartHeight, onYAxisDragStart, onYAxisDragEnd]
    );

    const priceRange = maxY - minY;

    // Calculate the number of price levels based on available height
    const minSpacing = CHART_CONFIG.Y_AXIS.MIN_PRICE_HEIGHT;
    const maxLevels = Math.floor(chartHeight / minSpacing);
    const numLevels = Math.min(12, maxLevels);

    const prices = Array.from({ length: numLevels }, (_, i) => {
        const ratio = i / (numLevels - 1);
        return minY + priceRange * ratio;
    });

    return (
        <g className='y-axis' transform={`translate(${chartWidth}, 0)`} onMouseDown={handleMouseDown} style={{ userSelect: 'none' }}>
            <rect x={0} y={0} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={chartHeight} fill='transparent' cursor='ns-resize' />
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke={CHART_CONFIG.COLORS.AXIS} />

            {/* Price levels */}
            {prices.map((price, i) => {
                const y = chartHeight * (1 - i / (numLevels - 1));
                return (
                    <g key={i} transform={`translate(0, ${y})`}>
                        <line x1={0} x2={5} stroke={CHART_CONFIG.COLORS.AXIS} />
                        <text x={10} y={4} fill='white' fontSize='12' textAnchor='start'>
                            {price.toFixed(5)}
                        </text>
                        <line x1={0} y1={0} x2={-chartWidth} y2={0} stroke={CHART_CONFIG.COLORS.AXIS} strokeOpacity='0.1' strokeDasharray='4 4' />
                    </g>
                );
            })}

            {/* Hover price */}
            {hoverInfo && (
                <g transform={`translate(0, ${hoverInfo.y})`}>
                    <rect x={3} y={-10} width={CHART_CONFIG.Y_AXIS.LABEL_WIDTH} height={20} fill={CHART_CONFIG.COLORS.HOVER_BG} rx={4} />
                    <text x={33} y={4} textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
                        {hoverInfo.price.toFixed(5)}
                    </text>
                </g>
            )}
        </g>
    );
});

const HoverInfoComponent = ({ x, y, chartHeight, chartWidth }: { x: number; y: number; chartHeight: number; chartWidth: number }) => {
    if (!isFinite(x) || !isFinite(y)) return null;

    return (
        <g>
            <line x1={x} y1={0} x2={x} y2={chartHeight} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
            <line x1={0} y1={y} x2={chartWidth} y2={y} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
        </g>
    );
};
