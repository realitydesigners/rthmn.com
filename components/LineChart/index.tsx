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
  const [yAxisScale, setYAxisScale] = useState(1);

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

  // Y-axis calculations
  const pipSize = 0.01;
  const roundToPip = (value: number) => Math.round(value / pipSize) * pipSize;
  const range = maxY - minY;
  const visibleRange = range / yAxisScale;
  const midPrice = (maxY + minY) / 2;
  const adjustedMinY = midPrice - visibleRange / 2;
  const adjustedMaxY = midPrice + visibleRange / 2;
  const minYRounded = roundToPip(Math.floor(adjustedMinY / pipSize) * pipSize);
  const maxYRounded = roundToPip(Math.ceil(adjustedMaxY / pipSize) * pipSize);
  const baseSteps = 20;
  const steps = Math.max(2, Math.round(baseSteps * yAxisScale));
  const stepSize = (maxYRounded - minYRounded) / steps;

  // X-axis calculations
  const visibleTimeData = timeData.slice(-visibleDataPoints);
  const startTime = new Date(visibleTimeData[0]);
  const endTime = new Date(visibleTimeData[visibleTimeData.length - 1]);
  const intervalMs = 10 * 60 * 1000;
  const intervals = [];
  let currentTime = new Date(
    Math.ceil(startTime.getTime() / intervalMs) * intervalMs
  );
  while (currentTime <= endTime) {
    intervals.push(currentTime.getTime());
    currentTime = new Date(currentTime.getTime() + intervalMs);
  }

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

  const handleYAxisDrag = useCallback((deltaY: number) => {
    setYAxisScale((prev) =>
      Math.max(0.1, Math.min(10, prev * (1 + deltaY * 0.01)))
    );
  }, []);

  const handleYAxisScale = useCallback((scaleFactor: number) => {
    setYAxisScale((prev) => Math.max(0.1, Math.min(10, prev * scaleFactor)));
  }, []);

  const memoizedChartLine = useMemo(
    () => (
      <ChartLine
        closingPrices={closingPrices}
        timeData={timeData}
        minY={minYRounded}
        maxY={maxYRounded}
        width={chartWidth}
        height={chartHeight}
        pair={pair}
        candles={candles}
        visibleDataPoints={visibleDataPoints}
        yAxisScale={yAxisScale}
      />
    ),
    [
      closingPrices,
      timeData,
      minYRounded,
      maxYRounded,
      chartWidth,
      chartHeight,
      pair,
      candles,
      visibleDataPoints,
      yAxisScale
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
            intervals={intervals}
            startTime={startTime}
            endTime={endTime}
            chartWidth={chartWidth}
            chartHeight={chartHeight}
          />
          <g transform={`translate(${chartWidth}, 0)`}>
            <YAxis
              minY={minYRounded}
              maxY={maxYRounded}
              chartHeight={chartHeight}
              chartWidth={chartWidth}
              onDrag={handleYAxisDrag}
              onScale={handleYAxisScale}
              yAxisScale={yAxisScale}
              steps={steps}
              stepSize={stepSize}
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
  yAxisScale: number;
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
    visibleDataPoints,
    yAxisScale
  }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverInfo, setHoverInfo] = useState<{
      price: number;
      time: string;
      x: number;
      y: number;
    } | null>(null);

    const rightMargin = 200;
    const chartWidth = Math.max(width - rightMargin, 0);

    const calculatePathData = useCallback(() => {
      if (closingPrices.length === 0) return '';

      const dataToShow = closingPrices.slice(-visibleDataPoints);
      const xScale = chartWidth / (dataToShow.length - 1);
      const midPrice = (maxY + minY) / 2;
      const yScale = height / yAxisScale / (maxY - minY);

      return dataToShow
        .map((price, index) => {
          const x = index * xScale;
          const y = height / 2 - (price - midPrice) * yScale;
          return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');
    }, [
      closingPrices,
      minY,
      maxY,
      chartWidth,
      height,
      visibleDataPoints,
      yAxisScale
    ]);

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const x = event.clientX - rect.left;

        if (x >= 0 && x <= chartWidth) {
          const xRatio = x / chartWidth;
          const dataIndex = Math.floor(xRatio * (visibleDataPoints - 1));

          if (dataIndex >= 0 && dataIndex < visibleDataPoints) {
            const price =
              closingPrices[
                closingPrices.length - visibleDataPoints + dataIndex
              ];
            const time = new Date(
              timeData[timeData.length - visibleDataPoints + dataIndex]
            );
            const midPrice = (maxY + minY) / 2;
            const yScale = height / yAxisScale / (maxY - minY);
            const yPos = height / 2 - (price - midPrice) * yScale;

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
        chartWidth,
        height,
        visibleDataPoints,
        yAxisScale
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
            <rect x="0" y="0" width={chartWidth} height={height} />
          </clipPath>
        </defs>
        <g clipPath="url(#chart-area)">
          <path d={calculatePathData()} className={styles.chartLine} />
          <rect
            x="0"
            y="0"
            width={chartWidth}
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
                  {hoverInfo.price.toFixed(2)}
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
  intervals: number[];
  startTime: Date;
  endTime: Date;
  chartWidth: number;
  chartHeight: number;
}> = ({ intervals, startTime, endTime, chartWidth, chartHeight }) => {
  return (
    <g className="x-axis" transform={`translate(0, ${chartHeight})`}>
      <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#333" />
      {intervals.map((time) => {
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
  chartHeight: number;
  chartWidth: number;
  onDrag: (deltaY: number) => void;
  onScale: (scaleFactor: number) => void;
  yAxisScale: number;
  steps: number;
  stepSize: number;
}> = ({
  minY,
  maxY,
  chartHeight,
  chartWidth,
  onDrag,
  onScale,
  yAxisScale,
  steps,
  stepSize
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
      const scaleFactor = event.deltaY > 0 ? 1.1 : 0.9;
      onScale(scaleFactor);
    },
    [onScale]
  );

  return (
    <g className="y-axis" onMouseDown={handleMouseDown} onWheel={handleWheel}>
      <rect
        x={-10}
        y={0}
        width={60}
        height={chartHeight}
        fill="transparent"
        cursor="ns-resize"
      />
      <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" />
      {Array.from({ length: steps + 1 }, (_, i) => {
        const value = maxY - i * stepSize;
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
    </g>
  );
};

const PairName: React.FC<{ pair: string }> = ({ pair }) => {
  const pairName = pair.substring(0, 7).replace(/_/g, '');
  return (
    <div className="absolute left-6 top-20 font-mono text-2xl font-bold uppercase text-gray-200">
      {pairName}
    </div>
  );
};
