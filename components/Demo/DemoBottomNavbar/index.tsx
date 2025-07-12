"use client";

import { CHART_STYLES } from "@/components/Charts/ChartStyleOptions";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { useColorStore } from "@/stores/colorStore";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  LuBarChart3,
  LuBox,
  LuChevronLeft,
  LuChevronRight,
  LuEye,
} from "react-icons/lu";

export const DemoBottomNavbar = memo(
  ({
    cryptoStructures,
    focusedIndex,
    viewMode,
    setViewMode,
    navigation,
  }: {
    cryptoStructures: any[];
    focusedIndex: number;
    viewMode: "scene" | "box";
    setViewMode: (mode: "scene" | "box") => void;
    navigation: {
      next: () => void;
      previous: () => void;
    };
  }) => {
    const [activePanel, setActivePanel] = useState<
      "timeframe" | "chartstyle" | null
    >(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const boxColors = useColorStore((state) => state.boxColors);

    const togglePanel = useCallback((panel: "timeframe" | "chartstyle") => {
      setActivePanel((current) => (current === panel ? null : panel));
    }, []);

    // Function to get the current chart style icon
    const getCurrentChartStyleIcon = useCallback(() => {
      const currentViewMode = boxColors.styles?.viewMode;

      if (currentViewMode === "3d") {
        return LuBox;
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

    // Render button function matching ZenModeControls
    const renderButton = useCallback(
      (buttonConfig: {
        id: string;
        icon?: React.ComponentType<any>;
        onClick: () => void;
        isActive: boolean;
        isVisible: boolean;
      }) => {
        const {
          id,
          icon: IconComponent,
          onClick,
          isActive,
          isVisible,
        } = buttonConfig;

        if (!isVisible) return null;

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
            {IconComponent && (
              <IconComponent
                className={cn(
                  "w-6 h-6 relative z-10 transition-colors duration-200",
                  isActive ? "text-white" : ""
                )}
              />
            )}
          </button>
        );
      },
      []
    );

    return (
      <>
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
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
                  className="p-3 rounded-xl border backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 max-w-[90vw]"
                  style={{
                    background:
                      "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
                    border: "1px solid #16181C",
                    boxShadow:
                      "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
                  }}
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
              {renderButton({
                id: "timeframe",
                icon: LuBarChart3,
                onClick: () => togglePanel("timeframe"),
                isActive: activePanel === "timeframe",
                isVisible: true,
              })}

              {renderButton({
                id: "chartstyle",
                icon: getCurrentChartStyleIcon(),
                onClick: () => togglePanel("chartstyle"),
                isActive: activePanel === "chartstyle",
                isVisible: viewMode === "box",
              })}

              {viewMode === "scene" && (
                <>
                  {renderButton({
                    id: "prev",
                    icon: LuChevronLeft,
                    onClick: navigation.previous,
                    isActive: false,
                    isVisible: true,
                  })}

                  {/* Current structure display - between nav buttons */}
                  <div className="flex items-center gap-3 px-4 w-[160px] justify-center">
                    <span className="font-russo text-xs font-medium text-white uppercase tracking-wide">
                      {cryptoStructures[focusedIndex]?.pair}
                    </span>
                    <span className="font-russo text-xs text-[#818181] uppercase tracking-wide">
                      {cryptoStructures[focusedIndex]?.name}
                    </span>
                  </div>

                  {renderButton({
                    id: "next",
                    icon: LuChevronRight,
                    onClick: navigation.next,
                    isActive: false,
                    isVisible: true,
                  })}
                </>
              )}

              {viewMode === "box" && (
                <div className="flex items-center gap-3 px-4 w-[160px] justify-center">
                  {/* <span className="font-russo text-xs text-[#818181] uppercase tracking-wide">
                    Focus Mode
                  </span> */}
                  <span className="font-russo text-xs font-medium text-white uppercase tracking-wide">
                    {cryptoStructures[focusedIndex]?.pair}
                  </span>
                </div>
              )}

              {renderButton({
                id: "viewMode",
                icon: viewMode === "scene" ? LuEye : LuEye,
                onClick: () =>
                  setViewMode(viewMode === "scene" ? "box" : "scene"),
                isActive: viewMode === "box",
                isVisible: true,
              })}
            </div>

            <AnimatePresence>
              {/* {activePanel && (
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
              )} */}
            </AnimatePresence>
          </div>
        </div>
      </>
    );
  }
);

DemoBottomNavbar.displayName = "DemoBottomNavbar";

// Compact Chart Style Selector for demo
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
              "group relative flex h-20 flex-col items-center justify-center gap-2 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer",
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
