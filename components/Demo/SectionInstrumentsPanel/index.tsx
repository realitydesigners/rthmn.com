"use client";

import { cn } from "@/utils/cn";
import {
  CRYPTO_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
  FOREX_PAIRS,
  formatPrice,
} from "@/utils/instruments";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaStar, FaTimes } from "react-icons/fa";
import {
  LuActivity,
  LuBarChart3,
  LuBell,
  LuBox,
  LuLayoutGrid,
  LuLineChart,
  LuLock,
  LuPalette,
  LuPieChart,
  LuSettings,
  LuTrendingDown,
  LuTrendingUp,
  LuUser,
  LuBoxes,
} from "react-icons/lu";

// Generate mock prices for instruments using real data
const generateMockPrice = (symbol: string) => {
  const hash = symbol
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = ((hash * 9301 + 49297) % 233280) / 233280;

  if (FOREX_PAIRS.includes(symbol)) {
    if (symbol.includes("JPY")) return 100 + random * 50;
    return 0.5 + random * 1.5;
  } else if (CRYPTO_PAIRS.includes(symbol)) {
    if (symbol === "BTCUSD") return 40000 + random * 20000;
    if (symbol === "ETHUSD") return 2000 + random * 1500;
    return random < 0.5 ? random * 2 : 10 + random * 100;
  } else if (EQUITY_PAIRS.includes(symbol)) {
    return 50 + random * 400;
  } else if (ETF_PAIRS.includes(symbol)) {
    return 100 + random * 300;
  }
  return random * 100;
};

// Create mock price data for all instruments
const createMockPriceData = () => {
  const mockData: Record<string, { price: number }> = {};
  const allPairs = [
    ...FOREX_PAIRS,
    ...CRYPTO_PAIRS,
    ...EQUITY_PAIRS,
    ...ETF_PAIRS,
  ];

  for (const pair of allPairs) {
    mockData[pair] = { price: generateMockPrice(pair) };
  }

  return mockData;
};

// Instruments Panel Component
const InstrumentsPanel = memo(
  ({ highlightedFeature }: { highlightedFeature: string }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [activeFilter, setActiveFilter] = useState("selected");
    const [favorites, setSelectedPairs] = useState([
      "EURUSD",
      "BTCUSD",
      "ETHUSD",
      "GBPUSD",
      "AAPL",
    ]);
    const [isClient, setIsClient] = useState(false);
    const [typingIndex, setTypingIndex] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const mockPriceData = useMemo(() => createMockPriceData(), []);

    useEffect(() => {
      setIsClient(true);
    }, []);

    // Typing animation for search feature
    const searchSuggestions = ["BTC", "ETH", "EUR", "GBP", "AAPL", "TSLA"];
    const currentSuggestion =
      searchSuggestions[typingIndex % searchSuggestions.length];

    useEffect(() => {
      if (highlightedFeature === "search") {
        setShowSuggestions(true);
        const interval = setInterval(() => {
          setTypingIndex((prev) => prev + 1);
        }, 2000);
        return () => clearInterval(interval);
      } else {
        setShowSuggestions(false);
      }
    }, [highlightedFeature]);

    // Animated prices for real-time data
    const [animatedPrices, setAnimatedPrices] = useState<
      Record<string, number>
    >({});

    useEffect(() => {
      if (highlightedFeature === "realtime") {
        const interval = setInterval(() => {
          setAnimatedPrices((prev) => {
            const newPrices = { ...prev };
            favorites.forEach((pair) => {
              const basePrice = mockPriceData[pair]?.price || 0;
              const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
              newPrices[pair] = basePrice * (1 + variation);
            });
            return newPrices;
          });
        }, 100); // Fast updates for real-time effect
        return () => clearInterval(interval);
      }
    }, [highlightedFeature, favorites, mockPriceData]);

    const isSearching = !!searchQuery || showSuggestions;

    // Real filter button component matching the actual InstrumentsPanel
    const FilterButton = ({
      isActive,
      onClick,
      label,
    }: {
      isActive: boolean;
      onClick: () => void;
      label: string;
    }) => (
      <button
        type="button"
        onClick={onClick}
        className="group rounded-full px-4 relative w-auto flex h-7 min-w-7 justify-center items-center px-2 transition-all duration-300 ease-in-out overflow-hidden"
      >
        {/* Active indicator */}
        {isActive && (
          <>
            <div
              className="absolute inset-0"
              style={{
                borderRadius: "4px",
                background:
                  "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              }}
            />
            <div
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#4EFF6E] z-10"
              style={{
                width: "30px",
                height: "4px",
                transform: "translateY(-50%) rotate(-90deg)",
                filter: "blur(10px)",
                transformOrigin: "center",
              }}
            />
          </>
        )}

        {/* Inactive background */}
        {!isActive && (
          <>
            <div
              className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
              style={{
                borderRadius: "4px",
                background:
                  "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              }}
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                borderRadius: "4px",
                background:
                  "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              }}
            />
          </>
        )}

        {/* Label */}
        <span className="relative z-10 font-outfit text-[12px] font-medium tracking-wide whitespace-nowrap flex items-center justify-center transition-colors duration-300 ease-in-out text-white">
          {label}
        </span>
      </button>
    );

    // Simplified components for the demo
    const PairItem = ({
      item,
      isSelected = false,
    }: {
      item: string;
      isSelected?: boolean;
    }) => {
      const basePrice = mockPriceData[item]?.price;
      const animatedPrice = animatedPrices[item];
      const price =
        highlightedFeature === "realtime" && animatedPrice
          ? animatedPrice
          : basePrice;

      return (
        <motion.div
          className={cn(
            "group/item relative flex h-10 w-full items-center transition-all duration-300 select-none overflow-hidden",
            isSelected
              ? "bg-gradient-to-b from-[#191B1F] to-[#131618] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              : ""
          )}
          style={{ borderRadius: "4px" }}
        >
          {/* Hover background for non-selected items */}
          {!isSelected && (
            <div
              className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"
              style={{
                borderRadius: "4px",
                background:
                  "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
                boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
              }}
            />
          )}
          <div className="relative flex w-full items-center px-3">
            <span
              className={cn(
                "font-outfit flex-1 text-sm font-bold tracking-wide transition-colors",
                isSelected
                  ? "text-white"
                  : "text-[#818181] group-hover/item:text-[#B0B0B0]"
              )}
            >
              {item}
            </span>
            <motion.span
              className={cn(
                "font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors",
                isSelected
                  ? "text-[#545963]"
                  : "text-[#818181] group-hover/item:text-[#B0B0B0]",
                highlightedFeature === "realtime" && isSelected && "text-white"
              )}
              animate={{
                color:
                  highlightedFeature === "realtime" && isSelected
                    ? "#FFFFFF"
                    : undefined,
              }}
              key={price} // This will trigger re-animation when price changes
            >
              {price && isClient ? formatPrice(price, item) : "---"}
            </motion.span>
          </div>
        </motion.div>
      );
    };

    const SearchBar = () => (
      <div className="relative mb-4">
        <div className="group/search relative flex h-10 items-center rounded-lg border border-[#1C1E23] transition-all duration-300">
          <div className="relative ml-3 text-[#818181] transition-colors duration-300">
            <FaSearch size={12} />
          </div>
          <input
            type="text"
            placeholder="Search instruments..."
            value=""
            readOnly
            className="font-outfit relative h-full flex-1 bg-transparent px-3 text-[13px] font-medium text-white transition-colors outline-none cursor-pointer"
          />
        </div>
      </div>
    );

    const FilterButtons = () => (
      <div className="flex gap-2 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <FilterButton
          isActive={activeFilter === "fx"}
          onClick={() => setActiveFilter("fx")}
          label="FX"
        />
        <FilterButton
          isActive={activeFilter === "crypto"}
          onClick={() => setActiveFilter("crypto")}
          label="Crypto"
        />
        <FilterButton
          isActive={activeFilter === "stocks"}
          onClick={() => setActiveFilter("stocks")}
          label="Stocks"
        />
        <FilterButton
          isActive={activeFilter === "etf"}
          onClick={() => setActiveFilter("etf")}
          label="ETF"
        />
      </div>
    );

    return (
      <div
        className="w-full max-w-sm bg-gradient-to-b from-[#0A0B0D] to-[#070809] rounded-2xl border border-[#111215] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden"
        style={{ height: "375px" }}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Search Bar */}
          <SearchBar />

          {/* Filter Buttons */}
          {!isSearching && <FilterButtons />}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Search Results */}
            {isSearching && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-outfit text-xs font-medium text-white opacity-70">
                    Search Results
                  </h4>
                  <span className="font-outfit text-xs text-[#818181] bg-[#111316] px-2 py-0.5 rounded-full">
                    {searchSuggestions.length}
                  </span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {searchSuggestions.map((symbol) => (
                    <PairItem
                      key={symbol}
                      item={`${symbol}USD`}
                      isSelected={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Favorites */}
            {!isSearching && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-outfit text-xs font-medium text-white opacity-70">
                    Favorites
                  </h4>
                  <span className="font-outfit text-xs text-[#818181] bg-[#111316] px-2 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {favorites.map((item) => (
                    <PairItem key={item} item={item} isSelected={true} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export const SectionInstrumentsPanel = memo(() => {
  // Always show the outro state
  const highlightedFeature = "outro";

  // Simplified to only show the outro content
  const currentDescription = {
    title: "Start Seeing The Future",

    description:
      "Get access to our dashboard where you can customize your trading experience, and start seeing the future of trading",
    stats: null,
  };

  return (
    <div className="relative py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-16 items-center">
            {/* Left side - Content */}
            <div className="flex items-center justify-center">
              <div className="space-y-8 max-w-2xl">
                {/* Main heading section */}
                <div className="space-y-6">
                  <h2 className="font-russo text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black  leading-[1] uppercase text-white">
                    {currentDescription.title}
                  </h2>
                </div>

                {/* Description */}
                <p className="font-outfit text-base sm:text-lg text-white/70 leading-relaxed">
                  {currentDescription.description}
                </p>

                {/* Call to action */}
                <div className="pt-8">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-[#4EFF6E] to-[#3DE55C] text-black font-russo font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(78,255,110,0.4)]">
                    <span className="relative z-10">Start Trading Now</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3DE55C] to-[#2DD14A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Instruments panel */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-full max-w-sm">
                <InstrumentsPanel highlightedFeature={highlightedFeature} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SectionInstrumentsPanel.displayName = "SectionInstrumentsPanel";
