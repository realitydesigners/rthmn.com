import React, { memo } from 'react';
import { useColorStore } from '@/stores/colorStore';
import { ChartDataPoint } from '../../index';
import { formatPrice } from '@/utils/instruments';

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
    rightMargin: number;
}

const BoxLevels = memo(({ data, histogramBoxes, width, height, yAxisScale, boxOffset, visibleBoxesCount, boxVisibilityFilter, rightMargin }: BoxLevelsProps) => {
    const { boxColors } = useColorStore();

    if (!histogramBoxes?.length || !data.length) return null;

    // Create a map of timestamp to candle data for scaling
    const candleMap = new Map(data.map((point) => [new Date(point.timestamp).getTime(), point]));

    // Find min/max prices in visible range
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    data.forEach((point) => {
        minPrice = Math.min(minPrice, point.low);
        maxPrice = Math.max(maxPrice, point.high);
    });

    // Calculate the center price and range
    const centerPrice = (minPrice + maxPrice) / 2;
    const baseRange = maxPrice - minPrice;
    const scaledRange = baseRange / yAxisScale;
    const padding = scaledRange * 0.05;
    const paddedMin = centerPrice - scaledRange / 2 - padding;
    const paddedMax = centerPrice + scaledRange / 2 + padding;

    // Scale Y values consistently
    const scaleY = (price: number) => {
        const normalizedPrice = (price - paddedMin) / (paddedMax - paddedMin);
        return height * (1 - normalizedPrice);
    };

    // Constants for line appearance
    const LINE_WIDTH = 5;
    const LINE_STROKE_WIDTH = 0.2;
    const LINE_OPACITY = 0.8;
    const adjustedWidth = width - rightMargin;

    // Process boxes
    const processedBoxes = histogramBoxes
        .map((box, index) => {
            const isCurrentBox = index === histogramBoxes.length - 1;
            const boxTime = new Date(box.timestamp).getTime();

            let candle;
            if (isCurrentBox) {
                candle = data[data.length - 1];
            } else {
                candle = candleMap.get(boxTime);
            }

            if (!candle) return null;

            const relevantBoxes = box.boxes
                .slice(boxOffset, boxOffset + visibleBoxesCount)
                .filter((level: any) => {
                    if (boxVisibilityFilter === 'positive') return level.value > 0;
                    if (boxVisibilityFilter === 'negative') return level.value < 0;
                    return true;
                })
                .map((level: any) => ({
                    ...level,
                    scaledHigh: scaleY(level.high),
                    scaledLow: scaleY(level.low),
                    timestamp: boxTime,
                }));

            if (relevantBoxes.length === 0) return null;

            const xPosition = (candle.scaledX / width) * adjustedWidth;

            return {
                timestamp: box.timestamp,
                xPosition,
                boxes: relevantBoxes,
                isCurrent: isCurrentBox,
            };
        })
        .filter(Boolean);

    // Create a map to track seen levels
    const seenLevels = new Map();

    // Filter out duplicates across all frames
    const uniqueProcessedBoxes = processedBoxes
        .map((boxFrame) => {
            const uniqueBoxes = boxFrame.boxes.filter((level) => {
                const key = `${level.high}-${level.low}-${level.value > 0}`;

                if (seenLevels.has(key)) {
                    const existingLevel = seenLevels.get(key);
                    // Keep the level if it's from a more recent timestamp
                    if (level.timestamp > existingLevel.timestamp) {
                        seenLevels.set(key, level);
                        return true;
                    }
                    return false;
                }

                seenLevels.set(key, level);
                return true;
            });

            return {
                ...boxFrame,
                boxes: uniqueBoxes,
            };
        })
        .filter((boxFrame) => boxFrame.boxes.length > 0);

    // Find the largest box in the current frame
    const currentFrame = histogramBoxes[histogramBoxes.length - 1];
    const visibleBoxes = currentFrame.boxes.slice(boxOffset, boxOffset + visibleBoxesCount);
    const largestBox = visibleBoxes.reduce((max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max));

    return (
        <g className='box-levels'>
            {uniqueProcessedBoxes.map((boxFrame, frameIndex) => (
                <g key={`${boxFrame.timestamp}-${frameIndex}-${boxFrame.isCurrent ? 'current' : 'historical'}`} transform={`translate(${boxFrame.xPosition}, 0)`}>
                    {boxFrame.boxes.map((level, levelIndex) => {
                        const color = level.value > 0 ? boxColors.positive : boxColors.negative;
                        return (
                            <g key={`${level.high}-${level.low}-${level.value}-${levelIndex}`}>
                                <line
                                    x1={-LINE_WIDTH / 2}
                                    x2={LINE_WIDTH / 2}
                                    y1={level.scaledHigh}
                                    y2={level.scaledHigh}
                                    stroke={color}
                                    strokeWidth={LINE_STROKE_WIDTH}
                                    opacity={LINE_OPACITY}
                                />
                                <line
                                    x1={-LINE_WIDTH / 2}
                                    x2={LINE_WIDTH / 2}
                                    y1={level.scaledLow}
                                    y2={level.scaledLow}
                                    stroke={color}
                                    strokeWidth={LINE_STROKE_WIDTH}
                                    opacity={LINE_OPACITY}
                                />
                            </g>
                        );
                    })}
                </g>
            ))}
            {/* Add price labels for the largest box */}
            {largestBox && (
                <g transform={`translate(${width - rightMargin + 4}, 0)`}>
                    <g transform={`translate(0, ${scaleY(largestBox.high)})`}>
                        <line x1={-4} y1={0} x2={0} y2={0} stroke={largestBox.value >= 0 ? boxColors.positive : boxColors.negative} strokeWidth={1} />
                        <text x={8} y={3} fill={largestBox.value >= 0 ? boxColors.positive : boxColors.negative} fontSize={10} fontFamily='monospace' textAnchor='start'>
                            {formatPrice(largestBox.high, 'BTC/USD')}
                        </text>
                    </g>
                    <g transform={`translate(0, ${scaleY(largestBox.low)})`}>
                        <line x1={-4} y1={0} x2={0} y2={0} stroke={largestBox.value >= 0 ? boxColors.positive : boxColors.negative} strokeWidth={1} />
                        <text x={8} y={3} fill={largestBox.value >= 0 ? boxColors.positive : boxColors.negative} fontSize={10} fontFamily='monospace' textAnchor='start'>
                            {formatPrice(largestBox.low, 'BTC/USD')}
                        </text>
                    </g>
                </g>
            )}
        </g>
    );
});

export default BoxLevels;
