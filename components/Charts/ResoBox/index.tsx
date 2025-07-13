"use client";

import { create, props } from "@/lib/styles/atomic";
import { useUser } from "@/providers/UserProvider";
import type { BoxColors } from "@/stores/colorStore";
import type { Box, BoxSlice } from "@/types/types";
import { formatPrice } from "@/utils/instruments";
import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

const styles = create({
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
    bottom: ".3rem",
    opacity: 0.9,
  },

  priceLabel: {
    position: "absolute",
    top: "-.8rem",
    right: ".4rem",
  },

  priceText: {
    fontFamily: "monospace",
    fontSize: "7px",
    color: "#ffffff",
    letterSpacing: "0.05em",
  },
});

const useBoxColors = (box: Box, boxColors: BoxColors) => {
  return useMemo(() => {
    const baseColor = box.value > 0 ? boxColors.positive : boxColors.negative;
    const opacity = boxColors.styles?.opacity ?? 0.2;
    const shadowIntensity = boxColors.styles?.shadowIntensity ?? 0.25;
    const shadowY = Math.floor(shadowIntensity);
    const shadowBlur = Math.floor(shadowIntensity * 50);
    const shadowColor = (alpha: number) => {
      return baseColor.replace(")", `, ${alpha})`);
    };

    return {
      baseColor,
      opacity,
      shadowIntensity,
      shadowY,
      shadowBlur,
      shadowColor,
    };
  }, [
    box.value,
    boxColors.positive,
    boxColors.negative,
    boxColors.styles?.opacity,
    boxColors.styles?.shadowIntensity,
  ]);
};

const useBoxStyles = (
  box: Box,
  prevBox: Box | null,
  boxColors: BoxColors,
  containerSize: number,
  index: number
) => {
  return useMemo(() => {
    const calculatedSize = containerSize * 0.86 ** index;
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
  }: {
    box: Box;
    index: number;
    prevBox: Box | null;
    boxColors: BoxColors;
    containerSize: number;
    slice: BoxSlice;
    sortedBoxes: Box[];
    pair?: string;
    showPriceLines?: boolean;
  }) => {
    const colors = useBoxColors(box, boxColors);
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
              <span {...props(styles.priceText)} style={{ color: "#797E86" }}>
                {formatPrice(box.high, pair)}
              </span>
            </div>
          </div>
        )}

        {showPriceLines && shouldShowBottomPrice && (
          <div {...props(styles.priceLineBottom)}>
            <div {...props(styles.priceLabel)}>
              <span {...props(styles.priceText)} style={{ color: "#797E86" }}>
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
          />
        )}
      </div>
    );
  }
);

ResoBoxRecursive.displayName = "ResoBoxRecursive";

export const ResoBox = memo(
  ({
    slice,
    pair = "",
    boxColors: propBoxColors,
    showPriceLines = true,
  }: {
    slice: BoxSlice;
    pair?: string;
    boxColors?: BoxColors;
    showPriceLines?: boolean;
  }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(0);
    const { boxColors: userBoxColors } = useUser();

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

    const sortedBoxes = slice.boxes.sort(
      (a, b) => Math.abs(b.value) - Math.abs(a.value)
    );

    return (
      <div ref={boxRef} {...props(styles.container)}>
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
            />
          )}
        </div>
      </div>
    );
  }
);

ResoBox.displayName = "ResoBox";
