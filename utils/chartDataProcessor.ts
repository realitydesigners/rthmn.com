import type { ChartDataPoint } from "@/components/Charts/CandleChart";
import { INSTRUMENTS } from "@/utils/instruments";

export interface ProcessedChartData {
  processedCandles: ChartDataPoint[];
  initialVisibleData: ChartDataPoint[];
}

export interface LiveCandleUpdate {
  timestamp: number;
  price: number;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

function createEmptyCandle(timestamp: number, price: number): ChartDataPoint {
  return {
    timestamp,
    open: price,
    high: price,
    low: price,
    close: price,
    volume: 0,
    scaledX: 0,
    scaledY: 0,
    scaledOpen: 0,
    scaledHigh: 0,
    scaledLow: 0,
    scaledClose: 0,
  };
}

export function processLiveCandleUpdate(
  currentCandles: ChartDataPoint[],
  update: LiveCandleUpdate,
  currentCandleRef: { current: ChartDataPoint | null }
): ChartDataPoint[] {
  if (!currentCandles.length) return currentCandles;

  const newCandles = [...currentCandles];
  const now = new Date(update.timestamp);
  const currentMinute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  ).getTime();
  const lastHistoricalCandle = newCandles[newCandles.length - 1];

  // If we don't have a current candle, check the gap from historical data
  if (!currentCandleRef.current) {
    // Calculate gap between last historical candle and current time
    const minutesDiff = Math.floor(
      (currentMinute - lastHistoricalCandle.timestamp) / (60 * 1000)
    );
    const lastClose = lastHistoricalCandle.close;

    // If the gap is 1 minute or less, update the last historical candle
    if (minutesDiff <= 1) {
      // Update the last historical candle with current data
      lastHistoricalCandle.high = Math.max(
        lastHistoricalCandle.high,
        update.price
      );
      lastHistoricalCandle.low = Math.min(
        lastHistoricalCandle.low,
        update.price
      );
      lastHistoricalCandle.close = update.price;
      currentCandleRef.current = lastHistoricalCandle;
      newCandles[newCandles.length - 1] = lastHistoricalCandle;
      return newCandles;
    }

    // If there's a gap, fill it
    for (let i = 1; i < minutesDiff; i++) {
      const gapCandleTime = lastHistoricalCandle.timestamp + i * 60 * 1000;
      const gapCandle: ChartDataPoint = {
        timestamp: gapCandleTime,
        open: lastClose,
        high: lastClose,
        low: lastClose,
        close: lastClose,
        volume: 0,
        scaledX: 0,
        scaledY: 0,
        scaledOpen: 0,
        scaledHigh: 0,
        scaledLow: 0,
        scaledClose: 0,
      };
      newCandles.push(gapCandle);
    }

    // Create the current minute's candle
    const newCandle: ChartDataPoint = {
      timestamp: currentMinute,
      open: lastClose, // Open at the last historical candle's close price
      high: update.price,
      low: update.price,
      close: update.price,
      volume: 0,
      scaledX: 0,
      scaledY: 0,
      scaledOpen: 0,
      scaledHigh: 0,
      scaledLow: 0,
      scaledClose: 0,
    };
    currentCandleRef.current = newCandle;
    return [...newCandles, newCandle];
  }

  // If current candle is from a different minute
  if (currentCandleRef.current.timestamp !== currentMinute) {
    const lastCandleTime = currentCandleRef.current.timestamp;
    const minutesDiff = Math.floor(
      (currentMinute - lastCandleTime) / (60 * 1000)
    );
    const lastClose = currentCandleRef.current.close;

    if (minutesDiff > 1) {
      // Create gap candles for missing minutes
      for (let i = 1; i < minutesDiff; i++) {
        const gapCandleTime = lastCandleTime + i * 60 * 1000;
        const gapCandle: ChartDataPoint = {
          timestamp: gapCandleTime,
          open: lastClose,
          high: lastClose,
          low: lastClose,
          close: lastClose,
          volume: 0,
          scaledX: 0,
          scaledY: 0,
          scaledOpen: 0,
          scaledHigh: 0,
          scaledLow: 0,
          scaledClose: 0,
        };
        newCandles.push(gapCandle);
      }
    }

    // Create new candle for current minute
    const newCandle: ChartDataPoint = {
      timestamp: currentMinute,
      open: lastClose,
      high: update.price,
      low: update.price,
      close: update.price,
      volume: 0,
      scaledX: 0,
      scaledY: 0,
      scaledOpen: 0,
      scaledHigh: 0,
      scaledLow: 0,
      scaledClose: 0,
    };
    currentCandleRef.current = newCandle;
    return [...newCandles, newCandle];
  }

  // Update the current candle
  const currentCandle = currentCandleRef.current;
  currentCandle.high = Math.max(currentCandle.high, update.price);
  currentCandle.low = Math.min(currentCandle.low, update.price);
  currentCandle.close = update.price;

  // Update the last candle in the array
  newCandles[newCandles.length - 1] = currentCandle;
  return newCandles;
}

export function processInitialChartData(
  rawCandles: any[],
  initialVisiblePoints = 1000,
  chartWidth?: number, // Optional for SSR
  chartHeight?: number, // Optional for SSR
  pair?: string // For instrument-specific scaling
): ProcessedChartData {
  if (!rawCandles.length) {
    return {
      processedCandles: [],
      initialVisibleData: [],
    };
  }

  // 1. Process candles with proper timestamp handling
  const processedCandles = rawCandles.map((candle) => ({
    timestamp:
      typeof candle.timestamp === "string"
        ? new Date(candle.timestamp).getTime()
        : Number(candle.timestamp),
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
    volume: Number(candle.volume || 0),
    scaledX: 0,
    scaledY: 0,
    scaledOpen: 0,
    scaledHigh: 0,
    scaledLow: 0,
    scaledClose: 0,
  }));

  // Sort candles by timestamp - charts expect chronological order
  processedCandles.sort((a, b) => a.timestamp - b.timestamp);

  // Remove duplicates based on timestamp to prevent React key conflicts
  const uniqueCandles = processedCandles.filter(
    (candle, index, array) =>
      index === 0 || candle.timestamp !== array[index - 1].timestamp
  );

  console.log("🔍 Chart Data Processing Debug:", {
    rawCandlesCount: rawCandles.length,
    processedCandlesCount: processedCandles.length,
    uniqueCandlesCount: uniqueCandles.length,
    duplicatesRemoved: processedCandles.length - uniqueCandles.length,
    firstRawCandle: rawCandles[0],
    firstProcessedCandle: processedCandles[0],
    lastProcessedCandle: processedCandles[processedCandles.length - 1],
    isChronological:
      uniqueCandles.length > 1
        ? uniqueCandles[0].timestamp <
          uniqueCandles[uniqueCandles.length - 1].timestamp
        : true,
  });

  // 2. Calculate initial visible range
  const visibleCount = Math.min(uniqueCandles.length, initialVisiblePoints);
  const visibleCandles = uniqueCandles.slice(0, visibleCount);

  // 3. Calculate initial scaled data (only if dimensions are provided)
  let initialVisibleData: ChartDataPoint[];

  if (chartWidth && chartHeight) {
    // Calculate initial price range
    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = Number.NEGATIVE_INFINITY;

    for (const candle of visibleCandles) {
      minPrice = Math.min(minPrice, candle.low);
      maxPrice = Math.max(maxPrice, candle.high);
    }

    // Get instrument configuration for proper scaling
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

    // Ensure minimum range based on instrument precision for proper candle visibility
    const minRangeMultiplier = 200; // Show at least 200 pips worth of range
    const minRange = instrumentPoint * minRangeMultiplier;
    const baseRange = maxPrice - minPrice;
    const adjustedRange = Math.max(baseRange, minRange);

    const padding = adjustedRange * 0.2;
    const priceRange = adjustedRange + padding * 2;
    const centerPrice = (minPrice + maxPrice) / 2;
    const paddedMin = centerPrice - priceRange / 2;
    const paddedMax = centerPrice + priceRange / 2;

    const xScaleFactor = chartWidth / (visibleCount - 1);

    // Calculate initial scaled data
    initialVisibleData = visibleCandles.map((candle, index) => {
      const scaledX = index * xScaleFactor;
      const scaleY = (price: number) => {
        const normalized = (price - paddedMin) / (paddedMax - paddedMin);
        return chartHeight * (1 - normalized);
      };

      return {
        ...candle,
        scaledX,
        scaledY: scaleY(candle.close),
        scaledOpen: scaleY(candle.open),
        scaledHigh: scaleY(candle.high),
        scaledLow: scaleY(candle.low),
        scaledClose: scaleY(candle.close),
      };
    });
  } else {
    // Return unscaled data - let chart component handle all scaling
    initialVisibleData = visibleCandles.map((candle) => ({
      ...candle,
      scaledX: 0,
      scaledY: 0,
      scaledOpen: 0,
      scaledHigh: 0,
      scaledLow: 0,
      scaledClose: 0,
    }));
  }

  return {
    processedCandles: uniqueCandles,
    initialVisibleData,
  };
}
