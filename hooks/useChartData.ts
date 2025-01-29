import { useMemo } from 'react';
import { ChartDataPoint } from '../components/LineChart';

interface ChartDataResult {
    processedCandles: ChartDataPoint[];
    visibleData: ChartDataPoint[];
    minY: number;
    maxY: number;
}

export const useChartData = (candles: any[], scrollLeft: number, chartWidth: number, chartHeight: number, yAxisScale: number, visiblePoints: number): ChartDataResult => {
    // Single pass data transformation
    return useMemo(() => {
        // Early return if no data
        if (!candles.length || !chartWidth) {
            return {
                processedCandles: [],
                visibleData: [],
                minY: 0,
                maxY: 0,
            };
        }

        // 1. Process all candles once
        const processedCandles = candles.map((candle) => ({
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

        // 2. Calculate visible range in a single pass
        const visibleCount = Math.min(processedCandles.length, visiblePoints);
        const startIndex = Math.floor((scrollLeft / chartWidth) * processedCandles.length);
        const endIndex = Math.min(startIndex + visibleCount, processedCandles.length);
        const visibleCandles = processedCandles.slice(startIndex, endIndex);

        // 3. Calculate price range and scaling in the same pass
        let minPrice = Infinity;
        let maxPrice = -Infinity;

        for (const candle of visibleCandles) {
            minPrice = Math.min(minPrice, candle.low);
            maxPrice = Math.max(maxPrice, candle.high);
        }

        const padding = (maxPrice - minPrice) * 0.2;
        const minY = minPrice - padding;
        const maxY = maxPrice + padding;
        const priceRange = maxY - minY;
        const xScaleFactor = chartWidth / (visibleCount - 1);

        // 4. Scale visible data in a single pass
        const visibleData = visibleCandles.map((candle, index) => {
            const scaledX = index * xScaleFactor;
            const scaleY = (price: number) => {
                const normalized = (price - minY) / priceRange;
                return chartHeight * (1 - normalized / yAxisScale);
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
            visibleData,
            minY,
            maxY,
        };
    }, [candles, scrollLeft, chartWidth, chartHeight, yAxisScale, visiblePoints]);
};
