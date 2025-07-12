"use client";

import { CHART_STYLES } from "@/components/Charts/ChartStyleOptions";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { useUser } from "@/providers/UserProvider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import { useColorStore } from "@/stores/colorStore";
import { useGridStore } from "@/stores/gridStore";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  memo,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  LuBarChart3,
  LuBox,
  LuChevronLeft,
  LuChevronRight,
  LuEye,
  LuLayoutDashboard,
  LuLineChart,
  LuLock,
  LuPlus,
  LuX,
} from "react-icons/lu";

import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/instruments";

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

// Compact layout icon - filled dots in tight grid
const CompactIcon = ({
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
    fill="currentColor"
    stroke="none"
    className={className}
    role="img"
    aria-label="Compact layout"
  >
    <title>Compact layout</title>
    {/* 3x3 grid with filled circles for better visual weight */}
    <circle cx="6" cy="6" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="12" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

// Balanced layout icon - 2x2 spaced dots
const BalancedIcon = ({
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
    fill="currentColor"
    stroke="none"
    className={className}
    role="img"
    aria-label="Balanced layout"
  >
    <title>Balanced layout</title>
    {/* 2x2 grid with filled circles and generous spacing */}
    <circle cx="8" cy="8" r="3" />
    <circle cx="16" cy="8" r="3" />
    <circle cx="8" cy="16" r="3" />
    <circle cx="16" cy="16" r="3" />
  </svg>
);

interface ZenModeControlsProps {
  viewMode: "scene" | "focus";
  onViewModeChange: (mode: "scene" | "focus") => void;
  focusedIndex: number;
  pairs: string[];
  onFocusChange: (index: number) => void;
  isZenMode: boolean;
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

const CompactChartStyleSelector = memo(() => {
  const boxColors = useColorStore((state) => state.boxColors);
  const updateStyles = useColorStore((state) => state.updateStyles);

  const handleStyleChange = (id: string) => {
    updateStyles({ viewMode: id === "3d" ? "3d" : "default" });
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {Object.values(CHART_STYLES).map((style) => {
        const Icon = style.icon;
        const isActive =
          boxColors.styles?.viewMode === (style.id === "3d" ? "3d" : "default");

        return (
          <button
            key={style.id}
            type="button"
            onClick={
              style.locked ? undefined : () => handleStyleChange(style.id)
            }
            className={cn(
              "group relative flex h-20 flex-col items-center justify-center gap-2 rounded-xl border transition-all duration-300 overflow-hidden",
              isActive
                ? "border-[#32353C] bg-gradient-to-b from-[#1A1D22] to-[#0D0F12] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                : "border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] hover:border-[#32353C]",
              style.locked ? "pointer-events-none opacity-60" : "cursor-pointer"
            )}
            style={{
              boxShadow: isActive
                ? "0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0 0 20px rgba(255, 255, 255, 0.05)"
                : undefined,
            }}
          >
            {/* Active state background effects */}
            {isActive && !style.locked && (
              <>
                {/* Animated gradient background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
                </div>

                {/* Subtle animated glow */}
                <div className="absolute inset-0 animate-pulse">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
                </div>
              </>
            )}

            {/* Hover effects for inactive buttons */}
            {!isActive && !style.locked && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2C3137]/50 via-[#16191D]/30 to-[#0A0B0D]/50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.03),transparent_70%)]" />
              </div>
            )}

            {/* Diagonal stripes pattern for locked state */}
            {style.locked && (
              <>
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                                      135deg,
                                      #000,
                                      #000 1px,
                                      transparent 1.5px,
                                      transparent 8px
                                  )`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/10" />
              </>
            )}

            {/* Enhanced lock icon */}
            {style.locked && (
              <div className="pointer-events-none absolute -top-1 -right-1 z-10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#343A42] to-[#1F2328] border border-[#32353C]/60 shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
                  <LuLock className="h-3 w-3 text-white/90" />
                </div>
              </div>
            )}

            {/* Enhanced icon container */}
            <div
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                style.locked
                  ? "bg-gradient-to-b from-[#0A0B0D]/50 to-[#070809]/50"
                  : isActive
                    ? "bg-gradient-to-b from-[#1A1D22] to-[#0D0F12] shadow-[0_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-white/20"
                    : "bg-gradient-to-b from-[#0A0B0D] to-[#070809] group-hover:from-[#16181C] group-hover:to-[#1C1E23] shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              )}
            >
              {/* Active state inner glow */}
              {isActive && !style.locked && (
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_70%)]" />
              )}

              {/* Icon with enhanced effects */}
              <Icon
                size={22}
                className={cn(
                  "relative transition-all duration-300",
                  isActive && !style.locked
                    ? "text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]"
                    : style.locked
                      ? "text-[#32353C] opacity-40"
                      : "text-[#545963] group-hover:text-white group-hover:scale-110 group-hover:drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]"
                )}
              />
            </div>

            {/* Enhanced title */}
            <span
              className={cn(
                "font-russo text-[11px] font-medium tracking-wide transition-all duration-300",
                style.locked
                  ? "text-[#32353C]/40"
                  : isActive
                    ? "text-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]"
                    : "text-[#545963] group-hover:text-white"
              )}
            >
              {style.title}
            </span>

            {/* Subtle border animation for active state */}
            {isActive && !style.locked && (
              <div className="absolute inset-0 rounded-xl border border-white/20 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
});

CompactChartStyleSelector.displayName = "CompactChartStyleSelector";

// Layout selector component
const CompactLayoutSelector = memo(() => {
  const { currentLayout, setLayout } = useGridStore();

  const layouts = [
    { id: "compact" as const, label: "Compact", icon: CompactIcon },
    { id: "balanced" as const, label: "Balanced", icon: BalancedIcon },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {layouts.map((layout) => {
        const Icon = layout.icon;
        const isActive = currentLayout === layout.id;

        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => setLayout(layout.id)}
            className={cn(
              "group relative flex h-20 flex-col items-center justify-center gap-2 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer",
              isActive
                ? "border-[#32353C] bg-gradient-to-b from-[#1A1D22] to-[#0D0F12] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                : "border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] hover:border-[#32353C]"
            )}
            style={{
              boxShadow: isActive
                ? "0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0 0 20px rgba(255, 255, 255, 0.05)"
                : undefined,
            }}
          >
            {/* Compact balanced indicator - shows when active */}
            {isActive && (
              <div
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
                style={{
                  width: "20px",
                  height: "3px",
                  transform: "translateY(-50%) rotate(-90deg)",
                  filter: "blur(6px)",
                  transformOrigin: "center",
                }}
              />
            )}

            {/* Active state background effects */}
            {isActive && (
              <>
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
                </div>
                <div className="absolute inset-0 animate-pulse">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
                </div>
              </>
            )}

            {/* Hover effects for inactive buttons */}
            {!isActive && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2C3137]/50 via-[#16191D]/30 to-[#0A0B0D]/50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.03),transparent_70%)]" />
              </div>
            )}

            {/* Enhanced icon container */}
            <div
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                isActive
                  ? "bg-gradient-to-b from-[#343A42] to-[#1F2328] shadow-[0_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-white/20"
                  : "bg-gradient-to-b from-[#16191D] to-[#0A0B0D] group-hover:from-[#1C1E23] group-hover:to-[#0F1114]"
              )}
            >
              <Icon
                size={20}
                className={cn(
                  "transition-all duration-300",
                  isActive
                    ? "text-white"
                    : "text-[#545963] group-hover:text-white"
                )}
              />
            </div>

            {/* Enhanced title */}
            <span
              className={cn(
                "font-russo text-[11px] font-medium tracking-wide transition-all duration-300",
                isActive
                  ? "text-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]"
                  : "text-[#545963] group-hover:text-white"
              )}
            >
              {layout.label}
            </span>

            {/* Subtle border animation for active state */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl border border-white/20 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
});

CompactLayoutSelector.displayName = "CompactLayoutSelector";

export const ZenModeControls = memo(
  ({
    viewMode,
    onViewModeChange,
    focusedIndex,
    pairs,
    onFocusChange,
    isZenMode,
  }: ZenModeControlsProps) => {
    const [activePanel, setActivePanel] = useState<
      "pairs" | "timeframe" | "chartstyle" | "layout" | null
    >(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { priceData } = useWebSocket();
    const boxColors = useColorStore((state) => state.boxColors);
    const { currentLayout, setLayout } = useGridStore();

    const togglePanel = useCallback(
      (panel: "pairs" | "timeframe" | "chartstyle" | "layout") => {
        setActivePanel((current) => (current === panel ? null : panel));
      },
      []
    );

    // Function to get the current layout icon
    const getCurrentLayoutIcon = useCallback(() => {
      return currentLayout === "compact" ? CompactIcon : BalancedIcon;
    }, [currentLayout]);

    // Function to get the current chart style icon
    const getCurrentChartStyleIcon = useCallback(() => {
      const currentViewMode = boxColors.styles?.viewMode;

      if (currentViewMode === "3d") {
        return LuBox;
      } else {
        // Default view mode uses "box" style
        return SquareIcon;
      }
    }, [boxColors.styles?.viewMode]);

    // Handle clicking outside to close panel
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setActivePanel(null);
        }
      };

      if (activePanel) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [activePanel]);

    // Button configuration array for easier management
    const buttonsConfig = useMemo(
      () => [
        {
          id: "timeframe",
          position: "left" as const,
          icon: LuBarChart3,
          onClick: () => togglePanel("timeframe"),
          isActive: activePanel === "timeframe",
          isVisible: true,
        },
        {
          id: "chartstyle",
          position: "left" as const,
          icon: getCurrentChartStyleIcon(),
          onClick: () => togglePanel("chartstyle"),
          isActive: activePanel === "chartstyle",
          isVisible: !isZenMode, // Hide chart style button in zen mode since it only uses 3D
        },
        {
          id: "layout",
          position: "left" as const,
          icon: getCurrentLayoutIcon(),
          onClick: () => togglePanel("layout"),
          isActive: activePanel === "layout",
          isVisible: !isZenMode, // Only show layout controls when NOT in zen mode
        },
        // Right buttons
        {
          id: "prev",
          position: "right" as const,
          icon: LuChevronLeft,
          content: null,
          onClick: () =>
            onFocusChange((focusedIndex - 1 + pairs.length) % pairs.length),
          isActive: false,
          isVisible: isZenMode && viewMode === "scene",
        },
        {
          id: "next",
          position: "right" as const,
          icon: LuChevronRight,
          content: null,
          onClick: () => onFocusChange((focusedIndex + 1) % pairs.length),
          isActive: false,
          isVisible: isZenMode && viewMode === "scene",
        },
        {
          id: "viewMode",
          position: "right" as const,
          icon: viewMode === "scene" ? LuEye : LuEye,
          onClick: () =>
            onViewModeChange(viewMode === "scene" ? "focus" : "scene"),
          isActive: viewMode === "focus",
          isVisible: isZenMode, // Only show view mode toggle in zen mode
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
        isZenMode,
        getCurrentChartStyleIcon,
        getCurrentLayoutIcon,
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
        } = buttonConfig;

        if (!isVisible) return null;

        // Get button title for display

        return (
          <button
            key={id}
            onClick={onClick}
            className={cn(
              "group relative overflow-hidden w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-out",
              !isActive && "text-[#B0B0B0] hover:text-white",
              isActive && ""
            )}
            style={{
              background: isActive
                ? "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)"
                : "linear-gradient(180deg, #0A0B0D 0%, #070809 100%)",
              boxShadow: isActive
                ? "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)"
                : "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Enhanced hover/active background with inset shadow */}
            <div
              className={cn(
                "absolute inset-0 transition-all duration-300 rounded-full",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              style={{
                background: "linear-gradient(180deg, #16181C 0%, #1C1E23 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
              }}
            />
            {IconComponent ? (
              <IconComponent
                className={cn(
                  "w-6 h-6 relative z-10 transition-colors duration-200",
                  isActive ? "text-white" : ""
                )}
              />
            ) : (
              <span
                className={cn(
                  "text-xl font-medium relative z-10 transition-colors duration-200",
                  isActive ? "text-white" : ""
                )}
              >
                {content}
              </span>
            )}
          </button>
        );
      },
      [viewMode]
    );

    return (
      <>
        {/* Background gradient overlay - shows when any panel is active (except timeframe which is inline) */}
        <AnimatePresence>
          {activePanel && activePanel !== "timeframe" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 pointer-events-none z-20"
              style={{
                height: "400px",
                background:
                  "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 20%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.3) 70%, transparent 100%)",
              }}
            />
          )}
        </AnimatePresence>

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
          <div
            ref={containerRef}
            className="relative flex flex-col items-center gap-1"
          >
            {/* Content panel - shows above buttons for non-timeframe panels */}
            <AnimatePresence>
              {activePanel && activePanel !== "timeframe" && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    width: "auto",
                  }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                    width: { duration: 0.3, ease: "easeInOut" },
                  }}
                  className="p-3 rounded-xl border backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 max-w-[90vw]"
                  style={{
                    background:
                      "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
                    border: "1px solid #16181C",
                    boxShadow:
                      "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
                  }}
                >
                  {activePanel === "chartstyle" && (
                    <div className="w-full min-w-[250px]">
                      <CompactChartStyleSelector />
                    </div>
                  )}
                  {activePanel === "layout" && (
                    <div className="w-full min-w-[200px]">
                      <CompactLayoutSelector />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button container - simplified with fixed positioning */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full border backdrop-blur-md shadow-lg shadow-black/40"
              style={{
                background:
                  "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
                border: "1px solid #16181C",
                boxShadow:
                  "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
              }}
            >
              {/* Timeframe button */}
              {buttonsConfig
                .filter(
                  (btn) => btn.position === "left" && btn.id === "timeframe"
                )
                .map(renderButton)}

              {/* Inline timeframe slider - appears when timeframe is active */}
              <AnimatePresence>
                {activePanel === "timeframe" && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                      width: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.3, ease: "easeOut" },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="w-60 px-2">
                      <TimeFrameSlider
                        showPanel={false}
                        global
                        hideLabels={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Other left buttons (chart style, layout) */}
              {buttonsConfig
                .filter(
                  (btn) => btn.position === "left" && btn.id !== "timeframe"
                )
                .map(renderButton)}

              {/* Right buttons - only render container if there are visible right buttons or focus label */}
              {(buttonsConfig.some(
                (btn) => btn.position === "right" && btn.isVisible
              ) ||
                (isZenMode && viewMode === "focus")) && (
                <>
                  {/* Prev button */}
                  {buttonsConfig
                    .filter(
                      (btn) => btn.position === "right" && btn.id === "prev"
                    )
                    .map(renderButton)}

                  {/* Current pair price display in zen mode - between nav buttons */}
                  {isZenMode && pairs.length > 0 && viewMode === "scene" && (
                    <div className="flex items-center gap-3 px-4 w-[160px] justify-center">
                      <span className="font-russo text-xs font-medium text-white uppercase tracking-wide">
                        {pairs[focusedIndex]}
                      </span>
                      <span className="font-kodemono text-sm text-white tabular-nums">
                        {priceData[pairs[focusedIndex]]?.price
                          ? formatPrice(
                              priceData[pairs[focusedIndex]].price,
                              pairs[focusedIndex]
                            )
                          : "—"}
                      </span>
                    </div>
                  )}

                  {/* Next button */}
                  {buttonsConfig
                    .filter(
                      (btn) => btn.position === "right" && btn.id === "next"
                    )
                    .map(renderButton)}

                  {/* Other right buttons (like viewMode) */}
                  {buttonsConfig
                    .filter(
                      (btn) =>
                        btn.position === "right" &&
                        btn.id !== "prev" &&
                        btn.id !== "next"
                    )
                    .map(renderButton)}
                </>
              )}
            </div>

            <AnimatePresence>
              {activePanel && activePanel !== "timeframe" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 pointer-events-none"
                >
                  {/* <span className="font-russo text-[9px] font-normal uppercase tracking-wide text-gray-400">
                    {activePanel === "chartstyle" && "STYLE"}
                    {activePanel === "layout" && "LAYOUT"}
                  </span> */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </>
    );
  }
);

ZenModeControls.displayName = "ZenModeControls";
