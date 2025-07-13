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
    overflowY: "hidden",
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
    marginLeft: "0.25rem",
    fontFamily: "Kodemono, monospace",
    fontSize: "8px",
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

    // Since data is now pre-repositioned, we can use it directly
    // Use all available data to support full timeframe slider functionality
    const framesToDraw = data;
    framesToDrawRef.current = framesToDraw;

    if (framesToDraw.length === 0) return;

    // Console log histogram's most current frame for comparison with ResoBox
    const mostCurrentFrame = framesToDraw[framesToDraw.length - 1];
    console.log("📊 Histogram Most Current Frame:", {
      timestamp: mostCurrentFrame.timestamp,
      totalFrames: framesToDraw.length,
      currentFrameBoxes: mostCurrentFrame.progressiveValues.map((b) => ({
        value: b.value,
        high: b.high,
        low: b.low,
      })),
      sortedByAbsValue: [...mostCurrentFrame.progressiveValues]
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .map((b) => ({
          value: b.value,
          high: b.high,
          low: b.low,
        })),
      largestBox: [...mostCurrentFrame.progressiveValues].sort(
        (a, b) => Math.abs(b.value) - Math.abs(a.value)
      )[0],
    });

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
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
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
        ctx.lineTo(lastPoint.x + boxSize, lastPoint.y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = LINE_COLOR;
      ctx.stroke();

      // Draw white circle at the end
      if (linePoints.length > 0) {
        const lastPoint = linePoints[linePoints.length - 1];
        ctx.beginPath();
        ctx.arc(lastPoint.x + boxSize, lastPoint.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = LINE_COLOR;
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

    // After all drawing is done, scroll to the latest data point
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
  }, []); // No dependencies needed since we use fixed 5px frame width

  // Helper function to convert hex to rgba
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
      {/* Hover tooltip */}
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

      {/* Price axis */}
      {data.length > 0 && (
        <div {...props(styles.priceAxis)}>
          {(() => {
            // Get the current/latest frame
            const currentFrame = data[data.length - 1];
            if (!currentFrame?.progressiveValues?.length) return null;

            // Get visible boxes based on offset and count
            const visibleBoxes = currentFrame.progressiveValues.slice(
              boxOffset,
              boxOffset + visibleBoxesCount
            );

            const color = "#797E86"; // Use consistent gray color

            return (
              <>
                {/* Render price lines for each visible box */}
                {visibleBoxes.map((box, index) => {
                  const boxHeight = 100 / visibleBoxesCount; // Height percentage for each box
                  const yPosition = index * boxHeight;

                  return (
                    <div key={`price-${index}`}>
                      {/* Show high price for negative boxes */}
                      {box.value < 0 && (
                        <div
                          {...props(styles.priceLine)}
                          style={{
                            position: "absolute",
                            top: `${yPosition}%`,
                          }}
                        >
                          <span {...props(styles.priceLabel)} style={{ color }}>
                            {formatPrice(box.high, "EURUSD")}
                          </span>
                        </div>
                      )}
                      {/* Show low price for positive boxes */}
                      {box.value >= 0 && (
                        <div
                          {...props(styles.priceLine)}
                          style={{
                            position: "absolute",
                            top: `${yPosition + boxHeight}%`,
                            transform: "translateY(-100%)",
                          }}
                        >
                          <div
                            {...props(styles.priceLineSeparator)}
                            style={{ backgroundColor: color }}
                          />
                          <span {...props(styles.priceLabel)} style={{ color }}>
                            {formatPrice(box.low, "EURUSD")}
                          </span>
                        </div>
                      )}
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
