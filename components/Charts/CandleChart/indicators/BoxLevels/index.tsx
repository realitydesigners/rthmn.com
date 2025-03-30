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
    const oneHourAgo = lastCandleTime - 60 * 120 * 1000;

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

    // Get boxes from the last hour relative to the last candle
    const recentBoxes = histogramBoxes.filter((box) => {
        const boxTime = new Date(box.timestamp).getTime();
        return boxTime >= oneHourAgo && boxTime <= lastCandleTime;
    });

    if (!recentBoxes.length) return null;

    // Calculate line width with gap
    const lineWidth = 4; // Using the same value as CHART_CONFIG.BOX_LEVELS.LINE_WIDTH
    // Process each box to get its position and dimensions
    const processedBoxes = recentBoxes
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
                                    <line
                                        x1={-lineWidth / 2}
                                        y1={level.scaledHigh}
                                        x2={lineWidth / 2}
                                        y2={level.scaledHigh}
                                        stroke={color}
                                        strokeWidth={0.5}
                                        strokeOpacity={opacity}
                                    />
                                    <line
                                        x1={-lineWidth / 2}
                                        y1={level.scaledLow}
                                        x2={lineWidth / 2}
                                        y2={level.scaledLow}
                                        stroke={color}
                                        strokeWidth={0.5}
                                        strokeOpacity={opacity}
                                    />
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
