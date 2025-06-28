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
  LuPlus,
  LuX,
  LuLineChart,
  LuLock,
  LuChevronLeft,
  LuChevronRight,
  LuEye,
} from "react-icons/lu";
import { useUser } from "@/providers/UserProvider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { CHART_STYLES } from "@/components/Charts/ChartStyleOptions";
import { useColorStore } from "@/stores/colorStore";

import { formatPrice } from "@/utils/instruments";
import { cn } from "@/utils/cn";

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
              "group relative flex h-16 flex-col items-center justify-center gap-1 rounded-lg border transition-all duration-300",
              isActive
                ? "border-[#24FF66]/40 bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]"
                : "border-[#111215] bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/80 hover:border-[#1C1E23]",
              style.locked ? "pointer-events-none opacity-60" : "cursor-pointer"
            )}
          >
            {/* Icon */}
            <Icon
              size={16}
              className={cn(
                "transition-all duration-300",
                isActive
                  ? "text-[#24FF66]"
                  : "text-[#545963] group-hover:text-white",
                style.locked ? "opacity-40" : "group-hover:scale-105"
              )}
            />

            {/* Title */}
            <span
              className={cn(
                "font-russo text-[10px] font-medium tracking-wide transition-all duration-300",
                style.locked
                  ? "text-[#32353C]/40"
                  : isActive
                    ? "text-[#24FF66]"
                    : "text-[#545963] group-hover:text-white"
              )}
            >
              {style.title}
            </span>

            {/* Lock indicator */}
            {style.locked && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#1C1E23] border border-[#32353C] flex items-center justify-center">
                <LuLock size={8} className="text-[#818181]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
});

CompactChartStyleSelector.displayName = "CompactChartStyleSelector";

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
      "pairs" | "timeframe" | "chartstyle" | null
    >(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { priceData } = useWebSocket();

    const togglePanel = useCallback(
      (panel: "pairs" | "timeframe" | "chartstyle") => {
        setActivePanel((current) => (current === panel ? null : panel));
      },
      []
    );

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
          icon: LuLineChart,
          onClick: () => togglePanel("chartstyle"),
          isActive: activePanel === "chartstyle",
          isVisible: !isZenMode, // Hide chart style button in zen mode since it only uses 3D
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
              "group relative overflow-hidden w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200",
              !isActive && "text-[#B0B0B0] hover:text-white"
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
            {/* Hover background for non-active buttons */}
            {!isActive && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                }}
              />
            )}
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
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
        <div
          ref={containerRef}
          className="relative flex flex-col items-center gap-1"
        >
          {/* Content panel - shows above buttons */}
          <AnimatePresence>
            {activePanel && (
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
                className="p-3 rounded-xl border border-[#1C1E23]/40 bg-gradient-to-b from-[#0A0B0D]/98 via-[#070809]/95 to-[#050506]/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 max-w-[90vw]"
              >
                {activePanel === "timeframe" && (
                  <div className="w-full min-w-[320px]">
                    <TimeFrameSlider showPanel={false} global />
                  </div>
                )}
                {activePanel === "chartstyle" && (
                  <div className="w-full min-w-[250px]">
                    <CompactChartStyleSelector />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button container - clean and simple */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-full border bg-[#0A0B0D]/90 border-[#1C1E23]/60 backdrop-blur-sm shadow-[0_6px_24px_rgba(0,0,0,0.2)]">
            {/* Left buttons */}
            {buttonsConfig
              .filter((btn) => btn.position === "left")
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

          {/* Floating title below buttons - positioned absolutely */}
          <AnimatePresence>
            {activePanel && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 pointer-events-none"
              >
                <span className="font-russo text-[9px] font-normal uppercase tracking-wide text-gray-400">
                  {activePanel === "timeframe" && "TIMEFRAME"}
                  {activePanel === "chartstyle" && "STYLE"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
);

ZenModeControls.displayName = "ZenModeControls";
