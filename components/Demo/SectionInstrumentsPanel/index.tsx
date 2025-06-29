"use client";

import { cn } from "@/utils/cn";
import {
  CRYPTO_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
  FOREX_PAIRS,
  formatPrice,
} from "@/utils/instruments";
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
} from "react-icons/lu";

// Generate mock prices for instruments using real data
const generateMockPrice = (symbol: string) => {
  const hash = symbol
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = ((hash * 9301 + 49297) % 233280) / 233280; // Deterministic "random"

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

// Instruments Panel Component - Realistic design matching DemoInstrumentsPanel
const InstrumentsPanel = memo(() => {
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Use real instrument data
  const mockPriceData = useMemo(() => createMockPriceData(), []);

  // Client-side hydration guard
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isSearching = !!searchQuery;

  // Toggle pair selection
  const togglePair = (pair: string) => {
    setSelectedPairs((prev) => {
      if (prev.includes(pair)) {
        return prev.filter((p) => p !== pair);
      } else {
        return [...prev, pair];
      }
    });
  };

  const scrollToSection = useCallback((filter: string) => {
    setActiveFilter(filter);

    // Give time for the DOM to update
    setTimeout(() => {
      const element = document.querySelector(`[data-section="${filter}"]`);
      if (element && contentRef.current) {
        const headerHeight = 200; // Approximate height of search + filters
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition - headerHeight;

        contentRef.current.scrollTo({
          top: contentRef.current.scrollTop + offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  }, []);

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!isSearching) return [];

    const allPairs = [
      ...FOREX_PAIRS,
      ...CRYPTO_PAIRS,
      ...EQUITY_PAIRS,
      ...ETF_PAIRS,
    ];

    return allPairs
      .filter((pair) => pair.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const aSelected = favorites.includes(a);
        const bSelected = favorites.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      });
  }, [searchQuery, favorites, isSearching]);

  // Loading spinner component
  const LoadingSpinner = ({ color = "#3b82f6" }: { color?: string }) => {
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, 10000);

      return () => clearTimeout(timer);
    }, []);

    if (showFallback) {
      return (
        <span className="font-mono text-[11px] tracking-wider opacity-50">
          N/A
        </span>
      );
    }

    return (
      <div className="relative h-3 w-3">
        <div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: `${color}20` }}
        />
        <div
          className="absolute inset-0 animate-spin rounded-full border-t-2"
          style={{ borderColor: color }}
        />
      </div>
    );
  };

  const PairItem = memo(
    ({
      item,
      isSelected = false,
      onToggle,
    }: {
      item: string;
      isSelected?: boolean;
      onToggle: () => void;
    }) => {
      const price = mockPriceData[item]?.price;

      return (
        <div
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
            {/* Instrument name */}
            <span
              className={cn(
                "font-outfit flex-1 text-sm font-bold tracking-wide transition-colors",
                isSelected
                  ? "text-white"
                  : "text-[#32353C] group-hover/item:text-[#545963]"
              )}
            >
              {item}
            </span>

            {/* Price */}
            <div className="flex items-center">
              <span
                className={cn(
                  "font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors",
                  isSelected
                    ? "text-[#545963]"
                    : "text-[#32353C] group-hover/item:text-[#32353C]"
                )}
              >
                {price && isClient ? (
                  formatPrice(price, item)
                ) : (
                  <LoadingSpinner color={isSelected ? "#4EFF6E" : "#444"} />
                )}
              </span>
              <div className="z-90 ml-2 flex w-6 justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className={cn(
                    "relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
                    "opacity-0 group-hover/item:opacity-100",
                    isSelected
                      ? [
                          "border-[#111215] bg-[#111215] text-white/40",
                          "hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
                        ]
                      : [
                          "border-[#111215] bg-[#111215] text-white/40",
                          "hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
                        ]
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

  const PairGroup = memo(
    ({
      label,
      items,
      count,
    }: {
      label: string;
      items: React.ReactNode;
      count: number;
    }) => {
      return (
        <div className="mb-8">
          <div className="space-y-1 animate-in fade-in duration-300">
            {items}
          </div>
        </div>
      );
    }
  );

  // Search result item with highlighting
  const SearchPairItem = memo(
    ({
      item,
      searchQuery: query,
      isSelected = false,
      onToggle,
    }: {
      item: string;
      searchQuery: string;
      isSelected?: boolean;
      onToggle: () => void;
    }) => {
      const price = mockPriceData[item]?.price;

      // Highlight component
      const HighlightedText = ({
        text,
        highlight,
      }: {
        text: string;
        highlight: string;
      }) => {
        if (!highlight.trim()) {
          return <span>{text}</span>;
        }

        const regex = new RegExp(`(${highlight})`, "gi");
        const parts = text.split(regex);

        return (
          <span>
            {parts.map((part, index) =>
              regex.test(part) ? (
                <span
                  key={index}
                  className="bg-[#4EFF6E] text-[#111316] px-1 rounded-sm font-medium"
                >
                  {part}
                </span>
              ) : (
                <span key={index}>{part}</span>
              )
            )}
          </span>
        );
      };

      return (
        <div
          className={cn(
            "group/item relative flex h-10 w-full items-center transition-all duration-300 select-none overflow-hidden",
            isSelected
              ? "rounded bg-gradient-to-b from-[#191B1F] to-[#131618] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              : "rounded-lg"
          )}
          style={isSelected ? { borderRadius: "4px" } : {}}
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
            {/* Instrument name with highlighting */}
            <span
              className={cn(
                "font-outfit flex-1 text-sm font-bold tracking-wide transition-colors",
                isSelected
                  ? "text-white"
                  : "text-[#32353C] group-hover/item:text-[#545963]"
              )}
            >
              <HighlightedText text={item} highlight={query} />
            </span>

            {/* Price */}
            <div className="flex items-center">
              <span
                className={cn(
                  "font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors",
                  isSelected
                    ? "text-[#545963]"
                    : "text-[#32353C] group-hover/item:text-[#32353C]"
                )}
              >
                {price && isClient ? (
                  formatPrice(price, item)
                ) : (
                  <LoadingSpinner color={isSelected ? "#4EFF6E" : "#444"} />
                )}
              </span>
              <div className="z-90 ml-2 flex w-6 justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className={cn(
                    "relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
                    "opacity-0 group-hover/item:opacity-100",
                    isSelected
                      ? [
                          "border-[#111215] bg-[#111215] text-white/40",
                          "hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
                        ]
                      : [
                          "border-[#111215] bg-[#111215] text-white/40",
                          "hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
                        ]
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

  const SearchBar = memo(
    ({
      searchQuery: query,
      onSearchChange,
      onFocus,
      onBlur,
      isFocused,
    }: {
      searchQuery: string;
      onSearchChange: (query: string) => void;
      onFocus: () => void;
      onBlur: () => void;
      isFocused: boolean;
    }) => {
      const inputRef = useRef<HTMLInputElement>(null);

      // Keyboard shortcut to focus search
      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "/" && !isFocused) {
            e.preventDefault();
            inputRef.current?.focus();
          }
          if (e.key === "Escape" && isFocused) {
            inputRef.current?.blur();
            onSearchChange("");
          }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }, [isFocused, onSearchChange]);

      return (
        <div className="relative">
          {/* Search Input */}
          <div
            className="group/search relative flex h-10 items-center overflow-hidden transition-all duration-300"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Search Icon */}
            <div
              className={cn(
                "relative ml-3 transition-colors duration-300",
                isFocused ? "text-[#4EFF6E]" : "text-[#32353C]"
              )}
            >
              <FaSearch size={12} />
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              spellCheck={false}
              placeholder="Search instruments..."
              value={query}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/\s/g, "");
                onSearchChange(value);
              }}
              onFocus={onFocus}
              onBlur={onBlur}
              className="font-outfit relative h-full flex-1 bg-transparent px-3 text-[13px] font-medium text-white placeholder-[#545963] transition-colors outline-none"
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="relative mr-3 flex h-5 w-5 items-center justify-center rounded-md border border-[#111215] bg-[#111215] text-white/40 transition-all hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
              >
                <FaTimes size={8} />
              </button>
            )}

            {/* Keyboard hint */}
            {!isFocused && !query && (
              <div className="absolute right-3 text-[10px] text-[#32353C] font-outfit">
                /
              </div>
            )}
          </div>
        </div>
      );
    }
  );

  const FilterButton = ({
    isActive,
    onClick,
    label,
  }: {
    isActive: boolean;
    onClick: () => void;
    label: React.ReactNode;
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group rounded-full px-4 relative w-auto flex flex h-7 min-w-7 justify-center items-center px-2",
          "transition-all duration-300 ease-in-out overflow-hidden"
        )}
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
        <span
          className={cn(
            "relative z-10 font-outfit text-[12px] font-medium tracking-wide whitespace-nowrap flex items-center justify-center",
            "transition-colors duration-300 ease-in-out",
            "text-white"
          )}
        >
          {label}
        </span>
      </button>
    );
  };

  // Memoized available pairs groups - defined after all components to avoid lexical declaration issues
  const availablePairsGroups = useMemo(() => {
    if (isSearching) return [];

    return [
      { label: "FX", items: FOREX_PAIRS },
      { label: "CRYPTO", items: CRYPTO_PAIRS },
      { label: "STOCKS", items: EQUITY_PAIRS },
      { label: "ETF", items: ETF_PAIRS },
    ]
      .map((group) => {
        const availablePairs = group.items.filter(
          (item) => !favorites.includes(item)
        );
        if (availablePairs.length === 0) return null;

        const items = availablePairs.map((item) => (
          <PairItem
            key={item}
            item={item}
            isSelected={false}
            onToggle={() => togglePair(item)}
          />
        ));

        return (
          <PairGroup
            key={group.label}
            label={group.label}
            items={items}
            count={availablePairs.length}
          />
        );
      })
      .filter(Boolean);
  }, [favorites, isSearching, isClient]);

  if (!isClient) {
    // Show loading state during SSR/hydration
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[#545963] text-sm">Loading instruments...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#0A0B0D] to-[#070809] border border-[#1C1E23]/60 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent_50%)] rounded-xl" />

      {/* Top border highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="p-4 sm:p-6 border-b border-[#111215]">
        <h3 className="font-russo text-lg font-bold text-white uppercase tracking-tight mb-4">
          Instruments
        </h3>

        <div className="h-full flex flex-col overflow-hidden">
          <div className="w-full flex gap-2 w-auto ">
            <div className="w-auto overflow-x-auto flex flex-wrap gap-2 py-2">
              <FilterButton
                isActive={activeFilter === "selected"}
                onClick={() => scrollToSection("selected")}
                label={<FaStar size={10} />}
              />
              <FilterButton
                isActive={activeFilter === "fx"}
                onClick={() => scrollToSection("fx")}
                label="FX"
              />
              <FilterButton
                isActive={activeFilter === "crypto"}
                onClick={() => scrollToSection("crypto")}
                label="Crypto"
              />
              <FilterButton
                isActive={activeFilter === "stocks"}
                onClick={() => scrollToSection("stocks")}
                label="Stocks"
              />
              <FilterButton
                isActive={activeFilter === "etf"}
                onClick={() => scrollToSection("etf")}
                label="ETF"
              />
            </div>
          </div>
          <div className="flex-none overflow-hidden w-full mb-2">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              isFocused={isSearchFocused}
            />
          </div>

          {/* Scrollable content section */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-96"
          >
            <div className="space-y-4">
              {/* Search Results */}
              {isSearching && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="pl-1 flex items-center gap-2">
                      <h3 className="font-outfit text-xs font-medium text-white">
                        Search Results
                      </h3>
                    </div>
                    <div
                      className="px-2 py-1 text-xs font-outfit font-medium text-white rounded-full"
                      style={{
                        background:
                          "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      {searchResults.length} found
                    </div>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((pair) => (
                        <SearchPairItem
                          key={pair}
                          item={pair}
                          searchQuery={searchQuery}
                          isSelected={favorites.includes(pair)}
                          onToggle={() => togglePair(pair)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 text-3xl opacity-50">🔍</div>
                      <div className="font-outfit text-sm text-[#545963] mb-2">
                        No instruments found matching
                      </div>
                      <div
                        className="font-outfit text-sm font-medium px-3 py-1 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                          color: "#4EFF6E",
                        }}
                      >
                        "{searchQuery}"
                      </div>
                      <div className="font-outfit text-xs text-[#32353C] mt-3">
                        Try searching for forex pairs, crypto, stocks, or ETFs
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Regular Content */}
              {!isSearching && (
                <>
                  {favorites.length > 0 && (
                    <div data-section="selected">
                      <PairGroup
                        label="Selected Pairs"
                        items={favorites.map((item) => (
                          <PairItem
                            key={item}
                            item={item}
                            isSelected={true}
                            onToggle={() => togglePair(item)}
                          />
                        ))}
                        count={favorites.length}
                      />
                    </div>
                  )}
                  {availablePairsGroups.map((group) => (
                    <div
                      key={group.props.label}
                      data-section={group.props.label.toLowerCase()}
                    >
                      {group}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InstrumentsPanel.displayName = "InstrumentsPanel";

export const SectionInstrumentsPanel = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full py-16 sm:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-start">
            {/* Left side - Enhanced Marketing Content */}
            <div className="space-y-8 sm:space-y-12 order-2 lg:order-1">
              {/* Header Section */}
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
                {/* Feature 1 - Lightning Search */}
                <div className="group relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-br from-[#0A0B0D] via-[#070809] to-[#050506] p-8 hover:border-white/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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

                {/* Feature 2 - Smart Organization */}
                <div className="group relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-br from-[#0A0B0D] via-[#070809] to-[#050506] p-8 hover:border-white/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                      . Your most profitable trades, always within reach.
                    </p>

                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      {["★", "₿", "€", "$"].map((icon, i) => (
                        <div
                          key={icon}
                          className="px-2 py-1 rounded bg-white/10 border border-white/20"
                        >
                          <span className="font-russo text-xs font-medium text-white/80">
                            {icon}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-Time Performance Showcase */}
              <div className="relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-r from-[#0A0B0D] via-[#070809] to-[#050506] p-8">
                <div className="relative z-10 flex items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20">
                        <span className="font-russo text-xs font-bold text-white uppercase tracking-wider">
                          LIVE DATA
                        </span>
                      </div>
                      <h3 className="font-russo text-2xl font-black text-white uppercase tracking-tight">
                        Real-Time Prices
                      </h3>
                    </div>

                    <p className="font-russo text-white/70 leading-relaxed">
                      Every price updates in real-time. See live market data for
                      Bitcoin at $45,000, Apple at $175, EUR/USD at 1.0850. No
                      delays, no stale data. Make decisions with{" "}
                      <span className="text-white font-semibold">
                        the freshest market information
                      </span>
                      .
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="font-russo text-sm text-white/60">
                          Live streaming data
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="font-russo text-sm text-white/60">
                          300+ instruments
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center">
                        <LuActivity className="w-6 h-6 text-white" />
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
                    label: "Search Speed",
                    sublabel: "Lightning-fast instrument discovery",
                  },
                  {
                    value: "100%",
                    label: "Live Data",
                    sublabel: "Real-time price streaming",
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

            {/* Right side - Instruments Panel */}
            <div className="flex justify-center lg:justify-end lg:sticky top-24 order-1 lg:order-2">
              <div className="w-full max-w-sm lg:max-w-sm">
                <InstrumentsPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SectionInstrumentsPanel.displayName = "SectionInstrumentsPanel";
