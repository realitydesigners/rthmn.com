"use client";

import { create, props } from "@/lib/styles/atomic";
import type { BoxColors } from "@/stores/colorStore";
import type { Box } from "@/types/types";
import { BoxSizes } from "@/utils/instruments";
import { formatPrice } from "@/utils/instruments";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Atomic CSS styles
const styles = create({
  // Main container
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    userSelect: "none",
  },

  // Scroll container
  scrollContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflowX: "auto",
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },

  // Canvas wrapper
  canvasWrapper: {
    position: "relative",
    height: "100%",

    marginRight: "2rem",
  },

  // Canvas element
  canvas: {
    position: "relative",
    display: "block",
    height: "100%",
    overflowY: "",
  },

  // Price axis
  priceAxis: {
    position: "absolute",
    top: "0.25rem", // Reduced from 0.75rem
    right: "0",
    bottom: "0",
    width: "3rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    pointerEvents: "none",
    userSelect: "none",
  },

  // Price line
  priceLine: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },

  // Price line separator
  priceLineSeparator: {
    height: "1px",
    flexGrow: 1,
  },

  // Price label
  priceLabel: {
    fontFamily: "Kodemono, monospace",

    letterSpacing: "0.05em",
  },

  // Hover tooltip
  tooltip: {
    position: "absolute",
    bottom: "-4rem",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "0.5rem 0.75rem",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgb(75, 75, 75)",
    borderRadius: "0.375rem",
    color: "rgb(255, 255, 255)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    backdropFilter: "blur(4px)",
    pointerEvents: "none",
    zIndex: 30,
  },
});

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
  pair?: string; // Add pair prop for proper price formatting
}

const Histogram: React.FC<BoxTimelineProps> = ({
  data,
  boxOffset,
  visibleBoxesCount,
  boxVisibilityFilter,
  boxColors,
  className = "",
  hoveredTimestamp,
  showLine = true,
  pair = "EURUSD", // Default pair
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
  const [hoveredFrame, setHoveredFrame] = useState<{
    index: number;
    timestamp: string;
  } | null>(null);

  // Constants for colors
  const BACKGROUND_COLOR = "#0a0a0a";
  const LINE_COLOR = "#FFFFFF";

  const calculateBoxDimensions = (
    containerHeight: number,
    frameCount: number
  ) => {
    const boxHeight = containerHeight / visibleBoxesCount; // Use visible count from props
    const boxSize = boxHeight; // Make square
    const totalHeight = containerHeight;
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

    const framesToDraw = data;
    framesToDrawRef.current = framesToDraw;

    if (framesToDraw.length === 0) return;

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

    // Setup canvas with padding compensation
    canvas.style.width = `${requiredWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(requiredWidth * dpr);
    canvas.height = Math.floor(totalHeight * dpr);
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = BACKGROUND_COLOR;
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

      // Draw highlight for hovered frame (from external hover)
      if (frameIndex === highlightIndex) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(x, 0, boxSize, totalHeight);
      }

      // Draw highlight for local mouse hover
      if (hoveredFrame && frameIndex === hoveredFrame.index) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(x, 0, boxSize, totalHeight);
      }

      // Use pre-repositioned boxes directly (boxDataProcessor already handled the complex sorting)
      const visibleBoxes = frame.progressiveValues.slice(
        boxOffset,
        boxOffset + visibleBoxesCount
      );

      // FIXED: Use same sorting logic as ResoBox for consistent trend determination
      // Sort by absolute value (largest first) to match ResoBox behavior
      const sortedByAbsValue = [...visibleBoxes].sort(
        (a, b) => Math.abs(b.value) - Math.abs(a.value)
      );

      // Use the largest absolute value box for trend (matching ResoBox)
      const largestBox = sortedByAbsValue[0];
      const isLargestPositive = largestBox ? largestBox.value >= 0 : true;

      // Skip drawing individual boxes - we only want smooth gradients and the white line

      // Use previous index-based positioning for the white line
      if (visibleBoxes.length > 0) {
        // Process boxes as before for line positioning (keep existing logic)
        const negativeBoxes = visibleBoxes
          .filter((box) => box.value < 0)
          .sort((a, b) => a.value - b.value);
        const positiveBoxes = visibleBoxes
          .filter((box) => box.value > 0)
          .sort((a, b) => a.value - b.value);
        const orderedBoxes = [...negativeBoxes, ...positiveBoxes];

        // Find smallest absolute value box
        const smallestBox = orderedBoxes.reduce(
          (min, box) => (Math.abs(box.value) < Math.abs(min.value) ? box : min),
          orderedBoxes[0]
        );

        const isPositive = smallestBox.value >= 0;
        const boxIndex = orderedBoxes.findIndex(
          (box) =>
            Math.abs(box.value) === Math.abs(smallestBox.value) &&
            Math.sign(box.value) === Math.sign(smallestBox.value)
        );

        // Use uniform box height for positioning
        const boxHeight = totalHeight / visibleBoxes.length;
        let lineY = (boxIndex + (isPositive ? 0 : 1)) * boxHeight;

        // FIXED: Detect trend changes and set natural starting positions
        const isTrendChange =
          prevIsLargestPositive !== null &&
          prevIsLargestPositive !== isLargestPositive;

        if (isTrendChange) {
          // FIXED: New uptrend starts from top, new downtrend starts from bottom
          lineY = isLargestPositive ? 0 : totalHeight;
        }

        linePoints.push({
          x,
          y: lineY,
          isPositive: isPositive,
          isLargestPositive,
        });

        // Draw box borders for visualization
        orderedBoxes.forEach((box, boxIndex) => {
          const y = boxIndex * boxSize;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, boxSize, boxSize);
        });
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

      // Draw box borders using nested positions
      let currentY = 0;
      let currentSize = totalHeight;
      for (let i = 0; i < visibleBoxes.length; i++) {
        const box = visibleBoxes[i];
        const prevBox = i > 0 ? visibleBoxes[i - 1] : null;

        currentSize = totalHeight * 0.86 ** i;

        if (!prevBox) {
          currentY = 0;
        } else {
          const isFirstDifferent =
            (box.value > 0 && prevBox.value < 0) ||
            (box.value < 0 && prevBox.value > 0);
          if (isFirstDifferent) {
            currentY = prevBox.value > 0 ? 0 : currentSize - currentSize;
          } else {
            currentY = box.value < 0 ? currentSize - currentSize : 0;
          }
        }
      }

      // Line positioning is now handled above with trend change detection
    });

    if (showLine && linePoints.length > 0) {
      // Draw fill areas
      for (let i = 0; i < linePoints.length - 1; i++) {
        const currentPoint = linePoints[i];
        const nextPoint = linePoints[i + 1];

        const fillColor = currentPoint.isLargestPositive
          ? boxColors.positive
          : boxColors.negative;

        // Draw trend background
        ctx.beginPath();
        ctx.moveTo(currentPoint.x, 0);
        ctx.lineTo(nextPoint.x, 0);
        ctx.lineTo(nextPoint.x, totalHeight);
        ctx.lineTo(currentPoint.x, totalHeight);
        ctx.closePath();

        // Base trend color
        const baseColor = hexToRgba(fillColor, 0.1);
        ctx.fillStyle = baseColor;
        ctx.fill();

        // Draw gradient overlay
        ctx.beginPath();
        if (currentPoint.isLargestPositive) {
          ctx.moveTo(currentPoint.x, currentPoint.y);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.lineTo(nextPoint.x, totalHeight);
          ctx.lineTo(currentPoint.x, totalHeight);
        } else {
          ctx.moveTo(currentPoint.x, 0);
          ctx.lineTo(nextPoint.x, 0);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.lineTo(currentPoint.x, currentPoint.y);
        }
        ctx.closePath();

        // Create gradient
        const gradient = ctx.createLinearGradient(
          0,
          currentPoint.isLargestPositive ? currentPoint.y : 0,
          0,
          currentPoint.isLargestPositive ? totalHeight : currentPoint.y
        );

        const brightColor = hexToRgba(fillColor, 0.2);
        const baseColorFade = hexToRgba(fillColor, 0.15);

        if (currentPoint.isLargestPositive) {
          gradient.addColorStop(0, brightColor);
          gradient.addColorStop(1, baseColorFade);
        } else {
          gradient.addColorStop(0, baseColorFade);
          gradient.addColorStop(1, brightColor);
        }

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw last gradient fill
      if (linePoints.length > 0) {
        const lastPoint = linePoints[linePoints.length - 1];
        const lastFillColor = lastPoint.isLargestPositive
          ? boxColors.positive
          : boxColors.negative;

        // Draw trend background
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, 0);
        ctx.lineTo(lastPoint.x + boxSize, 0);
        ctx.lineTo(lastPoint.x + boxSize, totalHeight);
        ctx.lineTo(lastPoint.x, totalHeight);
        ctx.closePath();

        const baseColor = hexToRgba(lastFillColor, 0.1);
        ctx.fillStyle = baseColor;
        ctx.fill();

        // Draw gradient overlay
        ctx.beginPath();
        if (lastPoint.isLargestPositive) {
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
          ctx.lineTo(lastPoint.x + boxSize, totalHeight);
          ctx.lineTo(lastPoint.x, totalHeight);
        } else {
          ctx.moveTo(lastPoint.x, 0);
          ctx.lineTo(lastPoint.x + boxSize, 0);
          ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
          ctx.lineTo(lastPoint.x, lastPoint.y);
        }
        ctx.closePath();

        const gradient = ctx.createLinearGradient(
          0,
          lastPoint.isLargestPositive ? lastPoint.y : 0,
          0,
          lastPoint.isLargestPositive ? totalHeight : lastPoint.y
        );

        const brightColor = hexToRgba(lastFillColor, 0.2);
        const baseColorFade = hexToRgba(lastFillColor, 0.15);

        if (lastPoint.isLargestPositive) {
          gradient.addColorStop(0, brightColor);
          gradient.addColorStop(1, baseColorFade);
        } else {
          gradient.addColorStop(0, baseColorFade);
          gradient.addColorStop(1, brightColor);
        }

        ctx.fillStyle = gradient;
        ctx.fill();
      }

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
        ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = LINE_COLOR;
      ctx.stroke();

      if (linePoints.length > 0) {
        const lastPoint = linePoints[linePoints.length - 1];
        ctx.beginPath();
        ctx.arc(lastPoint.x + boxSize, lastPoint.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = LINE_COLOR;
        ctx.fill();

        // Add current price text next to the white dot
        const currentFrame = framesToDraw[framesToDraw.length - 1];
        if (currentFrame?.currentOHLC?.close) {
          const currentPrice = currentFrame.currentOHLC.close;

          ctx.font = "8px Kodemono, monospace";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";

          // Position the price text to the right of the dot with some padding
          const textX = lastPoint.x + boxSize + 8;
          const textY = lastPoint.y;

          // Add a small background for better readability
          const text = formatPrice(currentPrice, pair);
          const textMetrics = ctx.measureText(text);
          const padding = 3;

          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillRect(
            textX - padding,
            textY - 7,
            textMetrics.width + padding * 2,
            14
          );

          // Draw the price text
          ctx.fillStyle = "white";
          ctx.fillText(text, textX, textY);
        }
      }
    }

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

    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      scrollContainer.scrollLeft =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;
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
    hoveredFrame,
    pair,
  ]);

  // Handle mouse events for hover tooltip
  useEffect(() => {
    const canvas = canvasRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!canvas || !scrollContainer) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!framesToDrawRef.current.length) return;

      const rect = canvas.getBoundingClientRect();
      const scrollLeft = scrollContainer.scrollLeft;
      const mouseXInCanvas = event.clientX - rect.left + scrollLeft;
      const frameIndex = Math.floor(mouseXInCanvas / 5); // Fixed 5px frame width

      if (frameIndex >= 0 && frameIndex < framesToDrawRef.current.length) {
        const frame = framesToDrawRef.current[frameIndex];

        setHoveredFrame({
          index: frameIndex,
          timestamp: frame.timestamp,
        });
      } else {
        setHoveredFrame(null);
      }
    };

    const handleMouseLeave = () => {
      setHoveredFrame(null);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const hexToRgba = (hex: string, alpha: number) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      console.error("Error parsing color:", hex, e);
      return `rgba(0, 0, 0, ${alpha})`;
    }
  };

  return (
    <div {...props(styles.container, className)}>
      {hoveredFrame && (
        <div {...props(styles.tooltip)}>
          {new Date(hoveredFrame.timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      )}

      <div {...props(styles.scrollContainer)} ref={scrollContainerRef}>
        <div {...props(styles.canvasWrapper)}>
          <canvas {...props(styles.canvas)} ref={canvasRef} />
        </div>
      </div>

      {data.length > 0 && (
        <div {...props(styles.priceAxis)}>
          {(() => {
            const currentFrame = data[data.length - 1];
            if (!currentFrame?.progressiveValues?.length) return null;

            const visibleBoxes = currentFrame.progressiveValues.slice(
              boxOffset,
              boxOffset + visibleBoxesCount
            );

            const negativeBoxes: Array<
              (typeof visibleBoxes)[0] & { index: number }
            > = [];
            const positiveBoxes: Array<
              (typeof visibleBoxes)[0] & { index: number }
            > = [];
            const zeroBoxes: Array<
              (typeof visibleBoxes)[0] & { index: number }
            > = [];

            visibleBoxes.forEach((box, index) => {
              const boxWithIndex = { ...box, index };
              if (box.value < 0) {
                negativeBoxes.push(boxWithIndex);
              } else if (box.value > 0) {
                positiveBoxes.push(boxWithIndex);
              } else {
                zeroBoxes.push(boxWithIndex);
              }
            });

            negativeBoxes.sort((a, b) => a.value - b.value);
            positiveBoxes.sort((a, b) => a.value - b.value);

            const repositionedBoxes = [
              ...negativeBoxes,
              ...zeroBoxes,
              ...positiveBoxes,
            ];

            const maxHigh = Math.max(...repositionedBoxes.map((b) => b.high));
            const minLow = Math.min(...repositionedBoxes.map((b) => b.low));
            const hasPositiveBoxes = repositionedBoxes.some((b) => b.value > 0);

            return (
              <>
                {hasPositiveBoxes && (
                  <>
                    {/* Show max HIGH at the top */}
                    <div
                      {...props(styles.priceLabel)}
                      style={{
                        position: "absolute",
                        top: "-2%",
                        transform: "translateY(-50%)",
                        fontSize: "7px",
                        color: "#797E86",
                      }}
                    >
                      {formatPrice(maxHigh, pair)}
                    </div>

                    {/* Show min LOW at the bottom */}
                    <div
                      {...props(styles.priceLabel)}
                      style={{
                        position: "absolute",
                        bottom: "1%",
                        transform: "translateY(50%)",
                        fontSize: "7px",
                        color: "#797E86",
                      }}
                    >
                      {formatPrice(minLow, pair)}
                    </div>
                  </>
                )}

                {/* Show all individual box prices except duplicates */}
                {repositionedBoxes.map((box, displayIndex) => {
                  const price = box.value < 0 ? box.high : box.low;
                  const boxHeight = 100 / repositionedBoxes.length;

                  // Skip if this price would duplicate the summary prices
                  const isDuplicateTop = hasPositiveBoxes && price === maxHigh;
                  const isDuplicateBottom =
                    hasPositiveBoxes && price === minLow;

                  if (isDuplicateTop || isDuplicateBottom) {
                    return null; // Skip duplicate prices
                  }

                  return (
                    <div
                      key={displayIndex}
                      {...props(styles.priceLabel)}
                      style={{
                        position: "absolute",
                        top: `${displayIndex * boxHeight + boxHeight / 1.3}%`,
                        transform: "translateY(-50%)",
                        fontSize: "7px",
                        marginBottom: "px",
                        color: "#797E86", // Gray color
                      }}
                    >
                      {formatPrice(price, pair)}
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default memo(Histogram);
