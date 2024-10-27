'use client';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo
} from 'react';
import styles from './styles.module.css';
import { Candle } from '@/types';

const RthmnVision: React.FC<{
  pair: string;
  candles: Candle[];
}> = ({ pair, candles }) => {
  const [closingPrices, setClosingPrices] = useState<number[]>([]);
  const [timeData, setTimeData] = useState<number[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const point = 0.00001;
  const visibleDataPoints = 200;
  const visibleClosingPrices = closingPrices.slice(-visibleDataPoints);
  const minY = Math.min(...visibleClosingPrices) - point * 50;
  const maxY = Math.max(...visibleClosingPrices) + point * 50;
  const chartPadding = { top: 20, right: 100, bottom: 40, left: 60 };
  const chartWidth = Math.max(
    dimensions.width - chartPadding.left - chartPadding.right,
    0
  );
  const chartHeight = Math.max(
    dimensions.height - chartPadding.top - chartPadding.bottom,
    0
  );

  const PairName: React.FC<{ pair: string }> = ({ pair }) => {
    const pairName = pair.substring(0, 7).replace(/_/g, '');
    return (
      <div className="absolute left-4 top-4 text-2xl font-bold uppercase text-gray-200">
        {pairName}
      </div>
    );
  };

  useEffect(() => {
    if (candles.length === 0) {
      console.error('Invalid candles data:', candles);
      return;
    }

    const newClosingPrices = candles.map((candle) => candle.close);
    const newTimeData = candles.map((candle) =>
      new Date(candle.time).getTime()
    );

    setClosingPrices(newClosingPrices);
    setTimeData(newTimeData);
  }, [candles]);

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

  const memoizedChartLine = useMemo(
    () => (
      <ChartLine
        closingPrices={closingPrices}
        timeData={timeData}
        minY={minY}
        maxY={maxY}
        width={chartWidth}
        height={chartHeight}
        pair={pair}
        candles={candles}
        visibleDataPoints={visibleDataPoints}
      />
    ),
    [
      closingPrices,
      timeData,
      minY,
      maxY,
      chartWidth,
      chartHeight,
      pair,
      candles,
      visibleDataPoints
    ]
  );

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
      >
        <g transform={`translate(${chartPadding.left},${chartPadding.top})`}>
          {memoizedChartLine}
          <XAxis
            timeData={timeData}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
          />
          <g transform={`translate(${chartWidth}, 0)`}>
            <YAxis
              minY={minY}
              maxY={maxY}
              point={point}
              chartHeight={chartHeight}
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default RthmnVision;

const ChartLine: React.FC<{
  closingPrices: number[];
  timeData: number[];
  minY: number;
  maxY: number;
  width: number;
  height: number;
  pair: string;
  candles: Candle[];
  visibleDataPoints: number;
}> = React.memo(
  ({
    closingPrices,
    timeData,
    minY,
    maxY,
    width,
    height,
    pair,
    candles,
    visibleDataPoints
  }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverInfo, setHoverInfo] = useState<{
      price: number;
      time: string;
      x: number;
      y: number;
    } | null>(null);

    const rightMargin = 200;

    const calculatePathData = useCallback(() => {
      if (closingPrices.length === 0) return '';

      const dataToShow = closingPrices.slice(-visibleDataPoints);
      const xScale = (width - rightMargin) / (dataToShow.length - 1);
      const yScale = height / (maxY - minY);

      return dataToShow
        .map((price, index) => {
          const x = index * xScale;
          const y = height - (price - minY) * yScale;
          return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');
    }, [
      closingPrices,
      minY,
      maxY,
      width,
      height,
      visibleDataPoints,
      rightMargin
    ]);

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const x = event.clientX - rect.left;

        if (x >= 0 && x <= width - rightMargin) {
          const xRatio = x / (width - rightMargin);
          const dataIndex = Math.floor(xRatio * (visibleDataPoints - 1));

          if (dataIndex >= 0 && dataIndex < visibleDataPoints) {
            const price =
              closingPrices[
                closingPrices.length - visibleDataPoints + dataIndex
              ];
            const time = new Date(
              timeData[timeData.length - visibleDataPoints + dataIndex]
            );
            const yPos = height - ((price - minY) / (maxY - minY)) * height;

            setHoverInfo({
              price,
              time: time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              x,
              y: yPos
            });
          }
        } else {
          setHoverInfo(null);
        }
      },
      [
        closingPrices,
        timeData,
        minY,
        maxY,
        width,
        height,
        visibleDataPoints,
        rightMargin
      ]
    );

    const handleMouseLeave = () => {
      setHoverInfo(null);
    };

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={styles.chartContainer}
      >
        <defs>
          <clipPath id="chart-area">
            <rect x="0" y="0" width={width - rightMargin} height={height} />
          </clipPath>
        </defs>
        <g clipPath="url(#chart-area)">
          <path d={calculatePathData()} className={styles.chartLine} />
          <rect
            x="0"
            y="0"
            width={width - rightMargin}
            height={height}
            fill="transparent"
            pointerEvents="all"
          />
          {hoverInfo && (
            <>
              <line
                x1={hoverInfo.x}
                y1={0}
                x2={hoverInfo.x}
                y2={height}
                className={styles.hoverLine}
              />
              <circle
                cx={hoverInfo.x}
                cy={hoverInfo.y}
                r="4"
                className={styles.hoverDot}
              />
              <foreignObject x={hoverInfo.x + 5} y={10} width="80" height="20">
                <div className={styles.priceLabel}>
                  {hoverInfo.price.toFixed(5)}
                </div>
              </foreignObject>
              <foreignObject
                x={hoverInfo.x + 5}
                y={height - 30}
                width="60"
                height="20"
              >
                <div className={styles.timeLabel}>{hoverInfo.time}</div>
              </foreignObject>
            </>
          )}
        </g>
      </svg>
    );
  }
);

export const XAxis: React.FC<{
  timeData: number[];
  chartWidth: number;
  chartHeight: number;
}> = ({ timeData, chartWidth, chartHeight }) => {
  const visibleTimeData = timeData.slice(-200); // Show last 200 data points
  const startTime = new Date(visibleTimeData[0]);
  const endTime = new Date(visibleTimeData[visibleTimeData.length - 1]);

  // Calculate 10-minute intervals
  const intervalMs = 10 * 60 * 1000; // 10 minutes in milliseconds
  const intervals = [];
  let currentTime = new Date(
    Math.ceil(startTime.getTime() / intervalMs) * intervalMs
  );

  while (currentTime <= endTime) {
    intervals.push(currentTime.getTime());
    currentTime = new Date(currentTime.getTime() + intervalMs);
  }

  return (
    <g className="x-axis" transform={`translate(0, ${chartHeight})`}>
      <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#333" />
      {intervals.map((time, i) => {
        const xPosition =
          ((time - startTime.getTime()) /
            (endTime.getTime() - startTime.getTime())) *
          chartWidth;
        return (
          <g key={time} transform={`translate(${xPosition}, 0)`}>
            <line y2={6} stroke="#333" />
            <text y={20} textAnchor="middle" fill="#fff" fontSize="12">
              {new Date(time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
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
    </g>
  );
};

export const YAxis: React.FC<{
  minY: number;
  maxY: number;
  point: number;
  chartHeight: number;
}> = ({ minY, maxY, point, chartHeight }) => {
  const steps = 5;
  const range = maxY - minY;
  const stepSize = range / steps;

  return (
    <g className="y-axis">
      <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" />
      {Array.from({ length: steps + 1 }, (_, i) => {
        const value = maxY - i * stepSize;
        return (
          <g key={i} transform={`translate(0, ${(i / steps) * chartHeight})`}>
            <line x2={6} stroke="#333" />
            <text x={10} y={4} textAnchor="start" fill="#fff" fontSize="12">
              {value.toFixed(point < 0.01 ? 5 : 2)}
            </text>
          </g>
        );
      })}
    </g>
  );
};
