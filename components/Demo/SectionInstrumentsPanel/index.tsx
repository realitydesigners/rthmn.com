"use client";

import { cn } from "@/utils/cn";
import {
  CRYPTO_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
  FOREX_PAIRS,
  formatPrice,
} from "@/utils/instruments";
import { Reorder, motion, useDragControls } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaStar, FaTimes } from "react-icons/fa";

// Generate deterministic mock prices for demo (no Math.random for SSR compatibility)
const generateMockPrice = (pair: string): { price: number; change: number } => {
  // Use pair name to generate deterministic "random" values
  const hash = pair.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const deterministicRandom1 = Math.abs(hash) / 2147483647;
  const deterministicRandom2 = Math.abs(hash * 1.618) / 2147483647;

  const basePrice = (() => {
    if (pair.includes("JPY")) return 100 + deterministicRandom1 * 50;
    if (pair.includes("USD") && pair.startsWith("USD"))
      return 0.5 + deterministicRandom1 * 1.5;
    if (pair.startsWith("BTC")) return 40000 + deterministicRandom1 * 10000;
    if (pair.startsWith("ETH")) return 2000 + deterministicRandom1 * 1000;
    if (pair.includes("USD") && !pair.startsWith("USD"))
      return 0.5 + deterministicRandom1 * 1.5;
    if (CRYPTO_PAIRS.includes(pair)) return deterministicRandom1 * 100;
    if (EQUITY_PAIRS.includes(pair)) return 50 + deterministicRandom1 * 200;
    if (ETF_PAIRS.includes(pair)) return 100 + deterministicRandom1 * 300;
    return 1 + deterministicRandom1;
  })();

  const changePercent = (deterministicRandom2 - 0.5) * 0.1; // ±5% change
  const change = basePrice * changePercent;

  return { price: basePrice, change };
};

// Create mock data for all instruments
const createMockData = () => {
  const allPairs = [
    ...FOREX_PAIRS,
    ...CRYPTO_PAIRS,
    ...EQUITY_PAIRS,
    ...ETF_PAIRS,
  ];
  const mockData: Record<string, { price: number; change: number }> = {};

  for (const pair of allPairs) {
    mockData[pair] = generateMockPrice(pair);
  }

  return mockData;
};

const MOCK_PRICE_DATA = createMockData();
const MOCK_SELECTED_PAIRS = ["EURUSD", "BTCUSD", "GBPUSD", "AAPL", "SPY"];

// Draggable instrument item for selected pairs
const DraggableInstrumentItem = memo(
  ({ pair, onToggle }: { pair: string; onToggle: () => void }) => {
    const dragControls = useDragControls();
    const mockData = MOCK_PRICE_DATA[pair];
    const isPositive = mockData?.change > 0;

    return (
      <Reorder.Item
        value={pair}
        id={pair}
        dragListener={false}
        dragControls={dragControls}
        className="group/drag mb-1"
        whileDrag={{ zIndex: 50 }}
      >
        <motion.div
          className="relative flex w-full items-center rounded-lg"
          layout="position"
          transition={{ duration: 0.15 }}
          whileDrag={{ zIndex: 50 }}
        >
          <div className="w-full">
            {/* Drag Handle */}
            <motion.button
              type="button"
              className="absolute top-1/2 left-0 z-[100] -translate-y-1/2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dragControls.start(e);
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center opacity-0 transition-all duration-200 group-hover/drag:opacity-60">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  role="img"
                  aria-label="Drag handle"
                >
                  <title>Drag handle</title>
                  <path d="M7 3H5V5H7V3Z" fill="#666" />
                  <path d="M7 7H5V9H7V7Z" fill="#666" />
                  <path d="M7 11H5V13H7V11Z" fill="#666" />
                  <path d="M11 3H9V5H11V3Z" fill="#666" />
                  <path d="M11 7H9V9H11V7Z" fill="#666" />
                  <path d="M11 11H9V13H11V11Z" fill="#666" />
                </svg>
              </div>
            </motion.button>

            {/* Item Content */}
            <div
              className={cn(
                "group/item relative flex h-12 w-full items-center rounded-lg transition-all duration-300 select-none",
                "border border-[#111215] bg-gradient-to-b from-[#131518] to-[#0E0F11]",
                "shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                "hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
                "hover:border-[#1C1E23]"
              )}
            >
              <div className="relative flex w-full items-center px-4">
                {/* Instrument name */}
                <span className="ml-4 font-russo flex-1 text-sm font-bold tracking-wide text-white transition-colors">
                  {pair}
                </span>

                {/* Price */}
                <div className="flex items-center gap-3">
                  <span className="font-kodemono w-[80px] text-right text-sm tracking-wider text-[#545963] transition-colors">
                    {mockData ? formatPrice(mockData.price, pair) : "N/A"}
                  </span>

                  {/* Toggle button */}
                  <div className="ml-2 flex w-6 justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
                        "opacity-0 group-hover/item:opacity-100",
                        "border-[#111215] bg-[#111215] text-white/40 hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
                      )}
                    >
                      <FaTimes size={8} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Reorder.Item>
    );
  }
);

DraggableInstrumentItem.displayName = "DraggableInstrumentItem";

// Regular instrument item component
const MockInstrumentItem = memo(
  ({
    pair,
    isSelected = false,
    onToggle,
  }: {
    pair: string;
    isSelected?: boolean;
    onToggle: () => void;
  }) => {
    const mockData = MOCK_PRICE_DATA[pair];
    const isPositive = mockData?.change > 0;

    return (
      <div
        className={cn(
          "group/item relative flex h-12 w-full items-center rounded-lg transition-all duration-300 select-none cursor-pointer",
          isSelected
            ? "border border-[#111215] bg-gradient-to-b from-[#131518] to-[#0E0F11] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]"
            : "hover:bg-[#111215]/50"
        )}
        onClick={onToggle}
      >
        <div className="relative flex w-full items-center px-4">
          {/* Instrument name */}
          <span
            className={cn(
              "font-russo flex-1 text-sm font-bold tracking-wide transition-colors",
              isSelected
                ? "text-white"
                : "text-[#32353C] group-hover/item:text-[#545963]"
            )}
          >
            {pair}
          </span>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "font-kodemono w-[80px] text-right text-sm tracking-wider transition-colors",
                isSelected ? "text-[#545963]" : "text-[#32353C]"
              )}
            >
              {mockData ? formatPrice(mockData.price, pair) : "N/A"}
            </span>

            {/* Toggle button */}
            <div className="ml-2 flex w-6 justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className={cn(
                  "relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
                  "opacity-0 group-hover/item:opacity-100",
                  "border-[#111215] bg-[#111215] text-white/40 hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
                )}
              >
                {isSelected ? (
                  <FaTimes size={8} />
                ) : (
                  <span className="text-[9px] font-medium">+</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MockInstrumentItem.displayName = "MockInstrumentItem";

// Mock search bar component
const MockSearchBar = memo(
  ({
    searchQuery,
    setSearchQuery,
  }: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative">
        <div
          className={cn(
            "group/search relative flex h-12 items-center overflow-hidden scrollbar-hide rounded-lg transition-all duration-300",
            isFocused ? "ring-1 ring-[#1C1E23]" : ""
          )}
        >
          <div className="absolute inset-0 rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] transition-all duration-300" />

          {/* Search Icon */}
          <div
            className={cn(
              "relative ml-4 transition-colors duration-300",
              isFocused ? "text-[#545963]" : "text-[#32353C]"
            )}
          >
            <FaSearch size={14} />
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Search instruments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="font-russo relative h-full flex-1 bg-transparent px-4 text-sm font-medium text-[#545963] placeholder-[#32353C] transition-colors outline-none"
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="relative mr-4 flex h-6 w-6 items-center justify-center rounded-md border border-[#111215] bg-[#111215] text-white/40 transition-all hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
            >
              <FaTimes size={8} />
            </button>
          )}
        </div>
      </div>
    );
  }
);

MockSearchBar.displayName = "MockSearchBar";

// Filter button component
const FilterButton = memo(
  ({
    isActive,
    label,
    icon,
    onClick,
  }: {
    isActive: boolean;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative flex h-8 items-center justify-center px-3 transition-all duration-300 ease-in-out rounded-lg",
          isActive &&
            "border border-[#111215] bg-gradient-to-b from-[#131518] to-[#0E0F11] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]"
        )}
      >
        {!isActive && (
          <div className="absolute inset-0 rounded-lg bg-[#111215] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}

        <span
          className={cn(
            "relative z-10 font-russo text-xs font-medium tracking-wide whitespace-nowrap flex items-center gap-2",
            "transition-colors duration-300 ease-in-out",
            isActive
              ? "text-white"
              : "text-[#32353C] group-hover:text-[#545963]"
          )}
        >
          {icon}
          {label}
        </span>
      </button>
    );
  }
);

FilterButton.displayName = "FilterButton";

// Main mock instruments panel
const MockInstrumentsPanel = memo(() => {
  const [activeFilter, setActiveFilter] = useState("selected");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setSelectedPairs] = useState(MOCK_SELECTED_PAIRS);

  // Filter instruments based on search and category
  const filteredInstruments = useMemo(() => {
    let instruments: string[] = [];

    switch (activeFilter) {
      case "selected":
        instruments = favorites;
        break;
      case "fx":
        instruments = FOREX_PAIRS;
        break;
      case "crypto":
        instruments = CRYPTO_PAIRS;
        break;
      case "stocks":
        instruments = EQUITY_PAIRS;
        break;
      case "etf":
        instruments = ETF_PAIRS;
        break;
    }

    if (searchQuery) {
      instruments = instruments.filter((pair) =>
        pair.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return instruments.slice(0, 20); // Limit to 20 items for demo
  }, [activeFilter, searchQuery, favorites]);

  const togglePairSelection = useCallback((pair: string) => {
    setSelectedPairs((prev) => {
      if (prev.includes(pair)) {
        return prev.filter((p) => p !== pair);
      }
      return [...prev, pair];
    });
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-[#0A0B0D] to-[#070809] border border-[#1C1E23]/60 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      {/* Header */}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent_50%)] rounded-xl" />

      {/* Top border highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="p-4 sm:p-6 border-b border-[#111215]">
        <h3 className="font-russo text-lg font-bold text-white uppercase tracking-tight mb-4">
          Instruments
        </h3>

        {/* Search Bar */}
        <MockSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          <FilterButton
            isActive={activeFilter === "selected"}
            label="Favorites"
            onClick={() => setActiveFilter("selected")}
          />
          <FilterButton
            isActive={activeFilter === "fx"}
            label="FX"
            onClick={() => setActiveFilter("fx")}
          />
          <FilterButton
            isActive={activeFilter === "crypto"}
            label="Crypto"
            onClick={() => setActiveFilter("crypto")}
          />
          <FilterButton
            isActive={activeFilter === "stocks"}
            label="Stocks"
            onClick={() => setActiveFilter("stocks")}
          />
          <FilterButton
            isActive={activeFilter === "etf"}
            label="ETF"
            onClick={() => setActiveFilter("etf")}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* Selected Pairs with Drag & Drop */}
        {activeFilter === "selected" && (
          <div className="space-y-2">
            <Reorder.Group
              axis="y"
              values={favorites}
              onReorder={setSelectedPairs}
              className="space-y-1"
            >
              {favorites.map((pair) => (
                <DraggableInstrumentItem
                  key={pair}
                  pair={pair}
                  onToggle={() => togglePairSelection(pair)}
                />
              ))}
            </Reorder.Group>
          </div>
        )}

        {/* Other Categories */}
        {activeFilter !== "selected" && (
          <div className="space-y-2">
            <span className="font-russo text-xs font-medium text-[#545963] uppercase tracking-wider block mb-3">
              {activeFilter === "fx" && "Foreign Exchange"}
              {activeFilter === "crypto" && "Cryptocurrency"}
              {activeFilter === "stocks" && "Stocks"}
              {activeFilter === "etf" && "ETFs"}
              {searchQuery && ` (${filteredInstruments.length} results)`}
            </span>
            {filteredInstruments.map((pair, index) => (
              <div key={pair}>
                <MockInstrumentItem
                  pair={pair}
                  isSelected={favorites.includes(pair)}
                  onToggle={() => togglePairSelection(pair)}
                />
              </div>
            ))}
            {filteredInstruments.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <span className="font-russo text-sm text-[#32353C]">
                  No instruments found for "{searchQuery}"
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MockInstrumentsPanel.displayName = "MockInstrumentsPanel";

export const SectionInstrumentsPanel = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Add client-side check to prevent hydration issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render dynamic content until client-side
  if (!isClient) {
    return (
      <section
        ref={containerRef}
        className="relative min-h-screen w-full py-16 sm:py-24"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-start">
              {/* Static content placeholder */}
              <div className="space-y-8 sm:space-y-12 order-2 lg:order-1">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="font-russo text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.8] uppercase">
                      MASTER EVERY
                      <span className="block text-white mt-2 relative">
                        MARKET INSTANTLY
                        <div className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-white via-white/60 to-transparent" />
                      </span>
                    </h2>
                  </div>
                </div>
              </div>
              {/* Empty placeholder for instruments panel */}
              <div className="order-1 lg:order-2">
                <div className="h-96 bg-[#0A0B0D] rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full py-16 sm:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-start">
            {/* Left side - Enhanced Content */}
            <div className="space-y-8 sm:space-y-12 order-2 lg:order-1">
              {/* Header Section */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="font-russo text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.8] uppercase">
                    MASTER EVERY
                    <span className="block text-white mt-2 relative">
                      MARKET INSTANTLY
                      {/* Static underline */}
                      <div className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-white via-white/60 to-transparent" />
                    </span>
                  </h2>
                </div>

                <div className="space-y-6">
                  <p className="font-russo text-xl lg:text-2xl text-white/80 leading-relaxed font-light">
                    <span className="text-white font-semibold">
                      Access 300+ trading instruments
                    </span>{" "}
                    across crypto, forex, stocks, and ETFs with the speed that
                    separates winners from losers.
                  </p>

                  <p className="font-outfit text-lg text-white/60 leading-relaxed max-w-2xl">
                    Find any instrument in milliseconds. Build your personalized
                    favorites. Switch between Bitcoin, Apple stock, EUR/USD, and
                    SPY ETF faster than your competition can blink. This is how
                    professionals dominate multiple markets simultaneously.
                  </p>
                </div>
              </div>

              {/* Key Features Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Feature 1 - Search */}
                <div className="group relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-br from-[#0A0B0D] via-[#070809] to-[#050506] p-8 hover:border-white/20 transition-all duration-500">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon */}
                  <div className="relative z-10 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FaSearch className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20">
                        <span className="font-russo text-xs font-bold text-white uppercase tracking-wider">
                          INSTANT
                        </span>
                      </div>
                      <h3 className="font-russo text-2xl font-black text-white uppercase tracking-tight group-hover:text-white/90 transition-colors duration-300">
                        Lightning Search
                      </h3>
                    </div>

                    <p className="font-russo text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                      Type any symbol and watch results appear{" "}
                      <span className="text-white font-semibold">
                        instantly
                      </span>
                      . No more scrolling through endless lists. Find Bitcoin,
                      Tesla, EUR/USD, or any of our 300+ instruments in under 50
                      milliseconds.
                    </p>

                    {/* Performance indicator */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="font-mono text-sm text-white font-bold">
                          &lt; 50ms
                        </span>
                      </div>
                      <span className="font-russo text-xs text-white/50">
                        Search response time
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feature 2 - Organization */}
                <div className="group relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-br from-[#0A0B0D] via-[#070809] to-[#050506] p-8 hover:border-white/20 transition-all duration-500">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon */}
                  <div className="relative z-10 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FaStar className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20">
                        <span className="font-russo text-xs font-bold text-white uppercase tracking-wider">
                          SMART
                        </span>
                      </div>
                      <h3 className="font-russo text-2xl font-black text-white uppercase tracking-tight group-hover:text-white/90 transition-colors duration-300">
                        Smart Favorites
                      </h3>
                    </div>

                    <p className="font-russo text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                      Build your personal watchlist of winning instruments.
                      Organize by{" "}
                      <span className="text-white font-semibold">
                        favorites, crypto, forex, stocks, and ETFs
                      </span>
                      . Drag and drop to reorder. Your most profitable trades,
                      always within reach.
                    </p>

                    {/* Category indicators */}
                    <div className="flex items-center gap-2 pt-2">
                      {["Favorites", "Crypto", "Forex", "Stocks"].map(
                        (category, i) => (
                          <div
                            key={category}
                            className="px-2 py-1 rounded bg-white/10 border border-white/20"
                          >
                            <span className="font-russo text-xs font-medium text-white/80">
                              {category}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag & Drop Showcase */}
              <div className="relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-r from-[#0A0B0D] via-[#070809] to-[#050506] p-8">
                <div className="relative z-10 flex items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20">
                        <span className="font-russo text-xs font-bold text-white uppercase tracking-wider">
                          INTUITIVE
                        </span>
                      </div>
                      <h3 className="font-russo text-2xl font-black text-white uppercase tracking-tight">
                        Drag & Drop
                      </h3>
                    </div>

                    <p className="font-russo text-white/70 leading-relaxed">
                      Reorder your favorites instantly with professional
                      drag-and-drop controls. Build the perfect watchlist for
                      your trading style. Your most important instruments,
                      exactly where you need them.
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <span className="font-russo text-sm text-white/60">
                          Instant reordering
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <span className="font-russo text-sm text-white/60">
                          Smooth animations
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual drag indicator */}
                  <div className="hidden lg:block">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <title>Drag and Drop Icon</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-8 pt-4">
                {[
                  {
                    value: "300+",
                    label: "Instruments",
                    sublabel: "Crypto, Forex, Stocks, ETFs",
                  },
                  {
                    value: "< 50ms",
                    label: "Live Data",
                    sublabel: "Calculating incoming data in real-time",
                  },
                  {
                    value: "100%",
                    label: "Customizable",
                    sublabel: "Build your perfect setup (BETA)",
                  },
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center group">
                    <div className="space-y-2">
                      <div className="font-russo text-3xl lg:text-4xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                      <div className="space-y-1">
                        <div className="font-russo text-sm font-semibold text-white uppercase tracking-wider">
                          {stat.label}
                        </div>
                        <div className="font-russo text-xs text-white/50">
                          {stat.sublabel}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Mock Panel */}
            <div className="flex justify-center lg:justify-end lg:sticky top-24 order-1 lg:order-2">
              <div className="w-full max-w-sm lg:max-w-sm">
                <MockInstrumentsPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SectionInstrumentsPanel.displayName = "SectionInstrumentsPanel";
