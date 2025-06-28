"use client";

import { ResoBox } from "@/components/Charts/ResoBox";
import { ResoBox3D } from "@/components/Charts/ResoBox/ResoBox3D";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import type { BoxColors } from "@/stores/colorStore";
import { useTimeframeStore } from "@/stores/timeframeStore";
import type { BoxSlice } from "@/types/types";
import { formatPrice } from "@/utils/instruments";
import { create, props, keyframes } from "@/lib/styles/atomic";
import React, { useCallback, useMemo } from "react";

// Atomic CSS styles using our custom system
const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

const glowPulse = keyframes({
  "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
  "50%": { opacity: 0.8, transform: "scale(1.02)" },
});

const styles = create({
  container: {
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
    borderRadius: "12px",
    overflow: "hidden",
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
  const settings = useTimeframeStore(
    useCallback(
      (state) =>
        pair ? state.getSettingsForPair(pair) : state.global.settings,
      [pair]
    )
  );

  const currentPrice = pair ? priceData[pair]?.price : null;

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
  }, [boxSlice, settings.startIndex, settings.maxBoxCount]);

  const showChart = !isLoading && filteredBoxSlice;
  const showPriceLines =
    boxColors?.styles?.viewMode !== "3d" && settings.showPriceLines;

  return (
    <div {...props(styles.container)}>
      {/* Green glow effect when there are active patterns */}
      {activePatterns.length > 0 && (
        <>
          {/* Outer glow with pulse animation - much more prominent */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse, #4EFF6E35, #4EFF6E20 50%, transparent 80%)",
              borderRadius: "12px",
              filter: "blur(25px)",
              animationName: glowPulse,
              animationDuration: "3s",
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
            }}
          />
          {/* Inner glow - brighter */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse, #4EFF6E25, #4EFF6E15 40%, transparent 70%)",
              borderRadius: "12px",
              filter: "blur(15px)",
            }}
          />
          {/* Border glow - much more visible */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              border: "1px solid #4EFF6E40",
              borderRadius: "12px",
              boxShadow: "0 0 30px #4EFF6E25, inset 0 0 30px #4EFF6E15",
            }}
          />
          {/* Additional inner highlight */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(135deg, #4EFF6E08, transparent 30%, transparent 70%, #4EFF6E08)",
              borderRadius: "12px",
            }}
          />
        </>
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
              ) : (
                <div {...props(styles.chartInner)}>
                  <div {...props(styles.chartOverlay)} />
                  <ResoBox
                    slice={filteredBoxSlice}
                    className="h-full w-full"
                    boxColors={boxColors}
                    pair={pair}
                    showPriceLines={settings.showPriceLines}
                    activePatterns={activePatterns}
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
};
