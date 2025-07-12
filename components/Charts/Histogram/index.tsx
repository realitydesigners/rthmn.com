"use client";

import type { BoxColors } from "@/stores/colorStore";
import type { Box } from "@/types/types";
import { BoxSizes } from "@/utils/instruments";
import { formatPrice } from "@/utils/instruments";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

interface BoxTimelineProps {
  data: {
    timestamp: string;
    progressiveValues: Box[];
    currentOHLC?: {
      open: number;
      high: number;
      low: number;
      close: number;
    };
  }[];
  boxOffset: number;
  visibleBoxesCount: number;
  boxVisibilityFilter: "all" | "positive" | "negative";
  boxColors: BoxColors;
  className?: string;
  hoveredTimestamp?: number | null;
  showLine?: boolean;
}

const MAX_FRAMES = 1000;

const Histogram: React.FC<BoxTimelineProps> = ({
  data,
  boxOffset,
  visibleBoxesCount,
  boxVisibilityFilter,
  boxColors,
  className = "",
  hoveredTimestamp,
  showLine = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [trendChanges, setTrendChanges] = useState<
    Array<{ timestamp: string; x: number; isPositive: boolean }>
  >([]);
  const [effectiveBoxWidth, setEffectiveBoxWidth] = useState(0);
  const framesToDrawRef = useRef<BoxTimelineProps["data"]>([]);
  const frameToRealTimestampRef = useRef<Map<number, number>>(new Map());

  const calculateBoxDimensions = (
    containerHeight: number,
    frameCount: number
  ) => {
    // Calculate box size to exactly fill the container height
    const boxSize = containerHeight / visibleBoxesCount;
    const totalHeight = containerHeight;
    // Add padding to the right for the white line
    const RIGHT_PADDING = 60;
    const requiredWidth = boxSize * frameCount + RIGHT_PADDING;
    return { boxSize, requiredWidth, totalHeight };
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const container = canvas.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    // Since data is now pre-repositioned on server-side, we can use it directly
    const framesToDraw = data.slice(Math.max(0, data.length - MAX_FRAMES));
    framesToDrawRef.current = framesToDraw;

    if (framesToDraw.length === 0) return;

    // Build frame to timestamp mapping for hover functionality
    frameToRealTimestampRef.current.clear();
    framesToDraw.forEach((frame, index) => {
      const frameTimestamp = new Date(frame.timestamp).getTime();
      frameToRealTimestampRef.current.set(index, frameTimestamp);
    });

    // Find the frame index to highlight based on hoveredTimestamp
    let highlightIndex = -1;
    if (hoveredTimestamp !== null && hoveredTimestamp !== undefined) {
      const targetTime = Number(hoveredTimestamp);
      let minDiff = Number.POSITIVE_INFINITY;

      framesToDraw.forEach((frame, index) => {
        const frameTime = new Date(frame.timestamp).getTime();
        const diff = Math.abs(frameTime - targetTime);
        if (diff < minDiff && diff < 500) {
          minDiff = diff;
          highlightIndex = index;
        }
      });

      if (highlightIndex === -1) {
        let closestMappedIndex = -1;
        let minMappedDiff = Number.POSITIVE_INFINITY;
        frameToRealTimestampRef.current.forEach((realTimestamp, index) => {
          if (index >= framesToDraw.length) return;
          const diff = Math.abs(realTimestamp - targetTime);
          if (diff < minMappedDiff) {
            minMappedDiff = diff;
            closestMappedIndex = index;
          }
        });

        if (closestMappedIndex !== -1 && minMappedDiff < 1000) {
          highlightIndex = closestMappedIndex;
        }
      }
    }

    const { boxSize, requiredWidth, totalHeight } = calculateBoxDimensions(
      rect.height,
      framesToDraw.length
    );
    setEffectiveBoxWidth(boxSize);

    canvas.style.width = `${requiredWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(requiredWidth * dpr);
    canvas.height = Math.floor(totalHeight * dpr);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, requiredWidth, totalHeight);

    const newTrendChanges: Array<{
      timestamp: string;
      x: number;
      isPositive: boolean;
    }> = [];
    let prevIsLargestPositive: boolean | null = null;
    const linePoints: {
      x: number;
      y: number;
      isPositive: boolean;
      isLargestPositive: boolean;
    }[] = [];

    framesToDraw.forEach((frame, frameIndex) => {
      const x = frameIndex * boxSize;
      const boxes = frame.progressiveValues.slice(
        boxOffset,
        boxOffset + visibleBoxesCount
      );
      if (boxes.length === 0) return;

      // Draw highlight for hovered frame
      if (frameIndex === highlightIndex) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(x, 0, boxSize, totalHeight);
      }

      // Use pre-repositioned boxes directly from server
      // No need to sort here since data is already repositioned in boxDataProcessor
      const orderedBoxes = frame.progressiveValues.slice(
        boxOffset,
        boxOffset + visibleBoxesCount
      );

      const largestBox = orderedBoxes.reduce(
        (max, box) => (Math.abs(box.value) > Math.abs(max.value) ? box : max),
        orderedBoxes[0] || { value: 0 }
      );
      const isLargestPositive = largestBox.value >= 0;

      // Draw boxes with proper spacing
      orderedBoxes.forEach((box, boxIndex) => {
        const y = boxIndex * boxSize;
        const isPositiveBox = box.value >= 0;

        if (isLargestPositive) {
          ctx.fillStyle = isPositiveBox
            ? `rgba(${Number.parseInt(boxColors.positive.slice(1, 3), 16)}, ${Number.parseInt(boxColors.positive.slice(3, 5), 16)}, ${Number.parseInt(boxColors.positive.slice(5, 7), 16)}, 0.1)`
            : `rgba(${Number.parseInt(boxColors.positive.slice(1, 3), 16)}, ${Number.parseInt(boxColors.positive.slice(3, 5), 16)}, ${Number.parseInt(boxColors.positive.slice(5, 7), 16)}, 0.3)`;
        } else {
          ctx.fillStyle = isPositiveBox
            ? `rgba(${Number.parseInt(boxColors.negative.slice(1, 3), 16)}, ${Number.parseInt(boxColors.negative.slice(3, 5), 16)}, ${Number.parseInt(boxColors.negative.slice(5, 7), 16)}, 0.3)`
            : `rgba(${Number.parseInt(boxColors.negative.slice(1, 3), 16)}, ${Number.parseInt(boxColors.negative.slice(3, 5), 16)}, ${Number.parseInt(boxColors.negative.slice(5, 7), 16)}, 0.1)`;
        }

        ctx.fillRect(
          x,
          y,
          boxSize,
          boxSize + (boxIndex === orderedBoxes.length - 1 ? 1 : 0)
        );
      });

      const smallestBoxData = orderedBoxes.reduce(
        (minData, box) => {
          const absValue = Math.abs(box.value);
          if (absValue < minData.minAbsValue) {
            return { minAbsValue: absValue, box: box };
          }
          return minData;
        },
        { minAbsValue: Number.POSITIVE_INFINITY, box: null as Box | null }
      );
      const smallestBox = smallestBoxData.box;

      if (smallestBox) {
        const isPositive = smallestBox.value >= 0;
        const boxIndex = orderedBoxes.findIndex((box) => box === smallestBox);
        const y = (boxIndex + (isPositive ? 0 : 1)) * boxSize;
        linePoints.push({ x, y, isPositive, isLargestPositive });
      }

      if (
        prevIsLargestPositive !== null &&
        prevIsLargestPositive !== isLargestPositive
      ) {
        newTrendChanges.push({
          timestamp: frame.timestamp,
          x,
          isPositive: isLargestPositive,
        });
      }
      prevIsLargestPositive = isLargestPositive;
    });

    if (showLine && linePoints.length > 0) {
      // Draw fill areas
      for (let i = 0; i < linePoints.length - 1; i++) {
        const currentPoint = linePoints[i];
        const nextPoint = linePoints[i + 1];

        ctx.beginPath();
        if (currentPoint.isLargestPositive) {
          ctx.moveTo(currentPoint.x, 0);
          ctx.lineTo(nextPoint.x, 0);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.lineTo(currentPoint.x, currentPoint.y);
        } else {
          ctx.moveTo(currentPoint.x, currentPoint.y);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.lineTo(nextPoint.x, totalHeight);
          ctx.lineTo(currentPoint.x, totalHeight);
        }
        ctx.closePath();

        const fillColor = currentPoint.isLargestPositive
          ? boxColors.positive
          : boxColors.negative;
        const gradient = ctx.createLinearGradient(
          currentPoint.x,
          0,
          nextPoint.x,
          0
        );
        try {
          const r = Number.parseInt(fillColor.slice(1, 3), 16) || 0;
          const g = Number.parseInt(fillColor.slice(3, 5), 16) || 0;
          const b = Number.parseInt(fillColor.slice(5, 7), 16) || 0;
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
          ctx.fillStyle = gradient;
          ctx.fill();
        } catch (e) {
          console.error("Error parsing fill color:", fillColor, e);
        }
      }

      // Draw last gradient fill
      if (linePoints.length > 0) {
        const lastPoint = linePoints[linePoints.length - 1];
        ctx.beginPath();
        if (lastPoint.isLargestPositive) {
          ctx.moveTo(lastPoint.x, 0);
          ctx.lineTo(lastPoint.x + boxSize, 0);
          ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
          ctx.lineTo(lastPoint.x, lastPoint.y);
        } else {
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
          ctx.lineTo(lastPoint.x + boxSize, totalHeight);
          ctx.lineTo(lastPoint.x, totalHeight);
        }
        ctx.closePath();

        const fillColor = lastPoint.isLargestPositive
          ? boxColors.positive
          : boxColors.negative;
        const gradient = ctx.createLinearGradient(
          lastPoint.x,
          0,
          lastPoint.x + boxSize,
          0
        );
        try {
          const r = Number.parseInt(fillColor.slice(1, 3), 16) || 0;
          const g = Number.parseInt(fillColor.slice(3, 5), 16) || 0;
          const b = Number.parseInt(fillColor.slice(5, 7), 16) || 0;
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
          ctx.fillStyle = gradient;
          ctx.fill();
        } catch (e) {
          console.error("Error parsing fill color:", fillColor, e);
        }
      }

      // Draw white line
      ctx.beginPath();
      linePoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });

      if (linePoints.length > 0) {
        const lastPoint = linePoints[linePoints.length - 1];
        // Extend the line to include the padding
        ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();

      // Draw white circle at the end with padding
      if (linePoints.length > 0) {
        const lastPoint = linePoints[linePoints.length - 1];
        ctx.beginPath();
        ctx.arc(lastPoint.x + boxSize, lastPoint.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      }
    }

    // After all drawing is done, scroll to the highlighted frame if needed
    if (highlightIndex !== -1 && scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const highlightX = highlightIndex * boxSize;
      const containerWidth = scrollContainer.clientWidth;
      const targetScrollLeft = highlightX + boxSize / 2 - containerWidth / 2;

      // Clamp scroll position to valid bounds
      const maxScrollLeft = scrollContainer.scrollWidth - containerWidth;
      const clampedScrollLeft = Math.max(
        0,
        Math.min(targetScrollLeft, maxScrollLeft)
      );

      // Scroll smoothly
      scrollContainer.scrollTo({
        left: clampedScrollLeft,
        behavior: "smooth",
      });
    }

    setTrendChanges(newTrendChanges);
  }, [
    isClient,
    data,
    boxOffset,
    visibleBoxesCount,
    boxColors,
    showLine,
    boxVisibilityFilter,
    hoveredTimestamp,
  ]);

  return (
    <div className={`relative ${className}`}>
      <div className="mr-12">
        <div
          ref={scrollContainerRef}
          className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-full w-full overflow-x-auto pr-12"
        >
          <div className="relative h-full pt-6">
            <div className="pointer-events-none absolute -top-0 right-0 left-0 z-0 ml-[18px] h-6">
              {trendChanges.map((change, index) => (
                <div
                  key={`${change.timestamp}-${index}-${change.x}`}
                  className="absolute -translate-x-1/2 transform"
                  style={{
                    left: `${change.x}px`,
                    color: change.isPositive
                      ? boxColors.positive
                      : boxColors.negative,
                  }}
                >
                  ▼
                </div>
              ))}
            </div>

            <div className="relative mr-8 h-full">
              <canvas
                ref={canvasRef}
                className="block h-full overflow-y-hidden"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        {data.length > 0 && (
          <div className="pointer-events-none absolute top-3 right-0 -bottom-0 flex w-12 flex-col justify-between shadow-2xl">
            {data[data.length - 1].progressiveValues.slice(
              boxOffset,
              boxOffset + visibleBoxesCount
            ).length > 0 && (
              <>
                {(() => {
                  const visibleBoxes = data[
                    data.length - 1
                  ].progressiveValues.slice(
                    boxOffset,
                    boxOffset + visibleBoxesCount
                  );
                  const largestBox = visibleBoxes.reduce((max, box) =>
                    Math.abs(box.value) > Math.abs(max.value) ? box : max
                  );
                  const color =
                    largestBox.value > 0
                      ? boxColors.positive
                      : boxColors.negative;
                  return (
                    <>
                      <div className="flex items-center">
                        <div
                          className="h-[1px] flex-1"
                          style={{ backgroundColor: color }}
                        />
                        <div className="ml-1">
                          <span
                            className="font-kodemono  text-[8px] tracking-wider"
                            style={{ color }}
                          >
                            {formatPrice(largestBox.high, "BTC/USD")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div
                          className="h-[1px] flex-1"
                          style={{ backgroundColor: color }}
                        />
                        <div className="ml-1">
                          <span
                            className="font-kodemono  text-[8px] tracking-wider"
                            style={{ color }}
                          >
                            {formatPrice(largestBox.low, "BTC/USD")}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Histogram);
