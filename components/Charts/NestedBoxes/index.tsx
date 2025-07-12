import type { Box } from "@/types/types";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useMemo } from "react";

interface NestedBoxesProps {
  boxes: Box[];
  demoStep?: number;
  isPaused?: boolean;
  isPointOfChange?: boolean;
  maxSize?: number;
  baseSize?: number;
  colorScheme?: "blue-red" | "white-gradient";
  showLabels?: boolean;
  mode?: "animated" | "static";
  containerClassName?: string;
  showPriceLines?: boolean;
  boxColors?: {
    positive?: string;
    negative?: string;
    styles?: {
      opacity?: number;
      shadowIntensity?: number;
      borderRadius?: number;
      showBorder?: boolean;
    };
  };
}

const defaultColors = {
  positive: "#24FF66", // Matrix green
  negative: "#303238", // Dark gray
  styles: {
    borderRadius: 4,
    shadowIntensity: 0.4,
    opacity: 0.71,
    showBorder: true,
    globalTimeframeControl: false,
    showLineChart: false,
    perspective: false,
    viewMode: "default",
  },
};

export const NestedBoxes = ({
  boxes,
  demoStep = 0,
  isPaused = false,
  isPointOfChange = false,
  maxSize: providedMaxSize,
  baseSize = 400,
  showLabels = false,
  mode = "animated",
  containerClassName = "",
  showPriceLines = false,
  boxColors: propBoxColors,
}: NestedBoxesProps) => {
  if (!boxes || boxes.length === 0) return null;

  const calculatedMaxSize = useMemo(
    () => Math.max(...boxes.map((b) => Math.abs(b.value)), 1),
    [boxes]
  );
  const maxSize = providedMaxSize || calculatedMaxSize;

  const stylesConfig = { ...defaultColors.styles, ...propBoxColors?.styles };
  const colors = {
    positive: propBoxColors?.positive || defaultColors.positive,
    negative: propBoxColors?.negative || defaultColors.negative,
    styles: stylesConfig,
  };

  const renderBox = (box: Box, index: number, prevBox: Box | null = null) => {
    const isFirstDifferent =
      prevBox &&
      ((prevBox.value > 0 && box.value < 0) ||
        (prevBox.value < 0 && box.value > 0));

    const boxStyles = useMemo(() => {
      const baseColor = box.value > 0 ? colors.positive : colors.negative;
      const opacity = colors.styles.opacity;
      const shadowIntensity = colors.styles.shadowIntensity;
      const shadowY = Math.floor(shadowIntensity);
      const shadowBlur = Math.floor(shadowIntensity * 50);

      // ResoBox color helper function
      const shadowColor = (alpha: number) => {
        return baseColor.replace(")", `, ${alpha})`);
      };

      return {
        baseColor,
        opacity,
        shadowColor,
        borderRadius: `${colors.styles.borderRadius}px`,
        shadowIntensity,
        shadowY,
        shadowBlur,
      };
    }, [
      box.value,
      colors.positive,
      colors.negative,
      colors.styles.opacity,
      colors.styles.shadowIntensity,
      colors.styles.borderRadius,
    ]);

    const size = (Math.abs(box.value) / maxSize) * baseSize;

    const basePosition = prevBox
      ? isFirstDifferent
        ? prevBox.value > 0
          ? { top: 0, right: 0 }
          : { bottom: 0, right: 0 }
        : box.value > 0
          ? { top: 0, right: 0 }
          : { bottom: 0, right: 0 }
      : { top: 0, right: 0 };

    const style: CSSProperties = {
      width: `${size}px`,
      height: `${size}px`,
      ...basePosition,
      margin: colors.styles.showBorder ? "-1px" : "0",
      borderRadius: boxStyles.borderRadius,
      transition: "all 0.15s ease-out",
      ...(mode === "animated" && isPaused
        ? {
            transform: `translateX(${index * 5}px) translateY(${index * -5}px) rotateX(0deg) rotateY(0deg) `,
            transition: "all 1.2s cubic-bezier(0.8, 0, 0.2, 1)",
          }
        : {}),
      opacity: 1,
    };

    return (
      <div
        key={`box-${index}-${box.value}`}
        className="absolute"
        style={{
          ...style,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#000000",
        }}
      >
        {/* Black background layer - matching ResoBox */}
        <div
          className="absolute inset-0 bg-black"
          style={{
            borderRadius: boxStyles.borderRadius,
          }}
        />

        {/* Shadow layer - matching ResoBox */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: boxStyles.borderRadius,
            boxShadow: `inset 0 ${boxStyles.shadowY}px ${boxStyles.shadowBlur}px ${boxStyles.shadowColor(boxStyles.shadowIntensity)}`,
          }}
        />

        {/* Gradient layer - matching ResoBox */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: boxStyles.borderRadius,
            background: `linear-gradient(to bottom right, ${boxStyles.baseColor.replace(")", `, ${boxStyles.opacity}`)} 100%, transparent 100%)`,
            opacity: boxStyles.opacity,
          }}
        />

        {showLabels && (
          <div
            className={`absolute -right-20 flex items-center ${box.value > 0 ? "-bottom-[5px]" : "-top-[5px]"}`}
          >
            <div
              className="h-[1px] w-8"
              style={{ backgroundColor: boxStyles.baseColor }}
            ></div>
            <div
              className="ml-2 font-mono text-[12px]"
              style={{ color: boxStyles.baseColor }}
            >
              {Math.abs(box.value)}
            </div>
          </div>
        )}

        {index < boxes.length - 1 &&
          renderBox(boxes[index + 1], index + 1, box)}
      </div>
    );
  };

  const containerStyle: React.CSSProperties =
    mode === "animated"
      ? { perspective: "1500px", transformStyle: "preserve-3d" }
      : {};

  const animationVariants = {
    paused: {
      translateX: -90,
      translateY: 90,
      rotateX: 60,
      rotateY: 0,
      rotateZ: -45,
    },
    playing: {
      translateX: 0,
      translateY: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
    },
  };

  const animationTransition = {
    duration: 0.8,
    ease: [0.8, 0, 0.2, 1],
  };

  return (
    <div
      className={`relative min-h-[200px] w-full ${containerClassName}`}
      style={containerStyle}
    >
      <motion.div
        style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}
        variants={animationVariants}
        animate={isPaused ? "paused" : "playing"}
        transition={animationTransition}
      >
        {renderBox(boxes[0], 0)}
      </motion.div>
    </div>
  );
};
