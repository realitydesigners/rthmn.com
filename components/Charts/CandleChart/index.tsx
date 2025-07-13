"use client";

import { useColorStore } from "@/stores/colorStore";
import { formatTime } from "@/utils/dateUtils";
import { INSTRUMENTS } from "@/utils/instruments";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { XAxis } from "./Xaxis";
import { YAxis } from "./YAxis";
import BoxLevels from "./indicators/BoxLevels";
import { CandleSticks } from "./CandleSticks";
import { LineChart } from "./LineChart";

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
  visiblePoints: number,
  pair?: string
) => {
  return useMemo(() => {
    if (!data.length || !chartWidth || !chartHeight) {
      return { visibleData: [], minY: 0, maxY: 0 };
    }

    // Show all data instead of limiting by scroll position
    const visibleData = data;

    if (!visibleData.length) {
      return { visibleData: [], minY: 0, maxY: 0 };
    }

    // Find min/max prices in visible range with a small context buffer
    const contextData = visibleData;

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

    // Ensure minimum range based on instrument precision for proper candle visibility
    const minRangeMultiplier = 200; // Show at least 200 pips worth of range

    // Get instrument configuration
    let instrumentPoint = 0.00001; // Default forex point size
    if (pair) {
      const upperPair = pair.toUpperCase();
      // Search in all instrument categories
      for (const category of Object.values(INSTRUMENTS)) {
        if (upperPair in category) {
          instrumentPoint = (category as any)[upperPair].point;
          break;
        }
      }
    }

    const minRange = instrumentPoint * minRangeMultiplier;
    const adjustedRange = Math.max(baseRange, minRange);

    const scaledRange = adjustedRange / yAxisScale;

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
  VISIBLE_POINTS: 5000, // Increased from 1000 to show more candles
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 2,
  PADDING: { top: 20, right: 50, bottom: 30, left: 0 },
  COLORS: {
    AXIS: "#ffffff",
    HOVER_BG: "#fff",
    LAST_PRICE: "#2563eb",
  },
  Y_AXIS: {
    MIN_PRICE_HEIGHT: 50,
    LABEL_WIDTH: 65,
  },
  CANDLES: {
    MIN_WIDTH: 3,
    MAX_WIDTH: 20,
    MIN_SPACING: 2,
    WICK_WIDTH: 2,
    GAP_RATIO: 0.15, // 15% gap between candles (much tighter)
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
    console.warn(
      `No instrument configuration found for ${upperPair}, using default`
    );
    return { point: 0.00001, digits: 5 };
  }, [pair]);
};

const CandleChart = ({
  candles = [],
  initialVisibleData,
  pair,
  chartType = "candle",
  histogramBoxes = [],
  boxOffset = 0,
  visibleBoxesCount = 7,
  boxVisibilityFilter = "all",
  hoveredTimestamp,
  onHoverChange,
  showBoxLevels = true,
  onScroll,
}: {
  candles?: ChartDataPoint[];
  initialVisibleData: ChartDataPoint[];
  pair: string;
  chartType?: "candle" | "line";
  histogramBoxes?: any[];
  boxOffset?: number;
  visibleBoxesCount?: number;
  boxVisibilityFilter?: "all" | "positive" | "negative";
  hoveredTimestamp?: number | null;
  onHoverChange?: (timestamp: number | null) => void;
  showBoxLevels?: boolean;
  onScroll?: (delta: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [yAxisScale, setYAxisScale] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isYAxisDragging, setIsYAxisDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  // Debug CandleChart rendering

  const chartPadding = CHART_CONFIG.PADDING;
  const chartWidth = dimensions.width - chartPadding.left - chartPadding.right;
  const chartHeight =
    dimensions.height - chartPadding.top - chartPadding.bottom;

  // Get chart data directly
  const { visibleData, minY, maxY } = useChartData(
    candles,
    scrollLeft,
    chartWidth,
    chartHeight,
    yAxisScale,
    CHART_CONFIG.VISIBLE_POINTS,
    pair
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

  // Handle horizontal scrolling with mouse wheel
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (!onScroll) return;

      event.preventDefault();

      // Use horizontal scroll or shift+vertical scroll
      const deltaX = event.deltaX || (event.shiftKey ? event.deltaY : 0);

      if (Math.abs(deltaX) > 0) {
        // Normalize scroll delta and apply to scroll offset
        const scrollDelta = Math.sign(deltaX);
        onScroll(scrollDelta);
      }
    },
    [onScroll]
  );

  // Optimize drag handlers with throttling
  const dragHandlers = useMemo(() => {
    let lastDragTime = 0;
    let lastScrollUpdate = 0;
    const THROTTLE_MS = 16; // Approx. 60fps

    const updateScroll = (clientX: number) => {
      const now = Date.now();
      if (now - lastScrollUpdate < THROTTLE_MS || !onScroll) return;

      const deltaX = clientX - dragStart;
      // Convert pixel movement to scroll steps
      const scrollDelta = Math.round(deltaX / 20); // Adjust sensitivity

      if (scrollDelta !== 0) {
        onScroll(-scrollDelta); // Negative for natural scrolling
      }

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
  }, [
    isDragging,
    isYAxisDragging,
    dragStart,
    scrollStart,
    scrollLeft,
    onScroll,
  ]);

  // --- Derive displayed hover info from the hoveredTimestamp prop ---
  const displayedHoverInfo = useMemo(() => {
    if (
      hoveredTimestamp === null ||
      !visibleData ||
      visibleData.length === 0 ||
      !chartHeight ||
      !minY ||
      !maxY
    ) {
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
  }: {
    x: number;
    y: number;
    chartHeight: number;
    chartWidth: number;
  }) => {
    if (!isFinite(x) || !isFinite(y)) return null;

    return (
      <g>
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={chartHeight}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <line
          x1={0}
          y1={y}
          x2={chartWidth}
          y2={y}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
      </g>
    );
  };

  // Debug rendering path

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      onMouseDown={dragHandlers.onMouseDown}
      onMouseMove={dragHandlers.onMouseMove}
      onMouseUp={dragHandlers.onMouseUp}
      onMouseLeave={dragHandlers.onMouseLeave}
      onWheel={handleWheel}
    >
      {(!chartWidth || !chartHeight) && initialVisibleData ? (
        <>
          <svg width="100%" height="100%" className="min-h-[500px]">
            <g
              transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}
            >
              {chartType === "line" ? (
                <LineChart
                  data={initialVisibleData}
                  width={1000}
                  height={500}
                  rightMargin={CHART_CONFIG.CANDLES.RIGHT_MARGIN}
                />
              ) : (
                <CandleSticks
                  data={initialVisibleData}
                  width={1000}
                  height={500}
                  rightMargin={CHART_CONFIG.CANDLES.RIGHT_MARGIN}
                />
              )}
            </g>
          </svg>
        </>
      ) : visibleData.length > 0 ? (
        <>
          <svg
            width="100%"
            height="100%"
            onMouseMove={hoverHandlers.onSvgMouseMove}
            onMouseLeave={hoverHandlers.onMouseLeave}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <g
              transform={`translate(${CHART_CONFIG.PADDING.left},${CHART_CONFIG.PADDING.top})`}
            >
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
                  pair={pair}
                />
              )}
              {chartType === "line" ? (
                <LineChart
                  data={visibleData}
                  width={chartWidth}
                  height={chartHeight}
                  rightMargin={CHART_CONFIG.CANDLES.RIGHT_MARGIN}
                />
              ) : (
                <CandleSticks
                  data={visibleData}
                  width={chartWidth}
                  height={chartHeight}
                  rightMargin={CHART_CONFIG.CANDLES.RIGHT_MARGIN}
                />
              )}
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
        </>
      ) : (
        <>
          <div className="flex h-full items-center justify-center primary-text bg-yellow-800"></div>
        </>
      )}
    </div>
  );
};

export default CandleChart;
