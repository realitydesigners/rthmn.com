"use client";

import { ResoBox } from "@/components/Charts/ResoBox";
import { ResoBox3D } from "@/components/Charts/ResoBox/ResoBox3D";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { useSubscription } from "@/hooks/useSubscription";
import { create, keyframes, props } from "@/lib/styles/atomic";
import { useWebSocket } from "@/providers/WebsocketProvider";
import type { BoxColors } from "@/stores/colorStore";
import { useTimeframeStore } from "@/stores/timeframeStore";
import type { BoxSlice } from "@/types/types";
import { formatPrice } from "@/utils/instruments";
import { motion } from "framer-motion";
import React, { useCallback, useMemo } from "react";
import { FaBell } from "react-icons/fa";
import PairMiniHistogram from "@/components/Dashboard/PairMiniHistogram";

// Atomic CSS styles using our custom system
const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

const glowPulse = keyframes({
  "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
  "50%": { opacity: 0.8, transform: "scale(1.02)" },
});

const shimmer = keyframes({
  "0%": { transform: "translateX(-100%)" },
  "100%": { transform: "translateX(100%)" },
});

const styles = create({
  container: {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#0A0B0D",
    userSelect: "none",
  },

  contentWrapper: {
    position: "relative",
    display: "flex",
    minHeight: "250px",
    flexDirection: "column",
    borderWidth: "0.5px",
    borderStyle: "solid",
    borderColor: "#1C1E23",
    background:
      "linear-gradient(to bottom, rgba(10, 11, 13, 0.8), rgba(4, 5, 5, 0.8))",
    zIndex: 1,
  },

  innerContent: {
    position: "relative",
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "0.5rem",
    padding: "1rem",
  },

  header: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
  },

  headerRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },

  pairName: {
    fontFamily: "Russo One, monospace",
    fontSize: "1.125rem",
    fontWeight: "700",
    letterSpacing: "0.05em",
    color: "rgba(255, 255, 255, 0.9)",
    filter: "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))",
  },

  price: {
    fontFamily: "Kodemono, monospace",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
  },

  chartContainer: {
    position: "relative",
    display: "flex",
    height: "100%",
    minHeight: "100px",
    width: "100%",
    flexGrow: 1,
    padding: 0,
  },

  chartContainerWithPriceLines: {
    paddingRight: "3rem",
  },

  chartInner: {
    position: "relative",
    height: "100%",
    width: "100%",
    aspectRatio: "1",
  },

  chartOverlay: {
    position: "absolute",
    inset: 0,
  },

  timeframeSection: {
    position: "relative",
    height: "5rem",
    width: "100%",
    flexShrink: 0,
  },

  timeframeSeparator: {
    position: "absolute",
    insetInlineStart: 0,
    insetInlineEnd: 0,
    top: 0,
    height: "1px",
    background: "linear-gradient(to right, transparent, #1C1E23, transparent)",
  },

  textSkeleton: {
    animationName: pulse,
    animationDuration: "2s",
    animationIterationCount: "infinite",
    borderRadius: "0.25rem",
    backgroundColor: "#0F1012",
    height: "1rem",
    width: "4rem",
  },

  chartSkeleton: {
    aspectRatio: "1",
    height: "100%",
    width: "100%",
    animationName: pulse,
    animationDuration: "2s",
    animationIterationCount: "infinite",
    borderRadius: "0.25rem",
    backgroundColor: "#0F1012",
  },
});

interface PairResoBoxProps {
  pair?: string;
  boxSlice?: BoxSlice;
  boxColors?: BoxColors;
  isLoading?: boolean;
  activePatterns?: number[];
}

// Atomic CSS-powered skeleton components
const TextSkeleton = ({ size = "small" }: { size?: "small" }) => (
  <div {...props(styles.textSkeleton)} />
);

const ChartSkeleton = () => <div {...props(styles.chartSkeleton)} />;

export const PairResoBox = ({
  pair,
  boxSlice,
  boxColors,
  isLoading,
  activePatterns = [],
}: PairResoBoxProps) => {
  const { priceData } = useWebSocket();
  const { isSubscribed } = useSubscription();
  const settings = useTimeframeStore(
    useCallback(
      (state) =>
        pair ? state.getSettingsForPair(pair) : state.global.settings,
      [pair]
    )
  );

  const currentPrice = pair ? priceData[pair]?.price : null;

  // Pattern type and colors logic (similar to SignalAlerts)
  const getPatternType = (pattern: number[]) => {
    if (pattern.length === 1) {
      return pattern[0] > 0 ? "Buy" : "Sell";
    }
    const positive = pattern.filter((p) => p > 0).length;
    const negative = pattern.filter((p) => p < 0).length;

    if (positive > negative) return "Buy";
    if (negative > positive) return "Sell";
    return "Mixed";
  };

  const getPatternColors = (pattern: number[]) => {
    const type = getPatternType(pattern);
    switch (type) {
      case "Buy":
        return {
          background: "linear-gradient(180deg, #1A2B1A -10.71%, #0F1514 100%)",
          border: "#4EFF6E",
          glow: "rgba(78, 255, 110, 0.2)",
        };
      case "Sell":
        return {
          background: "linear-gradient(180deg, #2B1A1A -10.71%, #15100F 100%)",
          border: "#FF6E4E",
          glow: "rgba(255, 110, 78, 0.2)",
        };
      default:
        return {
          background: "linear-gradient(180deg, #2B2A1A -10.71%, #15140F 100%)",
          border: "#FFE64E",
          glow: "rgba(255, 230, 78, 0.2)",
        };
    }
  };

  const patternColors =
    activePatterns.length > 0 ? getPatternColors(activePatterns) : null;

  // Memoize the filtered boxes based on timeframe settings
  const filteredBoxSlice = useMemo(() => {
    if (!boxSlice?.boxes) return undefined;

    return {
      ...boxSlice,
      boxes:
        boxSlice.boxes.slice(
          settings.startIndex,
          settings.startIndex + settings.maxBoxCount
        ) || [],
    };
  }, [boxSlice, settings.startIndex, settings.maxBoxCount, pair]);

  const showChart = !isLoading && filteredBoxSlice;
  const showPriceLines =
    boxColors?.styles?.viewMode !== "3d" && settings.showPriceLines;

  const pairBoxContent = (
    <div {...props(styles.container)}>
      {/* Dynamic gradient effect when there are active patterns */}
      {isSubscribed && activePatterns.length > 0 && patternColors && (
        <>
          {/* Background gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-0 "
            style={{
              background: patternColors.background,
              opacity: 0.6,
            }}
          />

          {/* Border glow effect */}
          <div
            className="absolute inset-0 pointer-events-none z-0 "
            style={{
              boxShadow: `inset 0 0 50px ${patternColors.glow}, 0 0 20px ${patternColors.glow}`,
              border: `1px solid ${patternColors.border}40`,
            }}
          />

          {/* Shimmer effect */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-30"
            style={{
              background: `linear-gradient(90deg, transparent, ${patternColors.border}40, transparent)`,
              animationName: shimmer,
              animationDuration: "2s",
              animationIterationCount: "infinite",
            }}
          />
        </>
      )}

      {/* Signal Bell Icon Emblem */}
      {isSubscribed && activePatterns.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-md border border-[#32353C] bg-[#1A1D22] shadow-lg">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 2,
              }}
            >
              <FaBell className="w-3 h-3 text-white" />
            </motion.div>
          </div>
        </div>
      )}

      <div {...props(styles.contentWrapper)}>
        <div {...props(styles.innerContent)}>
          {/* Header section */}
          <div {...props(styles.header)}>
            <div {...props(styles.headerRow)}>
              <div {...props(styles.headerLeft)}>
                <div {...props(styles.pairName)}>{pair?.toUpperCase()}</div>
                {isLoading || !currentPrice ? (
                  <TextSkeleton size="small" />
                ) : (
                  <div {...props(styles.price)}>
                    {formatPrice(currentPrice, pair)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div
            {...props(
              styles.chartContainer,
              showPriceLines && styles.chartContainerWithPriceLines
            )}
          >
            <div {...props(styles.chartOverlay)} />
            {showChart ? (
              boxColors?.styles?.viewMode === "3d" ? (
                <div {...props(styles.chartInner)}>
                  <div {...props(styles.chartOverlay)} />
                  <ResoBox3D
                    slice={filteredBoxSlice}
                    pair={pair}
                    boxColors={boxColors}
                  />
                </div>
              ) : boxColors?.styles?.viewMode === "histogram" ? (
                <div {...props(styles.chartInner)}>
                  <div {...props(styles.chartOverlay)} />
                  <PairMiniHistogram
                    pair={pair}
                    boxSlice={boxSlice}
                    boxColors={boxColors}
                    isLoading={isLoading}
                    histogramData={[]} // You'll need to pass the actual histogram data here
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div {...props(styles.chartInner)}>
                  <div {...props(styles.chartOverlay)} />
                  <ResoBox
                    slice={filteredBoxSlice}
                    boxColors={boxColors}
                    pair={pair}
                    showPriceLines={settings.showPriceLines}
                  />
                </div>
              )
            ) : (
              <ChartSkeleton />
            )}
          </div>

          {/* Timeframe Control */}
          <div {...props(styles.timeframeSection)}>
            <div {...props(styles.timeframeSeparator)} />
            <TimeFrameSlider showPanel={false} pair={pair} />
          </div>
        </div>
      </div>
    </div>
  );

  // Show content directly - upgrade prompts handled by main banner
  return pairBoxContent;
};
