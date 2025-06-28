import type { BoxColors, BoxSlice } from "@/types/types";
import { formatPrice } from "@/utils/instruments";
import { create, props } from "@/lib/styles/atomic";
import type React from "react";
import { useMemo } from "react";

// Atomic CSS styles for PriceAxis
const styles = create({
  container: {
    pointerEvents: "none",
    position: "absolute",
    insetBlock: 0,
    right: 0,
    display: "flex",
    width: "4rem",
    userSelect: "none",
  },

  innerContainer: {
    position: "relative",
    flex: 1,
  },

  tickContainer: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
  },

  tickLine: {
    width: "1rem",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    opacity: 0.9,
  },

  tickLabel: {
    marginLeft: "0.25rem",
    fontFamily: "Kodemono, monospace",
    fontSize: "9px",
    letterSpacing: "0.05em",
    textShadow: "0 0 3px rgba(0,0,0,0.6)",
  },
});

interface PriceAxisProps {
  slice: BoxSlice;
  pair: string;
  boxColors: BoxColors;
}

export const PriceAxis: React.FC<PriceAxisProps> = ({
  slice,
  pair,
  boxColors,
}) => {
  // Guard
  if (!slice || !slice.boxes || slice.boxes.length === 0) return null;

  const { highest, lowest, mid } = useMemo(() => {
    const highs = slice.boxes.map((b) => b.high);
    const lows = slice.boxes.map((b) => b.low);
    const highest = Math.max(...highs);
    const lowest = Math.min(...lows);
    const mid = (highest + lowest) / 2;
    return { highest, lowest, mid };
  }, [slice]);

  // Prepare three ticks: high, mid, low
  const ticks = [
    { price: highest, color: boxColors.positive },
    { price: mid, color: "rgba(255,255,255,0.5)" },
    {
      price: lowest,
      color: boxColors.negative.replace("#", "#") || "rgba(255,255,255,0.5)",
    },
  ];

  const range = highest - lowest || 1; // prevent /0

  return (
    <div {...props(styles.container)}>
      <div {...props(styles.innerContainer)}>
        {ticks.map(({ price, color }) => {
          const pct = ((highest - price) / range) * 100;
          return (
            <div
              key={price}
              {...props(styles.tickContainer)}
              style={{ top: `calc(${pct}% - 0.5px)` }}
            >
              <div {...props(styles.tickLine)} style={{ borderColor: color }} />
              <span {...props(styles.tickLabel)} style={{ color }}>
                {formatPrice(price, pair)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
