"use client";

import type { CandleData } from "@/types/types";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface PairSliderProps {
  marketData: MarketData[];
  selectedPair: string;
  onPairSelect: (pair: string) => void;
}

export function PairSlider({
  marketData,
  selectedPair,
  onPairSelect,
}: PairSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      const nextIndex = Math.min(activeIndex + 1, marketData.length - 1);
      handleIndexChange(nextIndex);
    },
    onSwipedDown: () => {
      const prevIndex = Math.max(activeIndex - 1, 0);
      handleIndexChange(prevIndex);
    },
    trackMouse: true,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    delta: 50,
  });

  const handleIndexChange = (index: number) => {
    setActiveIndex(index);
    onPairSelect(marketData[index].pair);

    const element = document.querySelector(`[data-index="${index}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        const prevIndex = Math.max(activeIndex - 1, 0);
        handleIndexChange(prevIndex);
      } else if (e.key === "ArrowDown") {
        const nextIndex = Math.min(activeIndex + 1, marketData.length - 1);
        handleIndexChange(nextIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, marketData.length]);

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

  const getLatestPrice = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      return Number.parseFloat(data[data.length - 1].mid.c);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = Number.parseInt(
              entry.target.getAttribute("data-index") || "0"
            );
            setActiveIndex(index);
            onPairSelect(marketData[index].pair);
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.5,
        rootMargin: "-45% 0px -45% 0px",
      }
    );

    const pairElements = document.querySelectorAll(".pair-item");
    pairElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [marketData, onPairSelect]);

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

      if (range === 0) return null;

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
    <div className="relative h-full w-full" {...handlers}>
      <div
        ref={scrollRef}
        className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex h-full touch-pan-y flex-col overflow-y-scroll scroll-smooth"
        style={{
          scrollSnapType: "y mandatory",
          scrollPaddingTop: "50%",
          scrollPaddingBottom: "50%",
        }}
      >
        {marketData.map((item, index) => {
          const priceChange = getPriceChange(item.candleData);
          const latestPrice = getLatestPrice(item.candleData);
          const isActive = activeIndex === index;

          return (
            <div
              key={item.pair}
              data-index={index}
              className="pair-item relative shrink-0 cursor-pointer px-6 py-8"
              style={{ scrollSnapAlign: "center" }}
              onClick={() => {
                onPairSelect(item.pair);
                setActiveIndex(index);
              }}
            >
              {isActive && <div className="absolute inset-0 z-0"></div>}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-8">
                  <h3
                    className={`font-russo text-5xl font-bold tracking-tight transition-all duration-300 ${
                      isActive
                        ? "text-white scale-110"
                        : "scale-90 text-[#818181]"
                    }`}
                  >
                    {item.pair.replace("_", "/")}
                  </h3>

                  {/* Sparkline Chart for Active Item */}
                  {isActive && (
                    <div className="h-10 w-20 opacity-80">
                      {getSparklinePoints(item.candleData, 128, 64) && (
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 128 64"
                          preserveAspectRatio="none"
                          className="overflow-visible"
                        >
                          <defs>
                            <linearGradient
                              id={`gradient-${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={
                                  priceChange >= 0 ? "#4EFF6E" : "#FF6B6B"
                                }
                                stopOpacity="0.2"
                              />
                              <stop
                                offset="100%"
                                stopColor={
                                  priceChange >= 0 ? "#4EFF6E" : "#FF6B6B"
                                }
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M 0,64 L 0,${getSparklinePoints(item.candleData, 128, 64)?.split(" ")[0]?.split(",")[1] || 0} ${getSparklinePoints(
                              item.candleData,
                              128,
                              64
                            )} L 128,64 Z`}
                            fill={`url(#gradient-${index})`}
                          />
                          <polyline
                            points={getSparklinePoints(
                              item.candleData,
                              128,
                              64
                            )}
                            fill="none"
                            stroke={priceChange >= 0 ? "#4EFF6E" : "#FF6B6B"}
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>

                {isActive && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="font-kodemono text-lg text-[#818181]">
                      {latestPrice?.toFixed(item.pair.includes("JPY") ? 3 : 5)}
                    </div>
                    <div className="flex items-center gap-3">
                      {priceChange !== null && (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            priceChange >= 0
                              ? "bg-[#4EFF6E]/10 text-[#4EFF6E]"
                              : "bg-[#FF6B6B]/10 text-[#FF6B6B]"
                          }`}
                        >
                          {priceChange >= 0 ? "+" : ""}
                          {priceChange.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
