"use client";

import { useUser } from "@/providers/UserProvider";
import type { BoxColors } from "@/stores/colorStore";
import type { Box, BoxSlice } from "@/types/types";
import { INSTRUMENTS, formatPrice } from "@/utils/instruments";
import { create, props } from "@/lib/styles/atomic";
import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

// Atomic CSS styles
const styles = create({
  // Main container styles
  container: {
    position: "relative",
    aspectRatio: "1",
    height: "100%",
    width: "100%",
  },

  innerContainer: {
    position: "relative",
    height: "100%",
    width: "100%",
  },

  // Box styles
  boxContainer: {
    position: "absolute",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#000000",
  },

  backgroundLayer: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#000000",
  },

  shadowLayer: {
    position: "absolute",
    inset: 0,
  },

  gradientLayer: {
    position: "absolute",
    inset: 0,
  },

  // Price line styles
  priceLineTop: {
    position: "absolute",
    top: 0,
    right: "-3rem",
    borderStyle: "dashed",
    opacity: 0.9,
  },

  priceLineBottom: {
    position: "absolute",
    right: "-3rem",
    bottom: 0,
    opacity: 0.9,
  },

  priceLabel: {
    position: "absolute",
    top: "-0.875rem",
    right: 0,
  },

  priceText: {
    fontFamily: "Kodemono, monospace",
    fontSize: "8px",
    color: "#ffffff",
    letterSpacing: "0.05em",
  },
});

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Helper function to brighten a color (hex or rgb)
const brightenColor = (color: string, factor: number = 2.0) => {
  // Handle hex colors
  if (color.startsWith("#")) {
    const rgb = hexToRgb(color);
    if (rgb) {
      const newR = Math.min(255, Math.floor(rgb.r * factor));
      const newG = Math.min(255, Math.floor(rgb.g * factor));
      const newB = Math.min(255, Math.floor(rgb.b * factor));
      return `rgb(${newR}, ${newG}, ${newB})`;
    }
  }

  // Handle rgb colors
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const newR = Math.min(255, Math.floor(parseInt(rgbMatch[1]) * factor));
    const newG = Math.min(255, Math.floor(parseInt(rgbMatch[2]) * factor));
    const newB = Math.min(255, Math.floor(parseInt(rgbMatch[3]) * factor));
    return `rgb(${newR}, ${newG}, ${newB})`;
  }

  return color; // Return original if can't parse
};

// Optimized color computation with pattern highlighting
const useBoxColors = (
  box: Box,
  boxColors: BoxColors,
  activePatterns: number[] = []
) => {
  return useMemo(() => {
    const baseColor = box.value > 0 ? boxColors.positive : boxColors.negative;
    const isInPattern = activePatterns.includes(box.value);

    // Use bright red for pattern boxes to make them obvious
    const finalColor = isInPattern
      ? "rgb(255, 50, 50)" // Bright red for pattern boxes
      : baseColor;

    const opacity =
      (boxColors.styles?.opacity ?? 0.2) * (isInPattern ? 3.0 : 1); // Triple opacity for patterns
    const shadowIntensity =
      (boxColors.styles?.shadowIntensity ?? 0.25) * (isInPattern ? 3.0 : 1); // Much stronger shadow
    const shadowY = Math.floor(shadowIntensity);
    const shadowBlur = Math.floor(shadowIntensity * 50);
    const shadowColor = (alpha: number) => {
      // For pattern boxes, use red shadows
      if (isInPattern) {
        return `rgba(255, 50, 50, ${alpha})`;
      }
      return finalColor.replace(")", `, ${alpha})`);
    };

    return {
      baseColor: finalColor,
      opacity: Math.min(1, opacity), // Cap at 1
      shadowIntensity,
      shadowY,
      shadowBlur,
      shadowColor,
      isInPattern,
    };
  }, [
    box.value,
    boxColors.positive,
    boxColors.negative,
    boxColors.styles?.opacity,
    boxColors.styles?.shadowIntensity,
    activePatterns,
  ]);
};

// Optimized style computation
const useBoxStyles = (
  box: Box,
  prevBox: Box | null,
  boxColors: BoxColors,
  containerSize: number,
  index: number
) => {
  return useMemo(() => {
    const calculatedSize = containerSize * 0.83 ** index;
    const isFirstDifferent =
      prevBox &&
      ((box.value > 0 && prevBox.value < 0) ||
        (box.value < 0 && prevBox.value > 0));

    const positionStyle = !prevBox
      ? { top: 0, right: 0 }
      : isFirstDifferent
        ? prevBox.value > 0
          ? { top: 0, right: 0 }
          : { bottom: 0, right: 0 }
        : box.value < 0
          ? { bottom: 0, right: 0 }
          : { top: 0, right: 0 };

    const baseStyles: React.CSSProperties = {
      width: `${calculatedSize}px`,
      height: `${calculatedSize}px`,
      ...positionStyle,
      margin: boxColors.styles?.showBorder ? "-1px" : "0",
      borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
      borderWidth: boxColors.styles?.showBorder ? "1px" : "0",
    };

    return { baseStyles, isFirstDifferent };
  }, [box, prevBox, boxColors.styles, containerSize, index]);
};

interface BoxProps {
  box: Box;
  index: number;
  prevBox: Box | null;
  boxColors: BoxColors;
  containerSize: number;
  slice: BoxSlice;
  sortedBoxes: Box[];
  pair?: string;
  showPriceLines?: boolean;
  activePatterns?: number[];
}

// Recursive component for nested boxes with atomic CSS
const ResoBoxRecursive = memo(
  ({
    box,
    index,
    prevBox,
    boxColors,
    containerSize,
    slice,
    sortedBoxes,
    pair,
    showPriceLines = true,
    activePatterns = [],
  }: BoxProps) => {
    const colors = useBoxColors(box, boxColors, activePatterns);
    const { baseStyles, isFirstDifferent } = useBoxStyles(
      box,
      prevBox,
      boxColors,
      containerSize,
      index
    );

    const isConsecutivePositive =
      prevBox?.value > 0 && box.value > 0 && !isFirstDifferent;
    const isConsecutiveNegative =
      prevBox?.value < 0 && box.value < 0 && !isFirstDifferent;

    // Only show price lines for largest box and first different boxes when we have more than 15 boxes
    const shouldLimitPriceLines = sortedBoxes.length > 18;
    const shouldShowTopPrice =
      (!isFirstDifferent || (isFirstDifferent && box.value > 0)) &&
      (!shouldLimitPriceLines || isFirstDifferent || index === 0) &&
      !isConsecutivePositive;
    const shouldShowBottomPrice =
      (!isFirstDifferent || (isFirstDifferent && box.value < 0)) &&
      (!shouldLimitPriceLines || isFirstDifferent || index === 0) &&
      !isConsecutiveNegative;

    return (
      <div
        key={`${slice.timestamp}-${index}`}
        {...props(styles.boxContainer)}
        style={baseStyles}
      >
        {/* Black background layer */}
        <div
          {...props(styles.backgroundLayer)}
          style={{
            borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
          }}
        />

        <div
          {...props(styles.shadowLayer)}
          style={{
            borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
            boxShadow: `inset 0 ${colors.shadowY}px ${colors.shadowBlur}px ${colors.shadowColor(colors.shadowIntensity)}`,
          }}
        />

        <div
          {...props(styles.gradientLayer)}
          style={{
            borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
            background: `linear-gradient(to bottom right, ${colors.baseColor.replace(")", `, ${colors.opacity}`)} 100%, transparent 100%)`,
            opacity: colors.opacity,
          }}
        />
        {showPriceLines && shouldShowTopPrice && (
          <div {...props(styles.priceLineTop)}>
            <div {...props(styles.priceLabel)}>
              <span
                {...props(styles.priceText)}
                style={{ color: colors.baseColor }}
              >
                {formatPrice(box.high, pair)}
              </span>
            </div>
          </div>
        )}

        {showPriceLines && shouldShowBottomPrice && (
          <div {...props(styles.priceLineBottom)}>
            <div {...props(styles.priceLabel)}>
              <span
                {...props(styles.priceText)}
                style={{ color: colors.baseColor }}
              >
                {formatPrice(box.low, pair)}
              </span>
            </div>
          </div>
        )}

        {index < sortedBoxes.length - 1 && (
          <ResoBoxRecursive
            box={sortedBoxes[index + 1]}
            index={index + 1}
            prevBox={box}
            boxColors={boxColors}
            containerSize={containerSize}
            slice={slice}
            sortedBoxes={sortedBoxes}
            pair={pair}
            showPriceLines={showPriceLines}
            activePatterns={activePatterns}
          />
        )}
      </div>
    );
  }
);

ResoBoxRecursive.displayName = "ResoBoxRecursive";

interface ResoBoxProps {
  slice: BoxSlice;
  className?: string;
  pair?: string;
  boxColors?: BoxColors;
  showPriceLines?: boolean;
  activePatterns?: number[];
}

// Main ResoBox component with atomic CSS
export const ResoBox = memo(
  ({
    slice,
    className = "",
    pair = "",
    boxColors: propBoxColors,
    showPriceLines = true,
    activePatterns = [],
  }: ResoBoxProps) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(0);
    const { boxColors: userBoxColors } = useUser();

    // Merge boxColors from props with userBoxColors, preferring props
    const mergedBoxColors = useMemo(() => {
      if (!propBoxColors) return userBoxColors;
      return {
        ...userBoxColors,
        ...propBoxColors,
        styles: {
          ...userBoxColors.styles,
          ...propBoxColors.styles,
        },
      };
    }, [propBoxColors, userBoxColors]);

    useEffect(() => {
      if (!boxRef.current) return;

      const element = boxRef.current;
      const observer = new ResizeObserver((entries) => {
        if (!entries[0]) return;
        const rect = entries[0].contentRect;
        setContainerSize(Math.min(rect.width, rect.height));
      });

      observer.observe(element);
      return () => observer.disconnect();
    }, []);

    if (!slice?.boxes || slice.boxes.length === 0) {
      return null;
    }

    const sortedBoxes = slice.boxes.sort(
      (a, b) => Math.abs(b.value) - Math.abs(a.value)
    );

    return (
      <div
        ref={boxRef}
        {...props(styles.container)}
        style={{
          // Merge any additional className styles if needed
          ...(className ? {} : {}),
        }}
      >
        <div {...props(styles.innerContainer)}>
          {sortedBoxes.length > 0 && (
            <ResoBoxRecursive
              box={sortedBoxes[0]}
              index={0}
              prevBox={null}
              boxColors={mergedBoxColors}
              containerSize={containerSize}
              slice={slice}
              sortedBoxes={sortedBoxes}
              pair={pair}
              showPriceLines={showPriceLines}
              activePatterns={activePatterns}
            />
          )}
        </div>
      </div>
    );
  }
);

ResoBox.displayName = "ResoBox";
