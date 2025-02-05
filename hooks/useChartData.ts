import { useMemo } from 'react';
import { ChartDataPoint } from '@/app/(user)/_components/CandleChart';

interface ChartDataResult {
    visibleData: ChartDataPoint[];
    minY: number;
    maxY: number;
}

export const useChartData = (data: ChartDataPoint[], scrollLeft: number, chartWidth: number, chartHeight: number, yAxisScale: number, visiblePoints: number): ChartDataResult => {
    return useMemo(() => {
        if (!data.length || !chartWidth || !chartHeight) {
            return { visibleData: [], minY: 0, maxY: 0 };
        }

        const pointWidth = chartWidth / visiblePoints;
        const RIGHT_MARGIN = chartWidth * 0.5; // Add 50% of chart width as right margin
        const totalWidth = chartWidth + RIGHT_MARGIN;
        const startIndex = Math.max(0, Math.floor(scrollLeft / pointWidth));
        const endIndex = Math.min(data.length, Math.ceil((scrollLeft + totalWidth) / pointWidth));
        const visibleData = data.slice(startIndex, endIndex);

        if (!visibleData.length) {
            return { visibleData: [], minY: 0, maxY: 0 };
        }

        // Find min/max prices in visible range
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        visibleData.forEach((point) => {
            minPrice = Math.min(minPrice, point.low);
            maxPrice = Math.max(maxPrice, point.high);
        });

        // Add padding to price range
        const priceRange = maxPrice - minPrice;
        const padding = priceRange * 0.1; // 10% padding
        let paddedMin = minPrice - padding;
        let paddedMax = maxPrice + padding;

        // Apply Y-axis scaling
        const midPrice = (paddedMax + paddedMin) / 2;
        const scaledRange = (paddedMax - paddedMin) / yAxisScale;
        paddedMin = midPrice - scaledRange / 2;
        paddedMax = midPrice + scaledRange / 2;

        // Scale the data points
        const scaledData = visibleData.map((point, i) => {
            const scaledX = i * pointWidth;
            const scaleY = (price: number) => chartHeight - ((price - paddedMin) / (paddedMax - paddedMin)) * chartHeight;

            return {
                ...point,
                scaledX,
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
