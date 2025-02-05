import { ChartDataPoint } from '@/app/(user)/_components/CandleChart';

export interface ProcessedChartData {
    processedCandles: ChartDataPoint[];
    initialVisibleData: ChartDataPoint[];
}

export function processInitialChartData(
    rawCandles: any[],
    initialVisiblePoints: number = 1000,
    chartWidth: number = 1000, // Default width for SSR
    chartHeight: number = 500 // Default height for SSR
): ProcessedChartData {
    if (!rawCandles.length) {
        return {
            processedCandles: [],
            initialVisibleData: [],
        };
    }

    // 1. Pre-process all candles once (this can be done on server)
    const processedCandles = rawCandles.map((candle) => ({
        timestamp: typeof candle.timestamp === 'string' ? new Date(candle.timestamp).getTime() : candle.timestamp,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume),
        scaledX: 0,
        scaledY: 0,
        scaledOpen: 0,
        scaledHigh: 0,
        scaledLow: 0,
        scaledClose: 0,
    }));

    // 2. Calculate initial visible range
    const visibleCount = Math.min(processedCandles.length, initialVisiblePoints);
    const visibleCandles = processedCandles.slice(0, visibleCount);

    // 3. Calculate initial price range
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const candle of visibleCandles) {
        minPrice = Math.min(minPrice, candle.low);
        maxPrice = Math.max(maxPrice, candle.high);
    }

    const padding = (maxPrice - minPrice) * 0.2;
    const priceRange = maxPrice + padding - (minPrice - padding);
    const xScaleFactor = chartWidth / (visibleCount - 1);

    // 4. Calculate initial scaled data
    const initialVisibleData = visibleCandles.map((candle, index) => {
        const scaledX = index * xScaleFactor;
        const scaleY = (price: number) => {
            const normalized = (price - (minPrice - padding)) / priceRange;
            return chartHeight * (1 - normalized); // Initial scale is 1
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

    return {
        processedCandles,
        initialVisibleData,
    };
}
