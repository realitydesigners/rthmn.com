"use client";

import { memo, useState, useMemo, useRef, useCallback, useEffect } from "react";
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
import { FaSearch, FaStar, FaTimes } from "react-icons/fa";
import { cn } from "@/utils/cn";
import {
  FOREX_PAIRS,
  CRYPTO_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
  formatPrice,
  INSTRUMENTS,
} from "@/utils/instruments";
import { useColorStore, usePresetStore } from "@/stores/colorStore";

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

// Demo Instruments Panel Content - Enhanced to match real InstrumentsPanel
export const DemoInstrumentsPanel = memo(() => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("selected");
  const [selectedPairs, setSelectedPairs] = useState([
    "EURUSD",
    "BTCUSD",
    "ETHUSD",
    "GBPUSD",
    "AAPL",
  ]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use real instrument data
  const mockPriceData = useMemo(() => createMockPriceData(), []);

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
        const aSelected = selectedPairs.includes(a);
        const bSelected = selectedPairs.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      });
  }, [searchQuery, selectedPairs, isSearching]);

  // Memoized available pairs groups
  // Demo components matching the real ones exactly
  const DemoLoadingSpinner = ({ color = "#3b82f6" }: { color?: string }) => {
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

  const DemoPairItem = memo(
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
                {price ? (
                  formatPrice(price, item)
                ) : (
                  <DemoLoadingSpinner color={isSelected ? "#4EFF6E" : "#444"} />
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

  const DemoPairGroup = memo(
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
  const DemoSearchPairItem = memo(
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
                {price ? (
                  formatPrice(price, item)
                ) : (
                  <DemoLoadingSpinner color={isSelected ? "#4EFF6E" : "#444"} />
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

  const DemoSearchBar = memo(
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

  const DemoFilterButton = ({
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
          (item) => !selectedPairs.includes(item)
        );
        if (availablePairs.length === 0) return null;

        const items = availablePairs.map((item) => (
          <DemoPairItem
            key={item}
            item={item}
            isSelected={false}
            onToggle={() => togglePair(item)}
          />
        ));

        return (
          <DemoPairGroup
            key={group.label}
            label={group.label}
            items={items}
            count={availablePairs.length}
          />
        );
      })
      .filter(Boolean);
  }, [selectedPairs, isSearching]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="w-full flex gap-2 w-auto ">
        <div className="w-auto overflow-x-auto flex flex-wrap gap-2 py-2">
          <DemoFilterButton
            isActive={activeFilter === "selected"}
            onClick={() => scrollToSection("selected")}
            label={<FaStar size={10} />}
          />
          <DemoFilterButton
            isActive={activeFilter === "fx"}
            onClick={() => scrollToSection("fx")}
            label="FX"
          />
          <DemoFilterButton
            isActive={activeFilter === "crypto"}
            onClick={() => scrollToSection("crypto")}
            label="Crypto"
          />
          <DemoFilterButton
            isActive={activeFilter === "stocks"}
            onClick={() => scrollToSection("stocks")}
            label="Stocks"
          />
          <DemoFilterButton
            isActive={activeFilter === "etf"}
            onClick={() => scrollToSection("etf")}
            label="ETF"
          />
        </div>
      </div>
      <div className="flex-none overflow-hidden w-full mb-2">
        <DemoSearchBar
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
        className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                    <DemoSearchPairItem
                      key={pair}
                      item={pair}
                      searchQuery={searchQuery}
                      isSelected={selectedPairs.includes(pair)}
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
              {selectedPairs.length > 0 && (
                <div data-section="selected">
                  <DemoPairGroup
                    label="Selected Pairs"
                    items={selectedPairs.map((item) => (
                      <DemoPairItem
                        key={item}
                        item={item}
                        isSelected={true}
                        onToggle={() => togglePair(item)}
                      />
                    ))}
                    count={selectedPairs.length}
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
  );
});

DemoInstrumentsPanel.displayName = "DemoInstrumentsPanel";

// Demo Visualizer Panel Content
export const DemoVisualizerPanel = memo(() => {
  const [activeChartStyle, setActiveChartStyle] = useState("box");
  const [timeframePosition, setTimeframePosition] = useState(15);
  const [timeframeWidth, setTimeframeWidth] = useState(8);

  // Custom Square icon component
  const SquareIcon = ({
    size = 24,
    className,
  }: {
    size?: number;
    className?: string;
  }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Square box icon"
    >
      <title>Square box icon</title>
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );

  const chartStyles = [
    {
      id: "box",
      title: "Box",
      icon: SquareIcon,
      locked: false,
      description: "Classic box visualization",
    },
    {
      id: "3d",
      title: "3D",
      icon: LuBox,
      locked: false,
      description: "3D visualization of boxes",
    },
    {
      id: "line",
      title: "Line",
      icon: LuLineChart,
      locked: true,
      description: "Traditional line chart view",
      comingSoon: true,
    },
  ];

  const timeIntervals = [
    { label: "1D", minutes: 1440 },
    { label: "12H", minutes: 720 },
    { label: "6H", minutes: 360 },
    { label: "4H", minutes: 240 },
    { label: "2H", minutes: 120 },
    { label: "1H", minutes: 60 },
    { label: "30m", minutes: 30 },
    { label: "15m", minutes: 15 },
    { label: "5m", minutes: 5 },
    { label: "1m", minutes: 1 },
  ];

  // Demo Chart Style Option Component
  const DemoChartStyleOption = ({
    id,
    title,
    icon: Icon,
    locked,
    onClick,
  }: {
    id: string;
    title: string;
    icon: React.ComponentType<{ size: number; className?: string }>;
    locked: boolean;
    onClick?: () => void;
  }) => {
    const isActive = activeChartStyle === id;

    return (
      <button
        type="button"
        onClick={locked ? undefined : onClick}
        className={cn(
          "group relative flex h-[72px] flex-col items-center justify-center gap-2 rounded-lg border transition-all duration-300",
          isActive
            ? [
                "border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
                "shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                "hover:border-[#1C1E23] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
              ]
            : [
                "border-[#111215] bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/80",
                "hover:border-[#1C1E23] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
              ],
          locked ? "pointer-events-none opacity-90" : "cursor-pointer"
        )}
      >
        {/* Background glow effect */}
        {isActive && !locked && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]" />
        )}

        {/* Diagonal stripes for locked state */}
        {locked && (
          <>
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  135deg,
                  #000,
                  #000 1px,
                  transparent 1.5px,
                  transparent 6px
                )`,
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  #000,
                  #000 1px,
                  transparent 1.5px,
                  transparent 6px
                )`,
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  135deg,
                  #fff,
                  #fff 1px,
                  transparent 1.5px,
                  transparent 6px
                )`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5" />
          </>
        )}

        {/* Lock icon */}
        {locked && (
          <div className="pointer-events-none absolute -top-1 -right-1 flex items-center">
            <div className="flex h-5 items-center gap-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#1C1E23] bg-gradient-to-b from-black/90 to-black/95 shadow-[0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-[1px]">
                <LuLock className="h-2.5 w-2.5 text-white/80" />
              </div>
            </div>
          </div>
        )}

        {/* Icon container */}
        <div
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b transition-all duration-300",
            locked
              ? "from-[#0A0B0D]/70 to-[#070809]/70 shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
              : isActive
                ? [
                    "from-[#0A0B0D] to-[#070809]",
                    "shadow-[0_2px_4px_rgba(0,0,0,0.4)]",
                    "group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)]",
                  ]
                : [
                    "from-[#0A0B0D] to-[#070809]",
                    "shadow-[0_2px_4px_rgba(0,0,0,0.2)]",
                    "group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
                  ]
          )}
        >
          {!locked && isActive && (
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
          )}
          <Icon
            size={20}
            className={cn(
              "relative transition-all duration-300",
              isActive
                ? "text-[#545963] group-hover:text-white"
                : "text-[#32353C] group-hover:text-[#545963]",
              locked ? "text-[#32353C] opacity-40" : "group-hover:scale-105"
            )}
          />
        </div>

        {/* Title */}
        <span
          className={cn(
            "font-outfit text-[13px] font-medium tracking-wide transition-all duration-300",
            locked
              ? "text-[#32353C]/40"
              : isActive
                ? "text-[#545963]"
                : "text-[#32353C] group-hover:text-[#545963]"
          )}
        >
          {title}
        </span>
      </button>
    );
  };

  // Demo Timeframe Slider Component
  const DemoTimeframeSlider = () => {
    const selectionStyle = {
      transform: `translateX(${(timeframePosition / 38) * 100}%) scaleX(${timeframeWidth / 38})`,
      transformOrigin: "left",
      width: "100%",
    };

    return (
      <div className="relative h-full px-[7px] pb-6">
        {/* Main slider container */}
        <div className="group/bars relative flex h-12 items-center touch-none">
          {/* Base layer */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <title>Background Pattern</title>
              <defs>
                <pattern
                  id="diagonalLines"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diagonalLines)" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-[#070809] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.3)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/20" />

          {/* Selection area */}
          <div
            className="absolute h-full bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-[inset_0_0_30px_rgba(255,255,255,0.05),0_0_15px_rgba(0,0,0,0.8)]"
            style={selectionStyle}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,rgba(255,255,255,0.08),transparent_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-[#111215]" />
            </div>

            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#1C1E23] to-transparent" />
            <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/30 via-[#32353C] to-[#1C1E23]" />
            <div className="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-white/30 via-[#32353C] to-[#1C1E23]" />
          </div>
        </div>

        {/* Time intervals scale */}
        <div className="mt-2 w-full">
          <div className="flex w-full justify-between px-[7px]">
            {timeIntervals.map((interval, i) => {
              const position = (i / (timeIntervals.length - 1)) * 37;
              const isInRange =
                position >= timeframePosition &&
                position <= timeframePosition + timeframeWidth;

              return (
                <div
                  key={interval.label}
                  className="flex flex-col items-center"
                >
                  <div
                    className={cn(
                      "h-3 w-[1px] transition-all duration-200",
                      isInRange
                        ? "bg-gradient-to-b from-white/90 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                        : "bg-gradient-to-b from-white/20 to-transparent"
                    )}
                  />
                  <span
                    className={cn(
                      "mt-1 font-kodemono text-[9px] tracking-wider transition-all duration-200",
                      isInRange
                        ? "text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        : "text-white/30",
                      "whitespace-nowrap"
                    )}
                  >
                    {interval.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      {/* Chart Style Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuLineChart size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Chart Style
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {chartStyles.map((style) => (
            <DemoChartStyleOption
              key={style.id}
              {...style}
              onClick={() => !style.locked && setActiveChartStyle(style.id)}
            />
          ))}
        </div>
      </div>

      {/* Timeframe Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuLayoutGrid size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Timeframe
          </h3>
        </div>
        <div
          className="rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-3"
          style={{
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <DemoTimeframeSlider />
        </div>
        {/* CSS Styles for range inputs */}
        <style jsx global>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: var(--thumb-size);
            width: var(--thumb-size);
            border-radius: 50%;
            background: var(--thumb-color);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            cursor: grab;
            transition: all 0.15s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.25);
          }
          input[type="range"]::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(0.95);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.08);
          }
          input[type="range"]::-webkit-slider-runnable-track {
            background: transparent;
          }
        `}</style>
      </div>
    </div>
  );
});

DemoVisualizerPanel.displayName = "DemoVisualizerPanel";

// Demo Settings Panel Content
export const DemoSettingsPanel = memo(() => {
  const { boxColors, updateBoxColors, updateStyles } = useColorStore();
  const { presets, selectedPreset, selectPreset } = usePresetStore();
  const [customPositive, setCustomPositive] = useState(boxColors.positive);
  const [customNegative, setCustomNegative] = useState(boxColors.negative);
  const [boxStyle, setBoxStyle] = useState("gradient");

  const settings = [
    { label: "Dark Mode", enabled: true },
    { label: "Real-time Updates", enabled: true },
    { label: "Sound Alerts", enabled: false },
    { label: "Email Notifications", enabled: true },
  ];

  // Update custom colors when box colors change
  useEffect(() => {
    setCustomPositive(boxColors.positive);
    setCustomNegative(boxColors.negative);
  }, [boxColors.positive, boxColors.negative]);

  const handlePresetSelect = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (preset) {
      selectPreset(presetName);
      updateBoxColors({
        positive: preset.positive,
        negative: preset.negative,
        styles: preset.styles,
      });
    }
  };

  const handleCustomColorChange = (
    type: "positive" | "negative",
    color: string
  ) => {
    if (type === "positive") {
      setCustomPositive(color);
      updateBoxColors({ positive: color });
    } else {
      setCustomNegative(color);
      updateBoxColors({ negative: color });
    }
    // Clear preset selection when using custom colors
    selectPreset(null);
  };

  const boxStyles = [
    {
      id: "gradient",
      name: "Gradient",
      preview: "linear-gradient(135deg, #4EFF6E, #2DD4BF)",
    },
    { id: "solid", name: "Solid", preview: "#4EFF6E" },
    { id: "outline", name: "Outline", preview: "transparent" },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Color Style Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuPalette size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Color Style
          </h3>
        </div>
        <div
          className="rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-2 space-y-4"
          style={{
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Presets Grid */}
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => {
              const isSelected = selectedPreset === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset.name)}
                  className={cn(
                    "group relative flex h-[72px] flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-b p-2 transition-all duration-200",
                    isSelected
                      ? "border-[#1C1E23] from-[#1C1E23]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#32353C] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90"
                      : "border-[#0A0B0D] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#1C1E23] hover:from-[#1C1E23]/40 hover:to-[#0F0F0F]/50"
                  )}
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 30%, ${preset.positive}${isSelected ? "11" : "05"}, ${preset.negative}${isSelected ? "22" : "08"})`,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div
                    className={cn(
                      "absolute inset-0",
                      isSelected ? "opacity-50" : "opacity-20"
                    )}
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${preset.positive}${isSelected ? "22" : "11"}, ${preset.negative}${isSelected ? "33" : "15"})`,
                    }}
                  />

                  <div className="relative h-8 w-8 overflow-hidden rounded-full shadow-xl">
                    <div
                      className="absolute inset-0 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${preset.positive}, ${preset.negative})`,
                        boxShadow: `
                          inset 0 0 15px ${preset.positive}66,
                          inset 2px 2px 4px ${preset.positive}33,
                          0 0 20px ${preset.positive}22
                        `,
                      }}
                    />
                  </div>

                  <div className="relative flex flex-col items-center">
                    <span className="font-kodemono text-[8px] font-medium tracking-widest text-[#32353C] uppercase transition-colors group-hover:text-[#818181]">
                      {preset.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Color Inputs */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-kodemono text-[10px] font-medium tracking-wider text-[#32353C] uppercase">
                Custom Colors
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="group flex flex-col gap-2">
                <div className="relative h-10 w-full overflow-hidden rounded-lg border border-[#0A0B0D] bg-[#0C0C0C] transition-all duration-200 hover:border-[#1C1E23] hover:bg-[#111]">
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="font-kodemono text-[8px] font-medium tracking-wider text-[#32353C] uppercase">
                      Up Trend
                    </span>
                    <div
                      className="ml-auto h-6 w-6 rounded-full shadow-lg"
                      style={{
                        background: customPositive,
                        boxShadow: `0 0 10px ${customPositive}33`,
                      }}
                    />
                  </div>
                  <input
                    type="color"
                    value={customPositive}
                    onChange={(e) =>
                      handleCustomColorChange("positive", e.target.value)
                    }
                    className="h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>
              <div className="group flex flex-col gap-2">
                <div className="relative h-10 w-full overflow-hidden rounded-lg border border-[#0A0B0D] bg-[#0C0C0C] transition-all duration-200 hover:border-[#1C1E23] hover:bg-[#111]">
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="font-kodemono text-[8px] font-medium tracking-wider text-[#32353C] uppercase">
                      Dn Trend
                    </span>
                    <div
                      className="ml-auto h-6 w-6 rounded-full shadow-lg"
                      style={{
                        background: customNegative,
                        boxShadow: `0 0 10px ${customNegative}33`,
                      }}
                    />
                  </div>
                  <input
                    type="color"
                    value={customNegative}
                    onChange={(e) =>
                      handleCustomColorChange("negative", e.target.value)
                    }
                    className="h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Box Style Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuBox size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Box Style
          </h3>
        </div>
        <div
          className="rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] space-y-2"
          style={{
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="flex flex-col gap-2">
            {/* Preview Container */}
            <div className="group relative flex flex-col overflow-hidden rounded-lg transition-all duration-300">
              <div className="relative flex flex-col rounded-lg">
                {/* Grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />

                <div className="relative flex h-full items-center justify-center p-8">
                  {/* Preview Box */}
                  <div
                    className={cn(
                      "relative h-24 w-24 transition-all duration-300",
                      boxColors.styles?.showBorder && "border border-[#111215]"
                    )}
                    style={{
                      borderRadius: `${boxColors.styles?.borderRadius || 4}px`,
                      boxShadow: `
                        inset 0 0 ${(boxColors.styles?.shadowIntensity || 0.4) * 50}px rgba(255, 255, 255, ${(boxColors.styles?.shadowIntensity || 0.4) * 0.3}),
                        0 0 20px rgba(255, 255, 255, 0.05)
                      `,
                      backgroundColor: `rgba(255, 255, 255, ${(boxColors.styles?.opacity || 0.61) * 0.1})`,
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-300"
                      style={{
                        borderRadius: `${boxColors.styles?.borderRadius || 4}px`,
                        background: `
                          radial-gradient(circle at center, 
                            rgba(255, 255, 255, ${(boxColors.styles?.opacity || 0.61) * 0.05}),
                            transparent 70%
                          )
                        `,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Container */}
            <div className="flex flex-col gap-2 p-4">
              {/* StyleControl components */}
              <div className="group relative space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-russo text-[8px] font-medium tracking-wider text-[#BFC2CA] uppercase">
                      Border Radius
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-russo text-[8px] text-white/70">
                      {boxColors.styles?.borderRadius || 4}
                    </span>
                    <span className="font-russo text-[8px] tracking-wider text-white/30 uppercase">
                      px
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex w-full items-center px-2">
                    <div className="relative h-[1px] w-full bg-white/[0.06]">
                      <div
                        className="absolute h-full bg-gradient-to-r from-[#32353C] to-[#1C1E23]"
                        style={{
                          width: `${(((boxColors.styles?.borderRadius || 4) - 0) / (16 - 0)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={16}
                    step={1}
                    value={boxColors.styles?.borderRadius || 4}
                    onChange={(e) =>
                      updateStyles({
                        borderRadius: Number.parseInt(e.target.value),
                      })
                    }
                    className="relative h-6 w-full cursor-pointer appearance-none rounded-md bg-transparent transition-all hover:cursor-grab active:cursor-grabbing"
                    style={
                      {
                        "--thumb-size": "12px",
                        "--thumb-color": "#fff",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              <div className="group relative space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-russo text-[8px] font-medium tracking-wider text-[#BFC2CA] uppercase">
                      Shadow Depth
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-russo text-[8px] text-white/70">
                      {(boxColors.styles?.shadowIntensity || 0.4).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex w-full items-center px-2">
                    <div className="relative h-[1px] w-full bg-white/[0.06]">
                      <div
                        className="absolute h-full bg-gradient-to-r from-[#32353C] to-[#1C1E23]"
                        style={{
                          width: `${(boxColors.styles?.shadowIntensity || 0.4) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={boxColors.styles?.shadowIntensity || 0.4}
                    onChange={(e) =>
                      updateStyles({
                        shadowIntensity: Number.parseFloat(e.target.value),
                      })
                    }
                    className="relative h-6 w-full cursor-pointer appearance-none rounded-md bg-transparent transition-all hover:cursor-grab active:cursor-grabbing"
                    style={
                      {
                        "--thumb-size": "12px",
                        "--thumb-color": "#fff",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              <div className="group relative space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-russo text-[8px] font-medium tracking-wider text-[#BFC2CA] uppercase">
                      Opacity
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-russo text-[8px] text-white/70">
                      {(boxColors.styles?.opacity || 0.61).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex w-full items-center px-2">
                    <div className="relative h-[1px] w-full bg-white/[0.06]">
                      <div
                        className="absolute h-full bg-gradient-to-r from-[#32353C] to-[#1C1E23]"
                        style={{
                          width: `${(boxColors.styles?.opacity || 0.61) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={1}
                    step={0.05}
                    value={boxColors.styles?.opacity || 0.61}
                    onChange={(e) =>
                      updateStyles({
                        opacity: Number.parseFloat(e.target.value),
                      })
                    }
                    className="relative h-6 w-full cursor-pointer appearance-none rounded-md bg-transparent transition-all hover:cursor-grab active:cursor-grabbing"
                    style={
                      {
                        "--thumb-size": "12px",
                        "--thumb-color": "#fff",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              {/* Toggle Controls */}
              <div className="flex flex-col gap-2 px-1 py-2">
                <div className="group flex w-full items-center justify-between">
                  <span className="font-russo text-[13px] font-medium tracking-wide text-[#32353C] transition-colors duration-300 group-hover:text-[#545963]">
                    Show Border
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateStyles({
                        showBorder: !boxColors.styles?.showBorder,
                      })
                    }
                    className={cn(
                      "relative h-5 w-10 cursor-pointer rounded-full border transition-all duration-300",
                      "bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
                      boxColors.styles?.showBorder
                        ? [
                            "border-[#1C1E23]",
                            "shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                            "hover:border-white/[0.08] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
                          ]
                        : [
                            "border-[#111215]",
                            "hover:border-[#1C1E23] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                          ]
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-opacity duration-300",
                        boxColors.styles?.showBorder
                          ? "bg-[#1C1E23]"
                          : "bg-[#111215]"
                      )}
                    />
                    <div
                      className={cn(
                        "absolute top-0.5 rounded-full transition-all duration-300 h-4 w-4",
                        "bg-[#32353C] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                        boxColors.styles?.showBorder
                          ? [
                              "translate-x-[1.375rem]",
                              "bg-white/80",
                              "hover:bg-white",
                            ]
                          : ["translate-x-0.5", "hover:bg-[#545963]"]
                      )}
                    />
                  </button>
                </div>
                <div className="group flex w-full items-center justify-between">
                  <span className="font-russo text-[13px] font-medium tracking-wide text-[#32353C] transition-colors duration-300 group-hover:text-[#545963]">
                    Show Price Lines
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateStyles({
                        showLineChart: !boxColors.styles?.showLineChart,
                      })
                    }
                    className={cn(
                      "relative h-5 w-10 cursor-pointer rounded-full border transition-all duration-300",
                      "bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
                      boxColors.styles?.showLineChart
                        ? [
                            "border-[#1C1E23]",
                            "shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                            "hover:border-white/[0.08] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
                          ]
                        : [
                            "border-[#111215]",
                            "hover:border-[#1C1E23] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                          ]
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-opacity duration-300",
                        boxColors.styles?.showLineChart
                          ? "bg-[#1C1E23]"
                          : "bg-[#111215]"
                      )}
                    />
                    <div
                      className={cn(
                        "absolute top-0.5 rounded-full transition-all duration-300 h-4 w-4",
                        "bg-[#32353C] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                        boxColors.styles?.showLineChart
                          ? [
                              "translate-x-[1.375rem]",
                              "bg-white/80",
                              "hover:bg-white",
                            ]
                          : ["translate-x-0.5", "hover:bg-[#545963]"]
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DemoSettingsPanel.displayName = "DemoSettingsPanel";
