"use client";

import { cn } from "@/utils/cn";
import {
  CRYPTO_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
  FOREX_PAIRS,
  formatPrice,
} from "@/utils/instruments";
import { motion, useScroll, useTransform } from "framer-motion";
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
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white z-10"
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
            "group/item relative flex h-10 w-full items-center transition-all duration-300 select-none overflow-hidden px-3",
            isSelected
              ? "bg-gradient-to-b from-[#191B1F] to-[#131618] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              : "hover:bg-[#111215]/50"
          )}
          style={{ borderRadius: "4px" }}
        >
          <span
            className={cn(
              "font-outfit flex-1 text-sm font-bold tracking-wide transition-colors",
              isSelected ? "text-white" : "text-[#32353C]"
            )}
          >
            {item}
          </span>
          <motion.span
            className={cn(
              "font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors",
              isSelected ? "text-[#545963]" : "text-[#32353C]",
              highlightedFeature === "realtime" && "text-white"
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
        </motion.div>
      );
    };

    const SearchBar = () => (
      <div className="relative mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#32353C] text-sm" />
          <input
            type="text"
            placeholder={showSuggestions ? "" : "Search instruments..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full h-10 pl-10 pr-4 bg-[#0A0B0D] border border-[#111215] rounded-lg text-white placeholder-[#32353C] font-outfit text-sm focus:outline-none focus:border-[#1C1E23] transition-colors"
          />
          {/* Typing animation */}
          {showSuggestions && !searchQuery && (
            <motion.div
              className="absolute left-10 top-1/2 -translate-y-1/2 text-white font-outfit text-sm"
              key={currentSuggestion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {currentSuggestion}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="ml-1"
              >
                |
              </motion.span>
            </motion.div>
          )}
        </div>

        {/* Search suggestions dropdown */}
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0A0B0D] border border-[#111215] rounded-lg shadow-lg z-10"
          >
            <div className="p-2 space-y-1">
              {searchSuggestions.slice(0, 4).map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-3 py-2 hover:bg-[#111215] rounded text-sm font-outfit text-white cursor-pointer transition-colors"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  {suggestion}USD
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );

    const FilterButtons = () => (
      <div className="flex gap-2 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <FilterButton
          isActive={activeFilter === "selected"}
          onClick={() => setActiveFilter("selected")}
          label="★"
        />
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
        style={{ height: "600px" }}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-russo text-lg font-bold text-white uppercase tracking-wider">
              Instruments
            </h3>
          </div>

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Create scroll-based feature highlighting
  const currentFeature = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    ["intro", "search", "categories", "realtime", "performance", "outro"]
  );

  const [highlightedFeature, setHighlightedFeature] = useState("intro");

  useEffect(() => {
    return currentFeature.onChange(setHighlightedFeature);
  }, [currentFeature]);

  // Better organized feature descriptions
  const featureDescriptions = {
    intro: {
      title: "Master Every Market",
      subtitle: "Your gateway to 300+ trading instruments",
      description:
        "Access crypto, forex, stocks, and ETFs with professional-grade tools designed for serious traders.",
      stats: null,
    },
    search: {
      title: "Lightning Search",
      subtitle: "Find any instrument instantly",
      description:
        "Type any symbol and watch results appear in milliseconds. Our advanced search engine scans through hundreds of instruments faster than you can blink.",
      stats: {
        icon: FaSearch,
        title: "Search Performance",
        metrics: [
          { value: "< 50ms", label: "Response Time" },
          { value: "300+", label: "Instruments" },
        ],
      },
    },
    categories: {
      title: "Smart Organization",
      subtitle: "Organize by asset class",
      description:
        "Filter by favorites, forex, crypto, stocks, and ETFs. Create custom watchlists and organize your trading universe exactly how you want it.",
      stats: {
        icon: LuLayoutGrid,
        title: "Asset Coverage",
        metrics: [
          { value: "50+", label: "Forex Pairs" },
          { value: "100+", label: "Crypto Assets" },
        ],
      },
    },
    realtime: {
      title: "Real-Time Data",
      subtitle: "Live market information",
      description:
        "Every price updates in real-time with sub-second latency. Make informed decisions with the freshest market data available.",
      stats: {
        icon: LuActivity,
        title: "Data Feed",
        metrics: [
          { value: "< 100ms", label: "Update Latency" },
          { value: "24/7", label: "Market Coverage" },
        ],
      },
    },
    performance: {
      title: "Built for Speed",
      subtitle: "Enterprise-grade performance",
      description:
        "Our platform handles millions of price updates daily while maintaining lightning-fast response times and zero downtime.",
      stats: {
        icon: LuTrendingUp,
        title: "Platform Stats",
        metrics: [
          { value: "99.9%", label: "Uptime" },
          { value: "1M+", label: "Daily Updates" },
        ],
      },
    },
    outro: {
      title: "Trade Smarter",
      subtitle: "Everything you need in one place",
      description:
        "Professional tools, real-time data, and lightning-fast execution. Join thousands of traders who've made the switch to smarter trading.",
      stats: null,
    },
  };

  const currentDescription =
    featureDescriptions[highlightedFeature as keyof typeof featureDescriptions];

  return (
    <div className="relative">
      {/* Tall scroll container that creates the scroll distance */}
      <div ref={containerRef} className="h-[600vh] relative">
        {/* Sticky container that holds both left and right content */}
        <div className="sticky top-0 h-screen w-full">
          <div className="container mx-auto px-4 sm:px-6 h-full">
            <div className="max-w-7xl mx-auto h-full">
              <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-16 h-full items-center">
                {/* Left side - Content that changes based on scroll */}
                <div className="flex items-center justify-center">
                  <motion.div
                    key={highlightedFeature}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8 max-w-2xl"
                  >
                    {/* Main heading section */}
                    <div className="space-y-6">
                      <motion.h2
                        className="font-russo text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.85] uppercase"
                        animate={{
                          color:
                            highlightedFeature === "search"
                              ? "#ffff"
                              : "#FFFFFF",
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {currentDescription.title}
                      </motion.h2>

                      <motion.p
                        className="font-russo text-lg sm:text-xl lg:text-2xl font-light leading-relaxed text-white/90"
                        animate={{
                          color:
                            highlightedFeature === "search"
                              ? "#ffff"
                              : "#FFFFFF",
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {currentDescription.subtitle}
                      </motion.p>
                    </div>

                    {/* Description */}
                    <motion.p
                      className="font-outfit text-base sm:text-lg text-white/70 leading-relaxed"
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      {currentDescription.description}
                    </motion.p>

                    {/* Stats card - only show when relevant */}
                    {currentDescription.stats && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-gradient-to-br from-[#0A0B0D] via-[#070809] to-[#050607] p-6 sm:p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-white/5 rounded-xl">
                            <currentDescription.stats.icon className="text-white text-xl" />
                          </div>
                          <span className="font-russo text-sm font-bold text-white uppercase tracking-wider">
                            {currentDescription.stats.title}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          {currentDescription.stats.metrics.map(
                            (metric, index) => (
                              <div key={index} className="text-center">
                                <div className="font-russo text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                                  {metric.value}
                                </div>
                                <div className="font-russo text-xs sm:text-sm text-white/60 uppercase tracking-wider font-medium">
                                  {metric.label}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Call to action for outro */}
                    {highlightedFeature === "outro" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="pt-8"
                      >
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-[#4EFF6E] to-[#3DE55C] text-black font-russo font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(78,255,110,0.4)]">
                          <span className="relative z-10">
                            Start Trading Now
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#3DE55C] to-[#2DD14A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Right side - Instruments panel that stays sticky with the container */}
                <div className="flex items-center justify-center lg:justify-start">
                  <motion.div
                    animate={{
                      scale: ["search", "categories", "realtime"].includes(
                        highlightedFeature
                      )
                        ? 1.02
                        : 1,
                      boxShadow: ["search", "categories", "realtime"].includes(
                        highlightedFeature
                      )
                        ? "0 0 40px rgba(78, 255, 110, 0.2)"
                        : "0 0 0px rgba(78, 255, 110, 0)",
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-sm"
                  >
                    <InstrumentsPanel highlightedFeature={highlightedFeature} />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SectionInstrumentsPanel.displayName = "SectionInstrumentsPanel";
