"use client";

import React, {
  memo,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuLayoutDashboard,
  LuBarChart3,
  LuChevronUp,
  LuChevronDown,
  LuPlus,
  LuX,
} from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { useUser } from "@/providers/UserProvider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import {
  CRYPTO_PAIRS,
  FOREX_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
} from "@/utils/instruments";
import { formatPrice } from "@/utils/instruments";
import { cn } from "@/utils/cn";

interface ZenModeControlsProps {
  viewMode: "scene" | "focus";
  onViewModeChange: (mode: "scene" | "focus") => void;
  focusedIndex: number;
  pairs: string[];
  onFocusChange: (index: number) => void;
}

interface CompactPairItemProps {
  pair: string;
  isSelected: boolean;
  onToggle: () => void;
  price?: number;
}

const CompactPairItem = memo(
  ({ pair, isSelected, onToggle, price }: CompactPairItemProps) => {
    const { boxColors } = useUser();

    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[#0F1114]/80 hover:bg-[#1A1D22]/80 transition-colors">
        <span className="font-outfit text-xs font-medium text-white min-w-0 flex-1 truncate">
          {pair}
        </span>
        {price && (
          <span className="font-kodemono text-[10px] text-[#818181] tabular-nums">
            {formatPrice(price, pair)}
          </span>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "w-4 h-4 rounded flex items-center justify-center transition-colors",
            isSelected
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
          )}
        >
          {isSelected ? <LuX size={10} /> : <LuPlus size={10} />}
        </button>
      </div>
    );
  }
);

CompactPairItem.displayName = "CompactPairItem";

const CompactPairSelector = memo(() => {
  const { selectedPairs, togglePair } = useUser();
  const { priceData } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const allPairs = useMemo(
    () => [...FOREX_PAIRS, ...CRYPTO_PAIRS, ...EQUITY_PAIRS, ...ETF_PAIRS],
    []
  );

  const filteredPairs = useMemo(() => {
    if (!searchQuery) return allPairs;
    return allPairs.filter((pair) =>
      pair.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPairs, searchQuery]);

  const displayPairs = useMemo(() => {
    const selected = selectedPairs.filter((pair) =>
      pair.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const available = filteredPairs.filter(
      (pair) => !selectedPairs.includes(pair)
    );

    const combinedPairs = [...selected, ...available];
    return showAll ? combinedPairs : combinedPairs.slice(0, 6);
  }, [selectedPairs, filteredPairs, searchQuery, showAll]);

  return (
    <div className="w-full space-y-3">
      {/* Search input */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#818181] w-3.5 h-3.5" />
        <input
          type="text"
          placeholder="Search instruments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-[#0A0B0D]/95 to-[#0F1114]/95 border border-[#1C1E23]/60 rounded-xl text-sm text-white placeholder-[#818181] focus:outline-none focus:border-[#24FF66]/50 focus:shadow-[0_0_0_3px_rgba(36,255,102,0.1)] transition-all duration-200"
        />
      </div>

      {/* Pairs list */}
      <div className="space-y-2 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayPairs.map((pair) => (
          <CompactPairItem
            key={pair}
            pair={pair}
            isSelected={selectedPairs.includes(pair)}
            onToggle={() => togglePair(pair)}
            price={priceData[pair]?.price}
          />
        ))}
      </div>

      {/* Show more/less button */}
      {filteredPairs.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#1C1E23]/60 to-[#24272D]/60 border border-[#32353C]/40 text-sm text-[#818181] hover:text-white hover:border-[#24FF66]/30 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          {showAll ? (
            <>
              Show Less{" "}
              <LuChevronUp
                size={14}
                className="group-hover:translate-y-[-1px] transition-transform"
              />
            </>
          ) : (
            <>
              Show More ({filteredPairs.length - 4}){" "}
              <LuChevronDown
                size={14}
                className="group-hover:translate-y-[1px] transition-transform"
              />
            </>
          )}
        </button>
      )}
    </div>
  );
});

CompactPairSelector.displayName = "CompactPairSelector";

const DynamicContainer = memo(
  ({
    activePanel,
    children,
  }: {
    activePanel: "pairs" | "timeframe" | null;
    children: React.ReactNode;
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
      if (containerRef.current) {
        const updateDimensions = () => {
          const rect = containerRef.current!.getBoundingClientRect();
          setDimensions({ width: rect.width, height: rect.height });
        };

        updateDimensions();

        // Use ResizeObserver to watch for size changes
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
      }
    }, [activePanel]);

    // Calculate dynamic notch position based on content
    const getNotchPath = useCallback(() => {
      if (activePanel !== "timeframe") {
        return "M 2,0 L 98,0 Q 100,0 100,2 L 100,98 Q 100,100 98,100 L 2,100 Q 0,100 0,98 L 0,2 Q 0,0 2,0 Z";
      }

      // With the wider timeframe slider (minWidth 400px), we need to adjust the notch
      // to properly frame the expanded slider area
      const containerWidth = dimensions.width || 600;

      // Calculate more accurate positions for the wider slider
      // Left: px-1 padding (4px) + pairs button (40px) + gap (12px) + timeframe button (40px) + mr-6 (24px) + mx-2 margin (8px) ≈ 128px
      // Right: mx-2 margin (8px) + ml-6 (24px) + left arrow (40px) + gap (12px) + right arrow (40px) + view button (40px) + px-1 padding (4px) ≈ 168px
      const leftButtonsWidth = 128;
      const rightButtonsWidth = 168;

      const notchStart = Math.max(
        15,
        (leftButtonsWidth / containerWidth) * 100
      );
      const notchEnd = Math.min(
        85,
        100 - (rightButtonsWidth / containerWidth) * 100
      );

      return `M 2,25 L ${notchStart - 2},25 C ${notchStart},25 ${notchStart},22 ${notchStart + 2},20 L ${notchEnd - 2},20 C ${notchEnd},22 ${notchEnd},25 ${notchEnd + 2},25 L 98,25 Q 100,25 100,27 L 100,73 Q 100,75 98,75 L ${notchEnd + 2},75 C ${notchEnd},75 ${notchEnd},78 ${notchEnd - 2},80 L ${notchStart + 2},80 C ${notchStart},78 ${notchStart},75 ${notchStart - 2},75 L 2,75 Q 0,75 0,73 L 0,27 Q 0,25 2,25 Z`;
    }, [activePanel, dimensions.width]);

    return (
      <div className="relative">
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{
            borderRadius: activePanel === "timeframe" ? "0" : "8px",
          }}
        >
          {/* Dynamic SVG border overlay */}
          {dimensions.width > 0 && dimensions.height > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                top: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="pathGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1F2328" />
                  <stop offset="50%" stopColor="#0F1114" />
                  <stop offset="100%" stopColor="#070809" />
                </linearGradient>
              </defs>
              <motion.path
                initial={false}
                animate={{
                  d: getNotchPath(),
                }}
                fill="url(#pathGradient)"
                stroke="#32353C"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </svg>
          )}

          {children}
        </div>
      </div>
    );
  }
);

DynamicContainer.displayName = "DynamicContainer";

export const ZenModeControls = memo(
  ({
    viewMode,
    onViewModeChange,
    focusedIndex,
    pairs,
    onFocusChange,
  }: ZenModeControlsProps) => {
    const [activePanel, setActivePanel] = useState<
      "pairs" | "timeframe" | null
    >(null);

    const togglePanel = useCallback((panel: "pairs" | "timeframe") => {
      setActivePanel((current) => (current === panel ? null : panel));
    }, []);

    // Button configuration array for easier management
    const buttonsConfig = useMemo(
      () => [
        // Left buttons
        {
          id: "pairs",
          position: "left" as const,
          icon: LuPlus,
          onClick: () => togglePanel("pairs"),
          isActive: activePanel === "pairs",
          isVisible: true,
          extraClasses: "",
        },
        {
          id: "timeframe",
          position: "left" as const,
          icon: LuBarChart3,
          onClick: () => togglePanel("timeframe"),
          isActive: activePanel === "timeframe",
          isVisible: true,
          extraClasses: activePanel === "timeframe" ? "mr-6" : "",
        },
        // Right buttons
        {
          id: "prev",
          position: "right" as const,
          icon: null,
          content: "←",
          onClick: () =>
            onFocusChange((focusedIndex - 1 + pairs.length) % pairs.length),
          isActive: false,
          isVisible: viewMode === "scene",
          extraClasses: activePanel === "timeframe" ? "ml-6" : "",
        },
        {
          id: "next",
          position: "right" as const,
          icon: null,
          content: "→",
          onClick: () => onFocusChange((focusedIndex + 1) % pairs.length),
          isActive: false,
          isVisible: viewMode === "scene",
          extraClasses: "",
        },
        {
          id: "viewMode",
          position: "right" as const,
          icon: viewMode === "scene" ? LuLayoutDashboard : LuBarChart3,
          onClick: () =>
            onViewModeChange(viewMode === "scene" ? "focus" : "scene"),
          isActive: viewMode === "focus",
          isVisible: true,
          extraClasses: "",
          useOldStyle: true, // Temporary flag for the view mode button
        },
      ],
      [
        activePanel,
        viewMode,
        focusedIndex,
        pairs,
        onFocusChange,
        onViewModeChange,
        togglePanel,
      ]
    );

    // Render button function
    const renderButton = useCallback(
      (buttonConfig: (typeof buttonsConfig)[0]) => {
        const {
          id,
          icon: IconComponent,
          content,
          onClick,
          isActive,
          isVisible,
          extraClasses,
          useOldStyle,
        } = buttonConfig;

        if (!isVisible) return null;

        // Old style for view mode button (temporarily)
        if (useOldStyle) {
          return (
            <button
              key={id}
              onClick={onClick}
              className={cn(
                "group relative overflow-hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-[#24FF66] text-black"
                  : "bg-[#1C1E23] hover:bg-[#32353C] text-white",
                extraClasses
              )}
            >
              {IconComponent && (
                <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              )}
            </button>
          );
        }

        // New circular style for all other buttons
        return (
          <button
            key={id}
            onClick={onClick}
            className={cn(
              "group relative overflow-hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
              isActive ? "text-[#24FF66]" : "text-[#B0B0B0] hover:text-white",
              extraClasses
            )}
            style={{
              background: isActive
                ? "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)"
                : undefined,
              boxShadow: isActive
                ? "0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
                : undefined,
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#24FF66] z-10"
                style={{
                  width: "30px",
                  height: "4px",
                  transform: "translateY(-50%) rotate(-90deg)",
                  filter: "blur(10px)",
                  transformOrigin: "center",
                }}
              />
            )}

            {/* Hover background */}
            {!isActive && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                }}
              />
            )}

            {/* Icon or content */}
            {IconComponent ? (
              <IconComponent className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <span className="relative z-10 text-lg font-medium">
                {content}
              </span>
            )}
          </button>
        );
      },
      []
    );

    return (
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
        <div className="flex flex-col items-center gap-2">
          {/* Pairs panel - only show as popup above when active */}
          <AnimatePresence>
            {activePanel === "pairs" && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95, height: 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  height: "auto",
                  width: 280,
                }}
                exit={{ opacity: 0, y: 15, scale: 0.95, height: 0 }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                  height: { duration: 0.25 },
                  width: { duration: 0.2 },
                }}
                className="max-w-[85vw] p-3 rounded-lg border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_6px_24px_rgba(0,0,0,0.3)] overflow-hidden"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.02] via-transparent to-black/10" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-gradient-to-b from-[#24FF66] to-[#20E860] rounded-full"></div>
                    <h3 className="font-russo text-sm font-bold text-white uppercase tracking-wider">
                      Trading Pairs
                    </h3>
                  </div>
                  <CompactPairSelector />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main unified container */}
          <DynamicContainer activePanel={activePanel}>
            <div
              className={cn(
                "flex items-center relative z-10",
                activePanel === "timeframe"
                  ? "px-1 py-3 justify-between"
                  : "px-4 py-3 gap-3"
              )}
            >
              {/* Left buttons */}
              <div className="flex items-center gap-3">
                {buttonsConfig
                  .filter((btn) => btn.position === "left")
                  .map(renderButton)}
              </div>

              {/* Center area for timeframe slider when active */}
              {activePanel === "timeframe" && (
                <div className="flex-1 transform translate-y-6 min-w-0 mx-2">
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                      className="w-full"
                      style={{ minWidth: "400px" }}
                    >
                      <TimeFrameSlider showPanel={false} global />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* Right buttons */}
              <div className="flex items-center gap-3">
                {viewMode === "focus" && (
                  <span className="font-russo text-xs text-[#818181] uppercase tracking-wider">
                    Focus
                  </span>
                )}
                {buttonsConfig
                  .filter((btn) => btn.position === "right")
                  .map(renderButton)}
              </div>
            </div>
          </DynamicContainer>
        </div>
      </div>
    );
  }
);

ZenModeControls.displayName = "ZenModeControls";
