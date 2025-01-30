import { useMemo } from 'react';
import { ChartDataPoint } from '../components/CandleChart';

interface ChartDataResult {
    visibleData: ChartDataPoint[];
    minY: number;
    maxY: number;
}

export const useChartData = (
    candles: ChartDataPoint[],
    scrollLeft: number,
    chartWidth: number,
    chartHeight: number,
    yAxisScale: number,
    visiblePoints: number
): ChartDataResult => {
    return useMemo(() => {
        if (!chartWidth || !chartHeight || !candles.length) {
            return { visibleData: [], minY: 0, maxY: 0 };
        }

        // Calculate visible range
        const startIndex = Math.min(Math.floor((scrollLeft / chartWidth) * candles.length), candles.length - visiblePoints);
        const endIndex = Math.min(startIndex + visiblePoints, candles.length);
        const visibleCandles = candles.slice(Math.max(0, startIndex), endIndex);

        // Calculate price range
        let minPrice = visibleCandles[0].low;
        let maxPrice = visibleCandles[0].high;
        for (let i = 1; i < visibleCandles.length; i++) {
            minPrice = Math.min(minPrice, visibleCandles[i].low);
            maxPrice = Math.max(maxPrice, visibleCandles[i].high);
        }

        const padding = (maxPrice - minPrice) * 0.1;
        const minY = minPrice - padding;
        const maxY = maxPrice + padding;

        // Scale the data
        const xScale = chartWidth / Math.max(visiblePoints - 1, 1);
        const yScale = chartHeight / ((maxY - minY) * yAxisScale);

        const visibleData = new Array(visibleCandles.length);
        for (let i = 0; i < visibleCandles.length; i++) {
            const candle = visibleCandles[i];
            visibleData[i] = {
                ...candle,
                scaledX: i * xScale,
                scaledY: chartHeight - (candle.close - minY) * yScale,
                scaledOpen: chartHeight - (candle.open - minY) * yScale,
                scaledHigh: chartHeight - (candle.high - minY) * yScale,
                scaledLow: chartHeight - (candle.low - minY) * yScale,
                scaledClose: chartHeight - (candle.close - minY) * yScale,
            };
        }

        return { visibleData, minY, maxY };
    }, [candles, scrollLeft, chartWidth, chartHeight, yAxisScale, visiblePoints]);
};
