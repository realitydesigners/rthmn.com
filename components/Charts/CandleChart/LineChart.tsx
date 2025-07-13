"use client";

import { create, props } from "@/lib/styles/atomic";
import { memo } from "react";
import type { ChartDataPoint } from "./index";

const styles = create({
  container: {
    display: "block",
  },

  linePath: {
    stroke: "white",
    strokeWidth: "1",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
});

export interface LineChartProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
  rightMargin: number;
}

export const LineChart = memo(
  ({ data, width, height, rightMargin }: LineChartProps) => {
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

    if (visiblePoints.length < 2) return null;

    // Create path string for the line using extreme values (high or low)
    const pathData = visiblePoints
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";

        // For the last point, use close price
        if (index === visiblePoints.length - 1) {
          return `${command} ${point.scaledX} ${point.scaledClose}`;
        }

        // For other points, determine which is more extreme
        // Get the center line (midpoint between high and low)
        const midPoint = (point.scaledHigh + point.scaledLow) / 2;

        // Use the value that's furthest from the center
        const highDistance = Math.abs(point.scaledHigh - midPoint);
        const lowDistance = Math.abs(point.scaledLow - midPoint);

        const useHigh = highDistance >= lowDistance;
        const yValue = useHigh ? point.scaledHigh : point.scaledLow;

        return `${command} ${point.scaledX} ${yValue}`;
      })
      .join(" ");

    return (
      <g {...props(styles.container)}>
        <path d={pathData} {...props(styles.linePath)} />
      </g>
    );
  }
);

LineChart.displayName = "LineChart";
