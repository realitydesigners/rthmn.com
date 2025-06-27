"use client";

import { memo, useState, useMemo } from "react";
import {
  LuActivity,
  LuBarChart3,
  LuBell,
  LuBox,
  LuLayoutGrid,
  LuLineChart,
  LuLock,
  LuPieChart,
  LuSettings,
  LuTrendingDown,
  LuTrendingUp,
  LuUser,
} from "react-icons/lu";
import { cn } from "@/utils/cn";
import {
  FOREX_PAIRS,
  CRYPTO_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
  formatPrice,
  INSTRUMENTS,
} from "@/utils/instruments";

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
  const [activeFilter, setActiveFilter] = useState("selected");
  const [selectedPairs, setSelectedPairs] = useState([
    "EURUSD",
    "BTCUSD",
    "ETHUSD",
    "GBPUSD",
    "AAPL",
  ]);

  // Use real instrument data
  const mockPriceData = useMemo(() => createMockPriceData(), []);

  // Toggle pair selection
  const togglePairSelection = (pair: string) => {
    setSelectedPairs((prev) => {
      if (prev.includes(pair)) {
        return prev.filter((p) => p !== pair);
      } else {
        return [...prev, pair];
      }
    });
  };

  // Filter pairs based on search and category
  const filteredPairs = useMemo(() => {
    if (searchQuery) {
      const allPairs = [
        ...FOREX_PAIRS,
        ...CRYPTO_PAIRS,
        ...EQUITY_PAIRS,
        ...ETF_PAIRS,
      ];
      return allPairs
        .filter((pair) =>
          pair.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          const aSelected = selectedPairs.includes(a);
          const bSelected = selectedPairs.includes(b);
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return 0;
        });
    }

    // Return pairs by category
    switch (activeFilter) {
      case "selected":
        return selectedPairs;
      case "fx":
        return FOREX_PAIRS;
      case "crypto":
        return CRYPTO_PAIRS;
      case "stocks":
        return EQUITY_PAIRS;
      case "etf":
        return ETF_PAIRS;
      default:
        return [];
    }
  }, [searchQuery, selectedPairs, activeFilter]);

  // Mock pair item component
  const DemoPairItem = ({
    item,
    isSelected = false,
  }: {
    item: string;
    isSelected?: boolean;
  }) => (
    <div
      className={`group/item relative flex h-10 w-full items-center transition-all duration-300 select-none overflow-hidden ${
        isSelected
          ? "rounded bg-gradient-to-b from-[#191B1F] to-[#131618] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          : "rounded-lg"
      }`}
      style={isSelected ? { borderRadius: "4px" } : {}}
    >
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
          className={`font-outfit flex-1 text-sm font-bold tracking-wide transition-colors ${
            isSelected
              ? "text-white"
              : "text-[#32353C] group-hover/item:text-[#545963]"
          }`}
        >
          {item}
        </span>
        <div className="flex items-center">
          <span
            className={`font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors ${
              isSelected
                ? "text-[#545963]"
                : "text-[#32353C] group-hover/item:text-[#32353C]"
            }`}
          >
            {mockPriceData[item]
              ? formatPrice(mockPriceData[item].price, item)
              : "N/A"}
          </span>
          <div className="z-90 ml-2 flex w-6 justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePairSelection(item);
              }}
              className={`relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200 opacity-0 group-hover/item:opacity-100 ${
                isSelected
                  ? "border-[#111215] bg-[#111215] text-white/40 hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
                  : "border-[#111215] bg-[#111215] text-white/40 hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
              }`}
            >
              {isSelected ? "×" : "+"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Mock filter button component
  const DemoFilterButton = ({
    isActive,
    label,
    onClick,
  }: {
    isActive: boolean;
    label: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-auto flex h-7 min-w-7 justify-center items-center px-2 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0"
    >
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
      <span className="relative z-10 font-outfit text-[12px] font-medium tracking-wide whitespace-nowrap flex items-center justify-center transition-colors duration-300 ease-in-out text-white">
        {label}
      </span>
    </button>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter buttons */}
      <div className="w-full overflow-x-auto overflow-y-hidden py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-2 min-w-max">
          <DemoFilterButton
            isActive={activeFilter === "selected"}
            onClick={() => setActiveFilter("selected")}
            label="★"
          />
          <DemoFilterButton
            isActive={activeFilter === "fx"}
            onClick={() => setActiveFilter("fx")}
            label="FX"
          />
          <DemoFilterButton
            isActive={activeFilter === "crypto"}
            onClick={() => setActiveFilter("crypto")}
            label="Crypto"
          />
          <DemoFilterButton
            isActive={activeFilter === "stocks"}
            onClick={() => setActiveFilter("stocks")}
            label="Stocks"
          />
          <DemoFilterButton
            isActive={activeFilter === "etf"}
            onClick={() => setActiveFilter("etf")}
            label="ETF"
          />
        </div>
      </div>

      {/* Search bar */}
      <div className="flex-none overflow-hidden w-full mb-2">
        <div className="relative">
          <div
            className="group/search relative flex h-10 items-center overflow-hidden transition-all duration-300"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="relative ml-3 transition-colors duration-300 text-[#32353C]">
              🔍
            </div>
            <input
              type="text"
              spellCheck={false}
              placeholder="Search instruments..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value.toUpperCase().replace(/\s/g, ""))
              }
              className="font-outfit relative h-full flex-1 bg-transparent px-3 text-[13px] font-medium text-white placeholder-[#545963] transition-colors outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="relative mr-3 flex h-5 w-5 items-center justify-center rounded-md border border-[#111215] bg-[#111215] text-white/40 transition-all hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-4">
          {/* Search Results */}
          {searchQuery && (
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
                  {filteredPairs.length} found
                </div>
              </div>
              {filteredPairs.length > 0 ? (
                <div className="space-y-1">
                  {filteredPairs.map((pair) => (
                    <DemoPairItem
                      key={pair}
                      item={pair}
                      isSelected={selectedPairs.includes(pair)}
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
                </div>
              )}
            </div>
          )}

          {/* Regular Content */}
          {!searchQuery && (
            <>
              {/* Show favorites at top when selected filter is active */}
              {activeFilter === "selected" && selectedPairs.length > 0 && (
                <div className="space-y-1 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="pl-1 flex items-center gap-2">
                      <h3 className="font-outfit text-xs font-medium text-white">
                        Favorites
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
                      {selectedPairs.length}
                    </div>
                  </div>
                  {selectedPairs.map((pair) => (
                    <DemoPairItem key={pair} item={pair} isSelected={true} />
                  ))}
                </div>
              )}

              {/* Show all available pairs when favorites filter is active */}
              {activeFilter === "selected" && (
                <div className="space-y-6">
                  {/* FX Pairs */}
                  <div className="space-y-1">
                    <div className="pl-1 flex items-center gap-2 mb-3">
                      <h3 className="font-outfit text-xs font-medium text-white">
                        FX
                      </h3>
                    </div>
                    {FOREX_PAIRS.filter((pair) => !selectedPairs.includes(pair))
                      .slice(0, 8)
                      .map((pair) => (
                        <DemoPairItem
                          key={pair}
                          item={pair}
                          isSelected={false}
                        />
                      ))}
                  </div>

                  {/* Crypto Pairs */}
                  <div className="space-y-1">
                    <div className="pl-1 flex items-center gap-2 mb-3">
                      <h3 className="font-outfit text-xs font-medium text-white">
                        Crypto
                      </h3>
                    </div>
                    {CRYPTO_PAIRS.filter(
                      (pair) => !selectedPairs.includes(pair)
                    )
                      .slice(0, 8)
                      .map((pair) => (
                        <DemoPairItem
                          key={pair}
                          item={pair}
                          isSelected={false}
                        />
                      ))}
                  </div>

                  {/* Stocks */}
                  <div className="space-y-1">
                    <div className="pl-1 flex items-center gap-2 mb-3">
                      <h3 className="font-outfit text-xs font-medium text-white">
                        Stocks
                      </h3>
                    </div>
                    {EQUITY_PAIRS.filter(
                      (pair) => !selectedPairs.includes(pair)
                    )
                      .slice(0, 8)
                      .map((pair) => (
                        <DemoPairItem
                          key={pair}
                          item={pair}
                          isSelected={false}
                        />
                      ))}
                  </div>

                  {/* ETFs */}
                  <div className="space-y-1">
                    <div className="pl-1 flex items-center gap-2 mb-3">
                      <h3 className="font-outfit text-xs font-medium text-white">
                        ETF
                      </h3>
                    </div>
                    {ETF_PAIRS.filter((pair) => !selectedPairs.includes(pair))
                      .slice(0, 8)
                      .map((pair) => (
                        <DemoPairItem
                          key={pair}
                          item={pair}
                          isSelected={false}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Show all pairs for category filters, with favorites marked */}
              {activeFilter !== "selected" && (
                <div className="space-y-1">
                  {filteredPairs.map((pair) => (
                    <DemoPairItem
                      key={pair}
                      item={pair}
                      isSelected={selectedPairs.includes(pair)}
                    />
                  ))}
                </div>
              )}
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
      </div>

      {/* Display Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuSettings size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Display Settings
          </h3>
        </div>
        <div
          className="rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-4 space-y-3"
          style={{
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-outfit text-xs text-[#545963]">
              Animation Speed
            </span>
            <div className="w-20 h-2 bg-[#1C1E23] rounded-full">
              <div className="w-12 h-2 bg-[#4EFF6E] rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-outfit text-xs text-[#545963]">
              Transparency
            </span>
            <div className="w-20 h-2 bg-[#1C1E23] rounded-full">
              <div className="w-16 h-2 bg-[#4EFF6E] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DemoVisualizerPanel.displayName = "DemoVisualizerPanel";

// Demo Analytics Panel Content
export const DemoAnalyticsPanel = memo(() => {
  const metrics = [
    { label: "RSI", value: "68.5", status: "overbought" },
    { label: "MACD", value: "+0.025", status: "bullish" },
    { label: "Volume", value: "2.1B", status: "high" },
    { label: "Volatility", value: "12.3%", status: "moderate" },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="font-russo text-sm font-medium text-white">
          Technical Analysis
        </h3>
        <p className="font-russo text-xs text-[#818181]">
          Real-time market indicators and signals
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-3"
          >
            <div className="font-russo text-xs text-[#818181] mb-1">
              {metric.label}
            </div>
            <div className="font-russo text-sm font-bold text-white mb-1">
              {metric.value}
            </div>
            <div
              className={`font-russo text-xs ${
                metric.status === "bullish" || metric.status === "high"
                  ? "text-[#24FF66]"
                  : metric.status === "overbought"
                    ? "text-red-400"
                    : "text-blue-400"
              }`}
            >
              {metric.status}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-4">
        <h4 className="font-russo text-sm font-medium text-white mb-3">
          Trading Signals
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#24FF66] rounded-full" />
            <span className="font-russo text-xs text-white">
              Strong Buy Signal - BTC
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span className="font-russo text-xs text-white">
              Hold Signal - ETH
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="font-russo text-xs text-white">
              Sell Signal - SOL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

DemoAnalyticsPanel.displayName = "DemoAnalyticsPanel";

// Demo Settings Panel Content
export const DemoSettingsPanel = memo(() => {
  const settings = [
    { label: "Dark Mode", enabled: true },
    { label: "Real-time Updates", enabled: true },
    { label: "Sound Alerts", enabled: false },
    { label: "Email Notifications", enabled: true },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="font-russo text-sm font-medium text-white">
          Application Settings
        </h3>
        <p className="font-russo text-xs text-[#818181]">
          Customize your trading experience
        </p>
      </div>

      <div className="space-y-2">
        {settings.map((setting) => (
          <div
            key={setting.label}
            className="flex items-center justify-between rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-3"
          >
            <span className="font-russo text-sm text-white">
              {setting.label}
            </span>
            <div
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                setting.enabled ? "bg-[#24FF66]" : "bg-[#1C1E23]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  setting.enabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/60 p-4">
        <h4 className="font-russo text-sm font-medium text-white mb-3">
          Account Info
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30">
              <LuUser size={14} className="text-[#24FF66]" />
            </div>
            <div>
              <div className="font-russo text-sm text-white">Demo User</div>
              <div className="font-russo text-xs text-[#818181]">
                demo@rthmn.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DemoSettingsPanel.displayName = "DemoSettingsPanel";
