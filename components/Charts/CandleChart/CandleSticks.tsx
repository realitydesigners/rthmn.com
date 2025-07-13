"use client";

import { useColorStore } from "@/stores/colorStore";
import { create, props } from "@/lib/styles/atomic";
import { memo } from "react";
import type { ChartDataPoint } from "./index";

const styles = create({
  container: {
    display: "block",
  },

  candleGroup: {
    display: "block",
  },

  upperWick: {
    stroke: "currentColor",
    strokeWidth: "1",
  },

  lowerWick: {
    stroke: "currentColor",
    strokeWidth: "1",
  },

  candleBody: {
    fill: "black",
    stroke: "currentColor",
    strokeWidth: "1",
  },
});

export interface CandleSticksProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
  rightMargin: number;
}

export const CandleSticks = memo(
  ({ data, width, height, rightMargin }: CandleSticksProps) => {
    const { boxColors } = useColorStore();

    // Use passed rightMargin
    const adjustedWidth = width - rightMargin;

    // Adjust x positions to account for right margin and proper spacing
    const adjustedData = data.map((point, index) => ({
      ...point,
      scaledX:
        index * (adjustedWidth / data.length) + adjustedWidth / data.length / 2,
    }));

    // Filter visible points
    const visiblePoints = adjustedData.filter((point) => {
      const isVisible = point.scaledX >= 0 && point.scaledX <= adjustedWidth;
      return isVisible;
    });

    // Candlestick mode - calculate consistent width and spacing
    const GAP_RATIO = 0.15; // 15% gap between candles (much tighter)
    const MIN_WIDTH = 3;
    const MAX_WIDTH = 20;

    const totalCandleSpace = adjustedWidth / data.length;
    const gapSpace = totalCandleSpace * GAP_RATIO;
    const candleWidth = Math.max(
      MIN_WIDTH,
      Math.min(MAX_WIDTH, totalCandleSpace - gapSpace)
    );
    const halfCandleWidth = candleWidth / 2;

    return (
      <g {...props(styles.container)}>
        {visiblePoints.map((point) => {
          const candle = point.close > point.open;
          const candleColor = candle ? boxColors.positive : boxColors.negative;

          const bodyTop = Math.min(point.scaledOpen, point.scaledClose);
          const bodyBottom = Math.max(point.scaledOpen, point.scaledClose);
          const rawBodyHeight = bodyBottom - bodyTop;
          const bodyHeight = Math.max(6, rawBodyHeight);

          return (
            <g
              key={point.timestamp}
              {...props(styles.candleGroup)}
              transform={`translate(${point.scaledX - halfCandleWidth}, 0)`}
              style={{ color: candleColor }}
            >
              <line
                x1={halfCandleWidth}
                y1={point.scaledHigh}
                x2={halfCandleWidth}
                y2={bodyTop}
                {...props(styles.upperWick)}
              />
              <line
                x1={halfCandleWidth}
                y1={bodyBottom}
                x2={halfCandleWidth}
                y2={point.scaledLow}
                {...props(styles.lowerWick)}
              />
              <rect
                x={0}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                {...props(styles.candleBody)}
              />
            </g>
          );
        })}
      </g>
    );
  }
);

CandleSticks.displayName = "CandleSticks";
