"use client";

import type { CandleData } from "@/types/types";
import { motion } from "framer-motion";
import { useState } from "react";

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface SectionMarketDisplayProps {
  marketData: MarketData[];
}

export function MarketDisplay({ marketData }: SectionMarketDisplayProps) {
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  // Sort pairs alphabetically
  const sortedPairs = [...marketData].sort((a, b) =>
    a.pair.localeCompare(b.pair)
  );

  const getLatestPrice = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      return Number.parseFloat(data[data.length - 1].mid.c);
    } catch (e) {
      return null;
    }
  };

  const getPriceChange = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const firstPrice = Number.parseFloat(data[0].mid.o);
      const lastPrice = Number.parseFloat(data[data.length - 1].mid.c);
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      return change;
    } catch (e) {
      return null;
    }
  };

  const getVolume = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      return data[data.length - 1].volume;
    } catch (e) {
      return null;
    }
  };

  const getDayHighLow = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const highPrices = data.map((candle) => Number.parseFloat(candle.mid.h));
      const lowPrices = data.map((candle) => Number.parseFloat(candle.mid.l));
      return {
        high: Math.max(...highPrices),
        low: Math.min(...lowPrices),
      };
    } catch (e) {
      return null;
    }
  };

  const getSparklinePoints = (
    candleData: string,
    width: number,
    height: number
  ) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const prices = data.map((d) => Number.parseFloat(d.mid.c));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const range = max - min;

      // Create points for the sparkline
      return prices
        .map((price, i) => {
          const x = (i / (prices.length - 1)) * width;
          const y = height - ((price - min) / range) * height;
          return `${x},${y}`;
        })
        .join(" ");
    } catch (e) {
      return null;
    }
  };

  return (
    <section className="relative z-100">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedPairs.map((item) => {
          const latestPrice = getLatestPrice(item.candleData);
          const priceChange = getPriceChange(item.candleData);
          const volume = getVolume(item.candleData);

          return (
            <motion.div
              key={item.pair}
              className="group relative cursor-pointer rounded-lg p-4 transition-colors overflow-hidden"
              onClick={() => setSelectedPair(item.pair)}
              style={{
                background:
                  "linear-gradient(180deg, #0A0B0D -10.71%, #070809 100%)",
                borderColor: "#111215",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Hover effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
                  borderRadius: "8px",
                }}
              />

              <div className="relative z-10">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-russo text-lg font-medium text-white">
                      {item.pair.replace("_", "/")}
                    </h4>
                  </div>
                  <span
                    className={`font-kodemono text-xs ${
                      priceChange && priceChange >= 0
                        ? "text-[#4EFF6E]"
                        : "text-[#FF6B6B]"
                    }`}
                  >
                    {priceChange ? `${priceChange.toFixed(2)}%` : "N/A"}
                  </span>
                </div>
                <div className="font-kodemono mb-2 text-2xl font-bold text-white">
                  {latestPrice
                    ? latestPrice.toFixed(item.pair.includes("JPY") ? 3 : 5)
                    : "N/A"}
                </div>
                {getDayHighLow(item.candleData) && (
                  <div className="font-kodemono mb-6 flex justify-between text-xs text-[#818181]">
                    <span>
                      High:{" "}
                      {getDayHighLow(item.candleData)?.high.toFixed(
                        item.pair.includes("JPY") ? 3 : 5
                      )}
                    </span>
                    <span>
                      Low:{" "}
                      {getDayHighLow(item.candleData)?.low.toFixed(
                        item.pair.includes("JPY") ? 3 : 5
                      )}
                    </span>
                  </div>
                )}
                <div className="mb-2 h-16 w-full">
                  {getSparklinePoints(item.candleData, 200, 60) && (
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 200 60"
                      preserveAspectRatio="none"
                      className="overflow-visible"
                    >
                      <polyline
                        points={
                          getSparklinePoints(item.candleData, 200, 60) || ""
                        }
                        fill="none"
                        stroke={
                          getPriceChange(item.candleData) >= 0
                            ? "#4EFF6E"
                            : "#FF6B6B"
                        }
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
