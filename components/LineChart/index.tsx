'use client';
import React, { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react';
import styles from './styles.module.css';
import { Candle } from '@/types/types';
import { formatTime } from '@/utils/dateUtils';

// Add these constants at the top with other constants
const VISIBLE_POINTS = 1000;
const MIN_ZOOM = 0.1; // Most zoomed out
const MAX_ZOOM = 5; // Most zoomed in

interface ChartDataPoint {
    price: number;
    timestamp: number;
    scaledX: number;
    scaledY: number;
    open: number;
    high: number;
    low: number;
    close: number;
    scaledOpen: number;
    scaledHigh: number;
    scaledLow: number;
    scaledClose: number;
}

class OptimizedPriceBuffer {
    private buffer: ChartDataPoint[];
    private start = 0;
    private size = 0;

    constructor(private capacity: number) {
        this.buffer = new Array(capacity);
    }

    push(point: ChartDataPoint): void {
        if (this.size < this.capacity) {
            this.buffer[(this.start + this.size) % this.capacity] = point;
            this.size++;
        } else {
            this.buffer[this.start] = point;
            this.start = (this.start + 1) % this.capacity;
        }
    }

    getVisiblePoints(startIndex: number, endIndex: number): ChartDataPoint[] {
        const result: ChartDataPoint[] = [];
        const actualStart = Math.max(0, this.size - this.capacity + startIndex);
        const actualEnd = Math.min(this.size, actualStart + endIndex - startIndex);

        for (let i = actualStart; i < actualEnd; i++) {
            result.push(this.buffer[(this.start + i) % this.capacity]);
        }

        return result;
    }

    clear(): void {
        this.start = 0;
        this.size = 0;
    }
}

const PathGenerator = {
    batchSize: 1000,
    generate(points: ChartDataPoint[], width: number, height: number) {
        return this.getPathString(points, width, height);
    },
    getPathString(points: ChartDataPoint[], width: number, height: number) {
        let path = '';
        for (let i = 0; i < points.length; i += this.batchSize) {
            const batch = points.slice(i, i + this.batchSize);
            path += batch.map((p, index) => `${index === 0 && i === 0 ? 'M' : 'L'} ${p.scaledX} ${p.scaledY}`).join(' ');
        }
        return path;
    },
};

const processCandles = (candles: Candle[], buffer: OptimizedPriceBuffer) => {
    buffer.clear();
    candles.forEach((candle) => {
        const point: ChartDataPoint = {
            price: Number(candle.close),
            timestamp: typeof candle.time === 'string' ? new Date(candle.time).getTime() : candle.time,
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
            scaledX: 0,
            scaledY: 0,
            scaledOpen: 0,
            scaledHigh: 0,
            scaledLow: 0,
            scaledClose: 0,
        };
        buffer.push(point);
    });
};

// Update the hover info interface
interface HoverInfo {
    x: number;
    y: number;
    price: number;
    time: string;
    candle: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
}

const ensureNumber = (value: number) => {
    return isNaN(value) || !isFinite(value) ? 0 : value;
};

// Update HoverInfo component
const HoverInfo: React.FC<{
    x: number;
    y: number;
    chartHeight: number;
    chartWidth: number;
    candle?: {
        open: number;
        high: number;
        low: number;
        close: number;
    };
}> = ({ x, y, chartHeight, chartWidth, candle }) => {
    const safeX = ensureNumber(x);
    const safeY = ensureNumber(y);

    if (isNaN(safeX) || isNaN(safeY)) return null;

    return (
        <g>
            <line x1={safeX} y1={0} x2={safeX} y2={chartHeight} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
            <line x1={0} y1={safeY} x2={chartWidth} y2={safeY} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
        </g>
    );
};

interface LineChartProps {
    pair: string;
    candles: any[];
    height?: number;
}

export const LineChart = ({ pair, candles = [], height = 400 }: LineChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [yAxisScale, setYAxisScale] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);
    const [scrollStart, setScrollStart] = useState(0);
    const [dragStartY, setDragStartY] = useState(0); // Add this for Y-axis drag

    // Fix the buffer initialization
    const priceBufferRef = useRef(new OptimizedPriceBuffer(1000));

    // Then in useEffect, initialize the buffer
    useEffect(() => {
        processCandles(candles, priceBufferRef.current);
    }, [candles]);

    // Optimize the animation scale hook
    const useAnimatedScale = (scale: number) => {
        const [currentScale, setCurrentScale] = useState(scale);
        const prevScaleRef = useRef(scale);
        const animationFrame = useRef<number | null>(null);

        useEffect(() => {
            if (prevScaleRef.current === scale) return;
            prevScaleRef.current = scale;

            const animate = () => {
                setCurrentScale((prev) => {
                    const delta = (scale - prev) * 0.3; // Faster animation
                    if (Math.abs(delta) < 0.001) return scale;
                    return prev + delta;
                });
                animationFrame.current = requestAnimationFrame(animate);
            };

            animationFrame.current = requestAnimationFrame(animate);
            return () => {
                if (animationFrame.current !== null) {
                    cancelAnimationFrame(animationFrame.current);
                }
            };
        }, [scale]);

        return currentScale;
    };

    const animatedScale = useAnimatedScale(yAxisScale);

    const chartPadding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartWidth = dimensions.width - chartPadding.left - chartPadding.right;
    const chartHeight = dimensions.height - chartPadding.top - chartPadding.bottom;

    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

    // Keep dimension update effect but make it more responsive
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                // Adjust padding for mobile
                const mobileView = width < 768; // Check if we're on mobile
                setDimensions({
                    width,
                    height: height || 200,
                });
                // Adjust chart padding for mobile
                chartPadding.right = mobileView ? 40 : 60;
                chartPadding.left = mobileView ? 5 : 10;
                chartPadding.top = mobileView ? 10 : 20;
                chartPadding.bottom = mobileView ? 20 : 30;
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Optimize wheel event handler
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let lastWheelTime = 0;
        const THROTTLE_MS = 16; // ~60fps

        const handleWheelEvent = (event: WheelEvent) => {
            event.preventDefault();

            const now = Date.now();
            if (now - lastWheelTime < THROTTLE_MS) return;
            lastWheelTime = now;

            if (isDragging) {
                const zoomDirection = event.deltaY > 0 ? -1 : 1;
                const zoomFactor = Math.pow(1.1, zoomDirection);
                const newScale = yAxisScale * zoomFactor;

                // Add extra validation before setting the scale
                if (isFinite(newScale) && !isNaN(newScale)) {
                    setYAxisScale((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale)));
                }
            } else {
                const delta = event.deltaX || event.deltaY;
                const newScrollLeft = Math.max(0, scrollLeft + delta);
                setScrollLeft(newScrollLeft);
            }
        };

        container.addEventListener('wheel', handleWheelEvent, { passive: false });
        return () => container.removeEventListener('wheel', handleWheelEvent);
    }, [isDragging, yAxisScale, scrollLeft]);

    // Keep mouse handlers for dragging
    const handleMouseDown = (event: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart(event.clientX);
        setScrollStart(scrollLeft);

        // Add cursor style to indicate dragging state
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    const handleContainerMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            // Handle horizontal movement
            const deltaX = event.clientX - dragStart;
            const newScrollLeft = Math.max(0, scrollStart - deltaX);
            setScrollLeft(newScrollLeft);
        }
    };

    // Optimize visible data calculation
    const visibleData = useMemo(() => {
        if (chartWidth === 0) return [];
        const pixelsPerPoint = chartWidth / VISIBLE_POINTS;
        const startIndex = Math.floor(scrollLeft / pixelsPerPoint);
        const endIndex = Math.ceil((scrollLeft + chartWidth) / pixelsPerPoint);
        return priceBufferRef.current.getVisiblePoints(startIndex, endIndex);
    }, [scrollLeft, chartWidth]);

    // Format the candle data
    const formattedCandles = useMemo(() => {
        return candles.map((candle) => ({
            ...candle,
            timestamp: new Date(candle.timestamp).getTime(),
            close: Number(candle.close),
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
        }));
    }, [candles]);

    const { minY, maxY, yScale } = useMemo(() => {
        if (!formattedCandles.length) {
            return { minY: 0, maxY: 0, yScale: 1 };
        }

        // Calculate visible range based on scroll position
        const visibleCount = Math.min(formattedCandles.length, VISIBLE_POINTS);
        const startIndex = Math.floor((scrollLeft / chartWidth) * formattedCandles.length);
        const endIndex = Math.min(startIndex + visibleCount, formattedCandles.length);
        const visibleCandles = formattedCandles.slice(startIndex, endIndex);

        // Calculate price range for visible candles only
        const highs = visibleCandles.map((c) => Number(c.high));
        const lows = visibleCandles.map((c) => Number(c.low));
        const minY = Math.min(...lows);
        const maxY = Math.max(...highs);
        const padding = (maxY - minY) * 0.1;

        return {
            minY: minY - padding,
            maxY: maxY + padding,
            yScale: chartHeight / (maxY + padding - (minY - padding) || 1),
        };
    }, [formattedCandles, chartWidth, chartHeight, scrollLeft]);

    // Update the scaledData calculation to use the same scaling
    const scaledData = useMemo(() => {
        if (!formattedCandles.length) return [];

        // Calculate visible range based on scroll position
        const visibleCount = Math.min(formattedCandles.length, VISIBLE_POINTS);
        const startIndex = Math.floor((scrollLeft / chartWidth) * formattedCandles.length);
        const endIndex = Math.min(startIndex + visibleCount, formattedCandles.length);
        const visibleCandles = formattedCandles.slice(startIndex, endIndex);

        const priceRange = maxY - minY;
        const xScaleFactor = chartWidth / (visibleCount - 1);

        const scaleY = (price: number) => {
            const normalized = (price - minY) / priceRange;
            return chartHeight * (1 - normalized / yAxisScale);
        };

        return visibleCandles.map((candle, index) => {
            const scaledX = index * xScaleFactor;

            return {
                ...candle,
                price: Number(candle.close),
                timestamp: candle.timestamp,
                scaledX,
                scaledY: scaleY(candle.close),
                scaledOpen: scaleY(candle.open),
                scaledHigh: scaleY(candle.high),
                scaledLow: scaleY(candle.low),
                scaledClose: scaleY(candle.close),
            };
        });
    }, [formattedCandles, chartWidth, chartHeight, scrollLeft, minY, maxY, yAxisScale]);

    const pathData = useMemo(() => {
        return PathGenerator.generate(scaledData, chartWidth, chartHeight);
    }, [scaledData, chartWidth, chartHeight]);

    const handleYAxisDrag = useCallback((deltaY: number) => {
        setYAxisScale((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * (1 - deltaY * 0.05))));
    }, []);

    const handleYAxisScale = useCallback((scaleFactor: number) => {
        setYAxisScale((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scaleFactor)));
    }, []);

    const handleSvgMouseMove = useCallback(
        (event: React.MouseEvent<SVGSVGElement>) => {
            if (isDragging) return;

            const svgRect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - svgRect.left - chartPadding.left;

            if (x >= 0 && x <= chartWidth) {
                const xRatio = x / chartWidth;
                const index = Math.floor(xRatio * (scaledData.length - 1));
                if (index >= 0 && index < scaledData.length) {
                    const point = scaledData[index];
                    setHoverInfo({
                        x: point.scaledX,
                        y: point.scaledClose, // Use close price for crosshair
                        price: point.close,
                        time: formatTime(new Date(point.timestamp)),
                        candle: {
                            open: point.open,
                            high: point.high,
                            low: point.low,
                            close: point.close,
                        },
                    });
                }
            } else {
                setHoverInfo(null);
            }
        },
        [isDragging, chartWidth, chartPadding.left, scaledData]
    );

    const handleMouseLeave = useCallback(() => {
        setHoverInfo(null);
    }, []);

    // Replace the ChartLine component with CandleSticks
    const CandleSticks = memo(({ data, width, height }: { data: ChartDataPoint[]; width: number; height: number }) => {
        // Calculate candle width based on visible area
        const candleWidth = Math.max(2, Math.min(20, (width / data.length) * 0.8));
        const halfCandleWidth = candleWidth / 2;

        return (
            <g>
                {data.map((point, i) => {
                    const isGreen = point.close >= point.open;
                    const candleColor = isGreen ? '#fff' : '#eee';

                    // Ensure positive values for rect
                    const bodyTop = Math.min(point.scaledOpen, point.scaledClose);
                    const bodyBottom = Math.max(point.scaledOpen, point.scaledClose);
                    const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                    // Skip rendering if outside visible area
                    if (point.scaledX < -candleWidth || point.scaledX > width + candleWidth) {
                        return null;
                    }

                    return (
                        <g key={i} transform={`translate(${point.scaledX - halfCandleWidth}, 0)`}>
                            {/* Wick */}
                            <line x1={halfCandleWidth} y1={point.scaledHigh} x2={halfCandleWidth} y2={point.scaledLow} stroke={candleColor} strokeWidth='1' />
                            {/* Body */}
                            <rect x={0} y={bodyTop} width={candleWidth} height={bodyHeight} fill={candleColor} />
                        </g>
                    );
                })}
            </g>
        );
    });

    CandleSticks.displayName = 'CandleSticks';

    return (
        <div
            ref={containerRef}
            className={`relative h-full w-full overflow-hidden border-t border-[#222] bg-black ${styles.chartContainer}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleContainerMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ height }}>
            <svg
                width='100%'
                height='100%'
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                preserveAspectRatio='none'
                className='touch-pan-x touch-pan-y'
                onMouseMove={handleSvgMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
                <g transform={`translate(${chartPadding.left},${chartPadding.top})`}>
                    <CandleSticks data={scaledData} width={chartWidth} height={chartHeight} />
                    <XAxis data={scaledData} chartWidth={chartWidth} chartHeight={chartHeight} hoverInfo={hoverInfo} formatTime={formatTime} />
                    <YAxis
                        minY={minY}
                        maxY={maxY}
                        chartHeight={chartHeight}
                        chartWidth={chartWidth}
                        onDrag={handleYAxisDrag}
                        onScale={handleYAxisScale}
                        yAxisScale={animatedScale}
                        hoverInfo={hoverInfo}
                    />
                    {hoverInfo && <HoverInfo x={hoverInfo.x} y={hoverInfo.y} chartHeight={chartHeight} chartWidth={chartWidth} candle={hoverInfo.candle} />}
                </g>
            </svg>
        </div>
    );
};

const XAxis: React.FC<{
    data: ChartDataPoint[];
    chartWidth: number;
    chartHeight: number;
    hoverInfo: HoverInfo | null;
    formatTime: (date: Date) => string;
}> = memo(({ data, chartWidth, chartHeight, hoverInfo, formatTime }) => {
    const intervals = useMemo(() => {
        if (data.length === 0) return [];

        const hourMs = 60 * 60 * 1000; // 1 hour in milliseconds
        const firstTime = new Date(data[0].timestamp);
        // Round to nearest hour
        const startTime = new Date(firstTime).setMinutes(0, 0, 0);
        const endTime = data[data.length - 1].timestamp;
        const result = [];

        for (let time = startTime; time <= endTime; time += hourMs) {
            // Find the closest data point to this hour
            const closestPoint = data.reduce((prev, curr) => (Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time) ? curr : prev));
            result.push(closestPoint);
        }

        // If we have too many points for mobile, reduce them
        const maxPoints = chartWidth < 400 ? 4 : 6;
        if (result.length > maxPoints) {
            const step = Math.ceil(result.length / maxPoints);
            return result.filter((_, i) => i % step === 0);
        }

        return result;
    }, [data, chartWidth]);

    if (data.length === 0) return null;

    return (
        <g className='x-axis' transform={`translate(0, ${chartHeight})`}>
            <line x1={0} y1={0} x2={chartWidth} y2={0} stroke='#777' />
            {intervals.map((point, index) => (
                <g key={`time-${point.timestamp}-${index}`} transform={`translate(${point.scaledX}, 0)`}>
                    <line y2={6} stroke='#777' />
                    <text y={20} textAnchor='middle' fill='#fff' fontSize='12'>
                        {formatTime(new Date(point.timestamp))}
                    </text>
                </g>
            ))}
            {hoverInfo && (
                <g transform={`translate(${hoverInfo.x}, 0)`}>
                    <rect x={-40} y={5} width={80} height={20} fill='#1f2937' rx={4} />
                    <text x={0} y={20} textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
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
    onScale: (scaleFactor: number) => void;
    yAxisScale: number;
    hoverInfo: HoverInfo | null;
}> = memo(({ minY, maxY, chartHeight, chartWidth, onDrag, onScale, yAxisScale, hoverInfo }) => {
    const handleMouseDown = useCallback(
        (event: React.MouseEvent) => {
            const startY = event.clientY;
            const handleMouseMove = (e: MouseEvent) => {
                const deltaY = (e.clientY - startY) / chartHeight;
                onDrag(deltaY);
            };
            const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        },
        [onDrag, chartHeight]
    );

    const handleWheel = useCallback(
        (event: React.WheelEvent) => {
            event.preventDefault();
            const scaleFactor = event.deltaY > 0 ? 1.1 : 0.9;
            onScale(scaleFactor);
        },
        [onScale]
    );

    const priceRange = maxY - minY;

    const scaleY = (price: number) => {
        const normalized = (price - minY) / priceRange;
        return chartHeight * (1 - normalized / yAxisScale);
    };

    // Calculate price levels with more precision
    const numLevels = 8; // Increased number of levels
    const prices = Array.from({ length: numLevels }, (_, i) => {
        const ratio = i / (numLevels - 1);
        return minY + priceRange * ratio;
    });

    return (
        <g
            className='y-axis'
            transform={`translate(${chartWidth}, 0)`}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
            }}>
            <rect x={0} y={0} width={60} height={chartHeight} fill='transparent' cursor='ns-resize' />
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke='#777' />

            {/* Price levels */}
            {prices.map((price, i) => {
                const y = scaleY(price);
                return (
                    <g key={i} transform={`translate(0, ${y})`}>
                        <line x1={0} x2={5} stroke='#777' />
                        <text x={10} y={4} fill='white' fontSize='12' textAnchor='start'>
                            {price.toFixed(5)}
                        </text>
                        <line x1={0} y1={0} x2={-chartWidth} y2={0} stroke='#777' strokeOpacity='0.1' strokeDasharray='4 4' />
                    </g>
                );
            })}

            {/* Hover price */}
            {hoverInfo && (
                <g transform={`translate(0, ${hoverInfo.y})`}>
                    <rect x={3} y={-10} width={65} height={20} fill='#1f2937' rx={4} />
                    <text x={33} y={4} textAnchor='middle' fill='white' fontSize='12' fontWeight='bold'>
                        {hoverInfo.price.toFixed(5)}
                    </text>
                </g>
            )}
        </g>
    );
});
