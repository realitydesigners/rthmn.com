'use client';
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import styles from './styles.module.css';
import { Candle } from '@/types';

const VISIBLE_POINTS = 500;

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

const useAnimatedScale = (scale: number) => {
  const [currentScale, setCurrentScale] = useState(scale);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      const delta = (scale - currentScale) * 0.1;
      if (Math.abs(delta) < 0.001) {
        setCurrentScale(scale);
        return;
      }

      setCurrentScale((prev) => prev + delta);
      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [scale, currentScale]);

  return currentScale;
};

interface HoverInfoProps {
  x: number;
  y: number;
  chartHeight: number;
  chartWidth: number;
}

const HoverInfo: React.FC<HoverInfoProps> = ({
  x,
  y,
  chartHeight,
  chartWidth
}) => (
  <g>
    <line
      x1={x}
      y1={0}
      x2={x}
      y2={chartHeight}
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1"
    />
    <line
      x1={0}
      y1={y}
      x2={chartWidth}
      y2={y}
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1"
    />
    <circle cx={x} cy={y} r="4" fill="white" />
  </g>
);

const RthmnVision: React.FC<{
  pair: string;
  candles: Candle[];
}> = ({ pair, candles }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [yAxisScale, setYAxisScale] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const priceBufferRef = useRef(new OptimizedPriceBuffer(1000));
  const animatedScale = useAnimatedScale(yAxisScale);

  const chartPadding = { top: 20, right: 60, bottom: 30, left: 10 };
  const chartWidth = dimensions.width - chartPadding.left - chartPadding.right;
  const chartHeight =
    dimensions.height - chartPadding.top - chartPadding.bottom;

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    price: number;
    time: string;
  } | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    priceBufferRef.current.clear();
    candles.forEach((candle) => {
      priceBufferRef.current.push({
        price: candle.close,
        timestamp: new Date(candle.time).getTime(),
        scaledX: 0,
        scaledY: 0
      });
    });
  }, [candles]);

  const visibleData = useMemo(() => {
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

  const scaledData = useMemo(() => {
    const midPrice = (maxY + minY) / 2;
    return visibleData.map((point, index) => ({
      ...point,
      scaledX: index * (chartWidth / (visibleData.length - 1)),
      scaledY:
        chartHeight / 2 - ((point.price - midPrice) * yScale) / animatedScale
    }));
  }, [visibleData, chartWidth, chartHeight, minY, maxY, yScale, animatedScale]);

  const pathData = useMemo(() => {
    return PathGenerator.generate(scaledData, chartWidth, chartHeight);
  }, [scaledData, chartWidth, chartHeight]);

  const handleYAxisDrag = useCallback((deltaY: number) => {
    setYAxisScale((prev) =>
      Math.max(0.1, Math.min(10, prev * (1 - deltaY * 0.01)))
    );
  }, []);

  const handleYAxisScale = useCallback((scaleFactor: number) => {
    setYAxisScale((prev) => Math.max(0.1, Math.min(10, prev * scaleFactor)));
  }, []);

  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
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
            time: formatTime(point.timestamp)
          });
        }
      } else {
        setHoverInfo(null);
      }
    },
    [scaledData, chartWidth, chartPadding.left, formatTime]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden border border-[#181818] bg-black"
    >
      <PairName pair={pair} />
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <g transform={`translate(${chartPadding.left},${chartPadding.top})`}>
          <ChartLine
            pathData={pathData}
            width={chartWidth}
            height={chartHeight}
          />
          <XAxis
            data={scaledData}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
            hoverInfo={hoverInfo}
            formatTime={formatTime}
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
}> = React.memo(({ pathData, width, height }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.setAttribute('d', pathData);
    }
  }, [pathData]);

  return (
    <path
      ref={pathRef}
      stroke="white"
      strokeWidth="1.5"
      fill="none"
      className={styles.chartLine}
    />
  );
});

const XAxis: React.FC<{
  data: ChartDataPoint[];
  chartWidth: number;
  chartHeight: number;
  hoverInfo: { time: string; x: number } | null;
  formatTime: (timestamp: number) => string;
}> = React.memo(({ data, chartWidth, chartHeight, hoverInfo, formatTime }) => {
  const intervals = useMemo(() => {
    if (data.length === 0) return [];

    const intervalMs = 10 * 60 * 1000; // 10 minutes
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

    return result;
  }, [data]);

  if (data.length === 0) {
    return null;
  }

  return (
    <g className="x-axis" transform={`translate(0, ${chartHeight})`}>
      <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#333" />
      {intervals.map((point) => {
        const xPosition =
          ((point.timestamp - data[0].timestamp) /
            (data[data.length - 1].timestamp - data[0].timestamp)) *
          chartWidth;
        return (
          <g key={point.timestamp} transform={`translate(${xPosition}, 0)`}>
            <line y2={6} stroke="#333" />
            <text y={20} textAnchor="middle" fill="#fff" fontSize="12">
              {formatTime(point.timestamp)}
            </text>
            <line
              y1={-chartHeight}
              y2={0}
              stroke="#333"
              strokeOpacity="0.2"
              strokeDasharray="4 4"
            />
          </g>
        );
      })}
      {hoverInfo && (
        <g transform={`translate(${hoverInfo.x}, 0)`}>
          <rect x={-25} y={10} width={50} height={20} fill="#d1d5db" rx={4} />
          <text
            x={0}
            y={24}
            textAnchor="middle"
            fill="#000"
            fontSize="12"
            fontWeight="bold"
          >
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
  hoverInfo: { price: number; y: number } | null;
}> = React.memo(
  ({
    minY,
    maxY,
    chartHeight,
    chartWidth,
    onDrag,
    onScale,
    yAxisScale,
    hoverInfo
  }) => {
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

    const visibleRange = maxY - minY;
    const midPrice = (maxY + minY) / 2;
    const scaledVisibleRange = visibleRange * yAxisScale;
    const visibleMin = midPrice - scaledVisibleRange / 2;
    const visibleMax = midPrice + scaledVisibleRange / 2;
    const steps = Math.max(2, Math.round(10 * yAxisScale));
    const stepSize = scaledVisibleRange / steps;

    return (
      <g
        className="y-axis"
        transform={`translate(${chartWidth}, 0)`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <rect
          x={0}
          y={0}
          width={60}
          height={chartHeight}
          fill="transparent"
          cursor="ns-resize"
        />
        <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" />
        {Array.from({ length: steps + 1 }, (_, i) => {
          const value = visibleMax - i * stepSize;
          const y = (i / steps) * chartHeight;
          return (
            <g key={i} transform={`translate(0, ${y})`}>
              <line x2={6} stroke="#333" />
              <text x={10} y={4} textAnchor="start" fill="#fff" fontSize="12">
                {value.toFixed(3)}
              </text>
              <line
                x1={0}
                y1={0}
                x2={-chartWidth}
                y2={0}
                stroke="#333"
                strokeOpacity="0.2"
                strokeDasharray="4 4"
              />
            </g>
          );
        })}
        {hoverInfo && (
          <g
            transform={`translate(0, ${
              chartHeight *
              (1 - (hoverInfo.price - visibleMin) / scaledVisibleRange)
            })`}
          >
            <rect x={10} y={-10} width={50} height={20} fill="#d1d5db" rx={4} />
            <text
              x={35}
              y={4}
              textAnchor="middle"
              fill="#000"
              fontSize="12"
              fontWeight="bold"
            >
              {hoverInfo.price.toFixed(3)}
            </text>
          </g>
        )}
      </g>
    );
  }
);

const PairName: React.FC<{ pair: string }> = React.memo(({ pair }) => {
  const pairName = pair.substring(0, 7).replace(/_/g, '');
  return (
    <div className="absolute left-6 top-20 font-mono text-2xl font-bold uppercase text-gray-200">
      {pairName}
    </div>
  );
});

export default RthmnVision;
