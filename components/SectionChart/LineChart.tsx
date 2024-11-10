'use client';
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import { Candle } from '@/types/types';
import { formatTime } from '@/utils/dateUtils';

// Add these constants at the top with other constants
const VISIBLE_POINTS = 100;
const MIN_ZOOM = 0.1; // Most zoomed out
const MAX_ZOOM = 5; // Most zoomed in

interface ChartDataPoint {
  price: number;
  timestamp: number;
  scaledX: number;
  scaledY: number;
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
      path += batch
        .map(
          (p, index) =>
            `${index === 0 && i === 0 ? 'M' : 'L'} ${p.scaledX} ${p.scaledY}`
        )
        .join(' ');
    }
    return path;
  }
};

// Add this memoized function at the top level
const processCandles = (candles: Candle[], buffer: OptimizedPriceBuffer) => {
  buffer.clear();
  candles.forEach((candle) => {
    buffer.push({
      price: candle.close,
      timestamp: new Date(candle.time).getTime(),
      scaledX: 0,
      scaledY: 0
    });
  });
};

// Add HoverInfo component definition at the top with other components
interface HoverInfoProps {
  x: number;
  y: number;
  chartHeight: number;
  chartWidth: number;
}

const ensureNumber = (value: number) => {
  return isNaN(value) || !isFinite(value) ? 0 : value;
};

const HoverInfo: React.FC<HoverInfoProps> = ({
  x,
  y,
  chartHeight,
  chartWidth
}) => {
  const safeX = ensureNumber(x);
  const safeY = ensureNumber(y);

  if (isNaN(safeX) || isNaN(safeY)) return null;

  return (
    <g>
      <line
        x1={safeX}
        y1={0}
        x2={safeX}
        y2={chartHeight}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="1"
      />
      <line
        x1={0}
        y1={safeY}
        x2={chartWidth}
        y2={safeY}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="1"
      />
      <circle cx={safeX} cy={safeY} r="4" fill="white" />
    </g>
  );
};

interface ResponsiveSettings {
  yAxisLabelWidth: number;
  fontSize: string;
  tickCount: number;
  xAxisSkip: number;
}

const XAxis: React.FC<{
  data: ChartDataPoint[];
  chartWidth: number;
  chartHeight: number;
  hoverInfo: { time: string; x: number } | null;
  formatTime: (date: Date) => string;
  responsiveSettings: ResponsiveSettings;
  dimensions: { width: number; height: number };
}> = React.memo(
  ({
    data,
    chartWidth,
    chartHeight,
    hoverInfo,
    formatTime,
    responsiveSettings,
    dimensions
  }) => {
    const intervals = useMemo(() => {
      if (data.length === 0) return [];

      const intervalMs = 60 * 60 * 1000; // 1 hour
      const startTime = Math.floor(data[0].timestamp / intervalMs) * intervalMs;
      const endTime = data[data.length - 1].timestamp;
      const result = [];

      for (let time = startTime; time <= endTime; time += intervalMs) {
        const closestPoint = data.reduce((prev, curr) =>
          Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time)
            ? curr
            : prev
        );
        result.push(closestPoint);
      }

      // Filter labels based on screen size
      return result.filter(
        (_, index) => index % responsiveSettings.xAxisSkip === 0
      );
    }, [data, responsiveSettings.xAxisSkip]);

    return (
      <g className="x-axis" transform={`translate(0, ${chartHeight})`}>
        <line
          x1={0}
          y1={0}
          x2={chartWidth}
          y2={0}
          stroke="rgba(255, 255, 255, 0.5)"
        />
        {intervals.map((point, index) => {
          const xPosition =
            ((point.timestamp - data[0].timestamp) /
              (data[data.length - 1].timestamp - data[0].timestamp)) *
            chartWidth;

          return (
            <g
              key={`time-${point.timestamp}-${index}`}
              transform={`translate(${xPosition}, 0)`}
            >
              <text
                y={20}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize={responsiveSettings.fontSize}
                transform={
                  dimensions.width < 768 ? 'rotate(-45) translate(-20, 0)' : ''
                }
              >
                {formatTime(new Date(point.timestamp))}
              </text>
            </g>
          );
        })}
      </g>
    );
  }
);

const YAxis: React.FC<{
  minY: number;
  maxY: number;
  chartHeight: number;
  chartWidth: number;
  onDrag: (deltaY: number) => void;
  onScale: (scaleFactor: number) => void;
  yAxisScale: number;
  hoverInfo: { price: number; y: number } | null;
  responsiveSettings: ResponsiveSettings;
}> = React.memo(
  ({
    minY,
    maxY,
    chartHeight,
    chartWidth,
    yAxisScale,
    hoverInfo,
    responsiveSettings
  }) => {
    const visibleRange = maxY - minY;
    const midPrice = (maxY + minY) / 2;
    const scaledVisibleRange = visibleRange * yAxisScale;
    const visibleMin = midPrice - scaledVisibleRange / 2;
    const visibleMax = midPrice + scaledVisibleRange / 2;
    const steps = Math.min(
      responsiveSettings.tickCount,
      Math.round(10 * yAxisScale)
    );

    return (
      <g className="y-axis" transform={`translate(${chartWidth}, 0)`}>
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={chartHeight}
          stroke="rgba(255, 255, 255, 0.5)"
        />
        {Array.from({ length: steps + 1 }, (_, i) => {
          const value = visibleMax - (i * scaledVisibleRange) / steps;
          const y = (i / steps) * chartHeight;
          return (
            <g key={i} transform={`translate(0, ${y})`}>
              <text
                x={10}
                y={4}
                textAnchor="start"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize={responsiveSettings.fontSize}
                className="font-mono"
              >
                {value.toFixed(5)}
              </text>
            </g>
          );
        })}
        {hoverInfo && (
          <g transform={`translate(0, ${hoverInfo.y})`}>
            <rect
              x={3}
              y={-10}
              width={responsiveSettings.yAxisLabelWidth}
              height={20}
              fill="rgba(255, 255, 255, 0.5)"
              rx={4}
            />
            <text
              x={responsiveSettings.yAxisLabelWidth / 2}
              y={4}
              textAnchor="middle"
              fill="white"
              fontSize={responsiveSettings.fontSize}
              fontWeight="bold"
              className="font-mono"
            >
              {hoverInfo.price.toFixed(5)}
            </text>
          </g>
        )}
      </g>
    );
  }
);

export const LineChart: React.FC<{
  pair: string;
  candles: Candle[];
}> = ({ pair, candles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [yAxisScale, setYAxisScale] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    price: number;
    time: string;
  } | null>(null);

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

  const chartPadding = {
    top: 20,
    right: 80,
    bottom: 40,
    left: 20
  };

  const chartWidth = dimensions.width - chartPadding.left - chartPadding.right;
  const chartHeight =
    dimensions.height - chartPadding.top - chartPadding.bottom;

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
          setYAxisScale((prev) =>
            Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale))
          );
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

  const handleContainerMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
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

  const { minY, maxY, yScale } = useMemo(() => {
    const prices = visibleData.map((d) => d.price);
    const minY = Math.min(...prices);
    const maxY = Math.max(...prices);
    const yScale = chartHeight / (maxY - minY);
    return { minY, maxY, yScale };
  }, [visibleData, chartHeight]);

  // Update the scaledData calculation
  const scaledData = useMemo(() => {
    const midPrice = (maxY + minY) / 2;
    return visibleData.map((point, index) => {
      const scaledX = ensureNumber(
        index * (chartWidth / (visibleData.length - 1))
      );
      const scaledY = ensureNumber(
        chartHeight / 2 - ((point.price - midPrice) * yScale) / animatedScale
      );
      return {
        ...point,
        scaledX,
        scaledY
      };
    });
  }, [visibleData, chartWidth, chartHeight, minY, maxY, yScale, animatedScale]);

  const pathData = useMemo(() => {
    return PathGenerator.generate(scaledData, chartWidth, chartHeight);
  }, [scaledData, chartWidth, chartHeight]);

  const handleYAxisDrag = useCallback((deltaY: number) => {
    setYAxisScale((prev) =>
      Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * (1 - deltaY * 0.05)))
    );
  }, []);

  const handleYAxisScale = useCallback((scaleFactor: number) => {
    setYAxisScale((prev) =>
      Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scaleFactor))
    );
  }, []);

  const handleSvgMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - svgRect.left - chartPadding.left;

    if (x >= 0 && x <= chartWidth) {
      const xRatio = x / chartWidth;
      const index = Math.floor(xRatio * (scaledData.length - 1));
      if (index >= 0 && index < scaledData.length) {
        const point = scaledData[index];
        setHoverInfo({
          x: point.scaledX,
          y: point.scaledY,
          price: point.price,
          time: formatTime(new Date(point.timestamp))
        });
      }
    } else {
      setHoverInfo(null);
    }
  };

  const handleMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
        onMouseMove={handleSvgMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${chartPadding.left},${chartPadding.top})`}>
          <ChartLine
            pathData={pathData}
            width={chartWidth}
            height={chartHeight}
            yAxisScale={animatedScale}
          />
          <XAxis
            data={scaledData}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
            hoverInfo={hoverInfo}
            formatTime={formatTime}
            responsiveSettings={responsiveSettings}
            dimensions={dimensions}
          />
          <YAxis
            minY={minY}
            maxY={maxY}
            chartHeight={chartHeight}
            chartWidth={chartWidth}
            onDrag={handleYAxisDrag}
            onScale={handleYAxisScale}
            yAxisScale={animatedScale}
            hoverInfo={hoverInfo}
            responsiveSettings={responsiveSettings}
          />
          {hoverInfo && (
            <HoverInfo
              x={hoverInfo.x}
              y={hoverInfo.y}
              chartHeight={chartHeight}
              chartWidth={chartWidth}
            />
          )}
        </g>
      </svg>
    </div>
  );
};

const ChartLine: React.FC<{
  pathData: string;
  width: number;
  height: number;
  yAxisScale: number;
}> = React.memo(({ pathData, width, height }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.setAttribute('d', pathData);
    }
  }, [pathData]);

  return <path ref={pathRef} stroke="white" strokeWidth="1.5" fill="none" />;
});
