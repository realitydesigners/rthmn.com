import { useColorStore } from "@/stores/colorStore";
import { formatPrice } from "@/utils/instruments";
import React, { memo, useMemo } from "react";
import type { ChartDataPoint } from "../../index";

// Update BoxLevels props interface
interface BoxLevelsProps {
  data: ChartDataPoint[];
  histogramBoxes: any[];
  width: number;
  height: number;
  yAxisScale: number;
  boxOffset: number;
  visibleBoxesCount: number;
  boxVisibilityFilter: "all" | "positive" | "negative";
  rightMargin: number;
  pair: string;
}

const BoxLevels = memo(
  ({
    data,
    histogramBoxes,
    width,
    height,
    yAxisScale,
    boxOffset,
    visibleBoxesCount,
    boxVisibilityFilter,
    rightMargin,
    pair,
  }: BoxLevelsProps) => {
    const { boxColors } = useColorStore();

    if (!histogramBoxes?.length || !data.length) return null;

    // Get only the current frame
    const currentFrame = histogramBoxes[histogramBoxes.length - 1];
    if (!currentFrame) return null;

    // Find min/max prices in visible range
    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = Number.NEGATIVE_INFINITY;
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

    const PRICE_LINE_OPACITY = 0.5;
    const adjustedWidth = width - rightMargin;

    // Get visible boxes from current frame
    const visibleBoxes = currentFrame.boxes
      .slice(boxOffset, boxOffset + visibleBoxesCount)
      .filter((level: any) => {
        if (boxVisibilityFilter === "positive") return level.value > 0;
        if (boxVisibilityFilter === "negative") return level.value < 0;
        return true;
      });

    return (
      <g className="box-levels">
        {/* Horizontal price lines */}
        {visibleBoxes.map((box: any, index: number) => {
          const color = box.value > 0 ? boxColors.positive : boxColors.negative;
          const scaledHigh = scaleY(box.high);
          const scaledLow = scaleY(box.low);

          return (
            <g key={`price-line-${box.high}-${box.low}-${index}`}>
              {/* High price line */}
              <line
                x1={0}
                y1={scaledHigh}
                x2={adjustedWidth}
                y2={scaledHigh}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={PRICE_LINE_OPACITY}
              />
              {/* Low price line */}
              <line
                x1={0}
                y1={scaledLow}
                x2={adjustedWidth}
                y2={scaledLow}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={PRICE_LINE_OPACITY}
              />
            </g>
          );
        })}

        {/* Price labels on the right */}
        <g transform={`translate(${width - rightMargin + 4}, 0)`}>
          {visibleBoxes.map((box: any, index: number) => {
            const color =
              box.value > 0 ? boxColors.positive : boxColors.negative;
            const scaledHigh = scaleY(box.high);
            const scaledLow = scaleY(box.low);

            return (
              <g key={`price-label-${box.high}-${box.low}-${index}`}>
                {/* High price */}
                <g transform={`translate(0, ${scaledHigh})`}>
                  <line
                    x1={-4}
                    y1={0}
                    x2={0}
                    y2={0}
                    stroke={color}
                    strokeWidth={1}
                  />
                  <text
                    x={8}
                    y={3}
                    fill={color}
                    fontSize={10}
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    {formatPrice(box.high, pair)}
                  </text>
                </g>
                {/* Low price */}
                <g transform={`translate(0, ${scaledLow})`}>
                  <line
                    x1={-4}
                    y1={0}
                    x2={0}
                    y2={0}
                    stroke={color}
                    strokeWidth={1}
                  />
                  <text
                    x={8}
                    y={3}
                    fill={color}
                    fontSize={10}
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    {formatPrice(box.low, pair)}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </g>
    );
  }
);

export default BoxLevels;
