import { useMemo } from 'react';
import { ChartDataPoint } from '@/components/Charts/CandleChart';

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

        // Calculate how many points can fit in the visible area
        const pointWidth = Math.max(2, chartWidth / visiblePoints); // Ensure minimum width of 2px per point
        const visiblePointCount = Math.floor(chartWidth / pointWidth);

        console.log('Chart visibility stats:', {
            totalDataPoints: data.length,
            chartWidth,
            pointWidth,
            visiblePointCount,
            scrollPosition: scrollLeft,
        });

        const RIGHT_MARGIN = chartWidth * 0.1;
        const totalWidth = chartWidth + RIGHT_MARGIN;

        // Calculate visible range based on scroll position
        const startIndex = Math.max(0, Math.floor(scrollLeft / pointWidth));
        const endIndex = Math.min(data.length, Math.ceil((scrollLeft + totalWidth) / pointWidth));
        const visibleData = data.slice(startIndex, endIndex);

        console.log('Visible data range:', {
            startIndex,
            endIndex,
            visibleCount: visibleData.length,
            actualPointWidth: chartWidth / visibleData.length,
        });

        if (!visibleData.length) {
            return { visibleData: [], minY: 0, maxY: 0 };
        }

        // Find min/max prices in visible range with a small context buffer
        const contextStartIndex = Math.max(0, startIndex - Math.floor(visiblePoints * 0.1));
        const contextEndIndex = Math.min(data.length, endIndex + Math.floor(visiblePoints * 0.1));
        const contextData = data.slice(contextStartIndex, contextEndIndex);

        let minPrice = Infinity;
        let maxPrice = -Infinity;
        contextData.forEach((point) => {
            minPrice = Math.min(minPrice, point.low);
            maxPrice = Math.max(maxPrice, point.high);
        });

        // Calculate the center price for the visible range
        const centerPrice = (minPrice + maxPrice) / 2;

        // Calculate the price range based on the visible data and scale
        const baseRange = maxPrice - minPrice;
        const scaledRange = baseRange / yAxisScale;

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
