"use client";

import { NestedBoxes } from "@/components/Charts/NestedBoxes";
import {
  BASE_VALUES,
  createDemoStep,
  createMockBoxData,
  sequences,
} from "@/components/Constants/constants";
import { create, props } from "@/lib/styles/atomic";
import type { CandleData } from "@/types/types";
import { formatPrice } from "@/utils/instruments";
import { motion } from "framer-motion";
import { memo, useEffect, useMemo, useRef, useState } from "react";

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

// Atomic CSS styles matching ResoBox approach
const styles = create({
  container: {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    userSelect: "none",
  },

  contentWrapper: {
    position: "relative",
    display: "flex",
    minHeight: "200px",
    flexDirection: "column",
    borderWidth: "0.5px",
    borderStyle: "solid",
    borderColor: "#1C1E23",
    background:
      "linear-gradient(to bottom, rgba(10, 11, 13, 0.8), rgba(7, 8, 9, 0.8))",
    borderRadius: "8px",
    zIndex: 1,
  },

  backgroundLayer: {
    position: "absolute",
    inset: 0,
    borderRadius: "8px",
    backgroundColor: "#0A0B0D",
  },

  shadowLayer: {
    position: "absolute",
    inset: 0,
    borderRadius: "8px",
  },

  innerContent: {
    position: "relative",
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "0.5rem",
    padding: "0.75rem",
    zIndex: 2,
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

  pairName: {
    fontFamily: "Russo One, monospace",
    fontSize: "0.875rem",
    fontWeight: "700",
    letterSpacing: "0.05em",
    color: "rgba(255, 255, 255, 0.9)",
    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))",
  },

  price: {
    fontFamily: "Kodemono, monospace",
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "rgba(129, 129, 129, 0.8)",
    filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3))",
  },

  chartContainer: {
    position: "relative",
    display: "flex",
    height: "100%",
    minHeight: "120px",
    width: "100%",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  chartInner: {
    position: "relative",
    width: "100%",
    height: "100%",
    aspectRatio: "1",
  },
});

const BoxVisualization = memo(
  ({ pair, candleData }: { pair: string; candleData: string }) => {
    // Default box colors from colorStore.ts
    const boxColors = {
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
    const [baseSize, setBaseSize] = useState(150);
    const [demoStep, setDemoStep] = useState(() => {
      // Create a different starting point for each pair based on its name
      const startingOffset = pair.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      return Math.abs(startingOffset) % sequences.length;
    });

    // Generate a random base interval for this pair (between 500ms and 1500ms)
    const baseInterval = useMemo(() => {
      const pairHash = pair.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      return 500 + (Math.abs(pairHash) % 1000);
    }, [pair]);

    const totalStepsRef = useRef(sequences.length);
    const nextIntervalRef = useRef<number>(baseInterval);

    // Get the latest price from candle data
    const latestPrice = useMemo(() => {
      try {
        const data = JSON.parse(candleData) as CandleData[];
        return Number.parseFloat(data[data.length - 1].mid.c);
      } catch (e) {
        return null;
      }
    }, [candleData]);

    // Memoize current slice calculation
    const currentSlice = useMemo(() => {
      const currentValues = createDemoStep(demoStep, sequences, BASE_VALUES);
      const mockBoxData = createMockBoxData(currentValues);
      return {
        timestamp: new Date().toISOString(),
        boxes: mockBoxData,
      };
    }, [demoStep]);

    useEffect(() => {
      const handleResize = () => {
        setBaseSize(window.innerWidth >= 1024 ? 180 : 140);
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      const updateStep = () => {
        setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
        // Generate next random interval (±30% of base interval)
        const variation = baseInterval * 0.3;
        nextIntervalRef.current =
          baseInterval + Math.random() * variation * 2 - variation;

        // Schedule next update
        timeoutRef.current = setTimeout(updateStep, nextIntervalRef.current);
      };

      const timeoutRef = {
        current: setTimeout(updateStep, nextIntervalRef.current),
      };

      return () => {
        clearTimeout(timeoutRef.current);
      };
    }, [baseInterval]);

    // Use computed styles matching NestedBoxes component exactly
    const computedStyles = useMemo(() => {
      const shadowIntensity = boxColors?.styles?.shadowIntensity ?? 0.4;
      const opacity = boxColors?.styles?.opacity ?? 0.71;
      const shadowBlur = Math.floor(shadowIntensity * 30);

      // Helper function to convert hex to rgba (matching NestedBoxes)
      const hexToRgba = (hex: string, alpha: number) => {
        if (!hex || hex.length < 7) return `rgba(100, 100, 100, ${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      return {
        shadowBlur,
        boxShadow: `0 ${Math.floor(shadowIntensity * 4)}px ${shadowBlur}px rgba(0, 0, 0, 0.25)`,
        insetShadow: `inset 0 1px ${shadowBlur / 2}px rgba(255, 255, 255, 0.05)`,
        hexToRgba,
        opacity,
      };
    }, [boxColors?.styles?.shadowIntensity, boxColors?.styles?.opacity]);

    return (
      <div {...props(styles.container)}>
        <div
          {...props(styles.contentWrapper)}
          style={{ boxShadow: computedStyles.boxShadow }}
        >
          {/* Background layer */}
          <div {...props(styles.backgroundLayer)} />

          {/* Shadow layer */}
          <div
            {...props(styles.shadowLayer)}
            style={{ boxShadow: computedStyles.insetShadow }}
          />

          <div {...props(styles.innerContent)}>
            {/* Header section */}
            <div {...props(styles.header)}>
              <div {...props(styles.headerRow)}>
                <div className="flex items-center gap-4">
                  <div {...props(styles.pairName)}>
                    {pair.replace("_", "/")}
                  </div>
                  <div {...props(styles.price)}>
                    {latestPrice ? formatPrice(latestPrice, pair) : "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div {...props(styles.chartContainer)}>
              <div
                {...props(styles.chartInner)}
                style={{ height: `${baseSize}px`, width: `${baseSize}px` }}
              >
                {currentSlice && currentSlice.boxes.length > 0 && (
                  <NestedBoxes
                    boxes={currentSlice.boxes.sort(
                      (a, b) => Math.abs(b.value) - Math.abs(a.value)
                    )}
                    demoStep={demoStep}
                    isPaused={false}
                    baseSize={baseSize}
                    boxColors={boxColors}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BoxVisualization.displayName = "BoxVisualization";

export const PatternDisplay = memo(
  ({ marketData }: { marketData: MarketData[] }) => {
    return (
      <div className="h-full">
        <div className="grid h-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {marketData.map((item) => (
            <BoxVisualization
              key={item.pair}
              pair={item.pair}
              candleData={item.candleData}
            />
          ))}
        </div>
      </div>
    );
  }
);

PatternDisplay.displayName = "PatternDisplay";
