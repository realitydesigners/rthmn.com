import React, { memo } from 'react';
import { useColorStore } from '@/stores/colorStore';
import { ChartDataPoint } from '../../index';

// Update BoxLevels props interface
interface BoxLevelsProps {
    data: ChartDataPoint[];
    histogramBoxes: any[];
    width: number;
    height: number;
    yAxisScale: number;
    boxOffset: number;
    visibleBoxesCount: number;
    boxVisibilityFilter: 'all' | 'positive' | 'negative';
}

const BoxLevels = memo(({ data, histogramBoxes, width, height, yAxisScale, boxOffset, visibleBoxesCount, boxVisibilityFilter }: BoxLevelsProps) => {
    const { boxColors } = useColorStore();

    if (!histogramBoxes?.length || !data.length) return null;

    // Get the timestamp of the most recent candle
    const lastCandleTime = data[data.length - 1].timestamp;

    // Create a map of timestamp to candle data for scaling
    const candleMap = new Map(data.map((point) => [point.timestamp, point]));

    // Find min/max prices in visible range
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    data.forEach((point) => {
        minPrice = Math.min(minPrice, point.low);
        maxPrice = Math.max(maxPrice, point.high);
    });

    // Calculate the center price and range (same as useChartData)
    const centerPrice = (minPrice + maxPrice) / 2;
    const baseRange = maxPrice - minPrice;
    const scaledRange = baseRange / yAxisScale;
    const padding = scaledRange * 0.05;
    const paddedMin = centerPrice - scaledRange / 2 - padding;
    const paddedMax = centerPrice + scaledRange / 2 + padding;

    // Process each box to get its position and dimensions
    const processedBoxes = histogramBoxes
        .map((box) => {
            const boxTime = new Date(box.timestamp).getTime();
            const candle = candleMap.get(boxTime);
            if (!candle) return null;

            // Use the exact same scaling function as useChartData
            const scaleY = (price: number) => {
                const normalizedPrice = (price - paddedMin) / (paddedMax - paddedMin);
                return height * (1 - normalizedPrice);
            };

            // Slice the boxes based on timeframe first
            const slicedBoxes = [...box.boxes].slice(boxOffset, boxOffset + visibleBoxesCount).map((level: any, boxIndex: number) => ({
                ...level,
                id: `${boxTime}-${boxIndex}-${level.high}-${level.low}-${level.value}`,
                scaledHigh: scaleY(level.high),
                scaledLow: scaleY(level.low),
            }));

            return {
                timestamp: boxTime,
                xPosition: candle.scaledX,
                boxes: slicedBoxes,
            };
        })
        .filter(Boolean);

    return (
        <g className='box-levels'>
            {processedBoxes.map((boxFrame, index) => {
                // Apply visibility filter after slicing
                const filteredLevels = boxFrame.boxes.filter((level) => {
                    if (boxVisibilityFilter === 'positive') {
                        return level.value > 0;
                    }
                    if (boxVisibilityFilter === 'negative') {
                        return level.value < 0;
                    }
                    return true; // 'all'
                });

                return (
                    <g key={`${boxFrame.timestamp}-${index}`} transform={`translate(${boxFrame.xPosition}, 0)`}>
                        {filteredLevels.map((level) => {
                            const color = level.value > 0 ? boxColors.positive : boxColors.negative;
                            const opacity = 0.8;

                            return (
                                <g key={level.id}>
                                    {/* Draw horizontal lines at exact high and low points with gaps */}
                                    <line x1={-4 / 2} y1={level.scaledHigh} x2={4 / 2} y2={level.scaledHigh} stroke={color} strokeWidth={0.5} strokeOpacity={opacity} />
                                    <line x1={-4 / 2} y1={level.scaledLow} x2={4 / 2} y2={level.scaledLow} stroke={color} strokeWidth={0.5} strokeOpacity={opacity} />
                                </g>
                            );
                        })}
                    </g>
                );
            })}
        </g>
    );
});

export default BoxLevels;
