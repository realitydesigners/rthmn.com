"use client";

import {
  BASE_VALUES,
  createDemoStep,
  createMockBoxData,
  sequences,
} from "@/components/Constants/constants";
import { DemoSidebarLeft } from "@/components/Demo/DemoSidebarLeft";
import { DemoSidebarRight } from "@/components/Demo/DemoSidebarRight";
import { ResoBox3DCircular } from "@/components/Demo/ResoBox3DDemo";
import {
  TradingInfoPanel,
  mockTradingData,
} from "@/components/Demo/TradingPanel";
import { DemoNavbar } from "@/components/Navbars/DemoNavbar";
import type { BoxSlice } from "@/types/types";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LuBarChart3,
  LuLayoutDashboard,
  LuTrendingUp,
  LuBox,
  LuChevronLeft,
  LuChevronRight,
  LuEye,
} from "react-icons/lu";
import { NavButton } from "./Displays";
import { HeroText } from "./HeroText";
import { TradingAdvantage } from "./TradingAdvantage";
import { useAnimatedStructures } from "./useAnimatedStructures";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { CHART_STYLES } from "@/components/Charts/ChartStyleOptions";
import { useColorStore } from "@/stores/colorStore";
import { cn } from "@/utils/cn";

type CryptoStructure = {
  pair: string;
  name: string;
};

interface ScreenProps {
  scale: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  children: React.ReactNode;
  showScreen: boolean;
  focusedIndex: number;
}

// Screen component that wraps the entire demo with animated border and scaling
const Screen = memo(
  ({
    scale,
    scrollYProgress,
    children,
    showScreen,
    focusedIndex,
  }: ScreenProps) => {
    // Border animation - appears after all UI elements are loaded
    const borderOpacity = useTransform(
      scrollYProgress,
      [0.22, 0.25], // Start after sidebars finish and complete quickly
      [0, 1]
    );

    if (!showScreen) return null;

    return (
      <motion.div
        style={{
          scale,
        }}
        className="absolute inset-0 w-full h-full lg:flex hidden pointer-events-none z-[1000]"
      >
        {/* Animated border that appears when UI is loaded */}
        <motion.div
          style={{ opacity: borderOpacity }}
          className="absolute inset-0 border-2 border-[#1C1E23] rounded-lg pointer-events-none z-[110]"
        />

        {children}
      </motion.div>
    );
  }
);

Screen.displayName = "Screen";

// Custom Square icon component for demo chart styles
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

// Structure Indicator Component - matching ZenModeControls style
const StructureIndicator = memo(
  ({
    structures,
    activeIndex,
    onSelect,
  }: {
    structures: Array<{ pair: string; name: string }>;
    activeIndex: number;
    onSelect: (index: number) => void;
  }) => (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full border bg-[#0A0B0D]/90 border-[#1C1E23]/60 backdrop-blur-sm shadow-[0_6px_24px_rgba(0,0,0,0.2)]">
      {/* Current structure info */}
      <div className="flex items-center gap-2">
        <div className="w-auto h-8 rounded-lg px-2 bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 flex items-center justify-center">
          <span className="font-russo text-sm font-bold text-[#24FF66]">
            {structures[activeIndex]?.pair}
          </span>
        </div>
        <span className="font-russo text-sm font-medium text-white">
          {structures[activeIndex]?.name}
        </span>
      </div>
    </div>
  )
);

StructureIndicator.displayName = "StructureIndicator";

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
              "group relative flex h-20 flex-col items-center justify-center gap-2 rounded-xl border transition-all duration-300 overflow-hidden",
              isActive
                ? "border-[#545963]/40 bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                : "border-[#111215] bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/80 hover:border-[#1C1E23]",
              style.locked ? "pointer-events-none opacity-60" : "cursor-pointer"
            )}
            style={{
              boxShadow: isActive
                ? "0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0 0 20px rgba(255, 255, 255, 0.05)"
                : undefined,
            }}
          >
            {/* Enhanced icon container */}
            <div
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                style.locked
                  ? "bg-gradient-to-b from-[#0A0B0D]/50 to-[#070809]/50"
                  : isActive
                    ? "bg-gradient-to-b from-[#343A42] to-[#1F2328] shadow-[0_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-white/20"
                    : "bg-gradient-to-b from-[#0A0B0D] to-[#070809] group-hover:from-[#2C3137] group-hover:to-[#16191D] shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              )}
            >
              <Icon
                size={22}
                className={cn(
                  "relative transition-all duration-300",
                  isActive && !style.locked
                    ? "text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]"
                    : style.locked
                      ? "text-[#32353C] opacity-40"
                      : "text-[#545963] group-hover:text-white group-hover:scale-110"
                )}
              />
            </div>

            {/* Title */}
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
          </button>
        );
      })}
    </div>
  );
});

CompactChartStyleSelector.displayName = "CompactChartStyleSelector";

// DemoBottomNavbar component for the UI controls - matching ZenModeControls design
const DemoBottomNavbar = memo(
  ({
    cryptoStructures,
    focusedIndex,
    setFocusedIndex,
    viewMode,
    setViewMode,
    isTradingPanelOpen,
    setIsTradingPanelOpen,
    navigation,
  }: {
    cryptoStructures: CryptoStructure[];
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    viewMode: "scene" | "box";
    setViewMode: (mode: "scene" | "box") => void;
    isTradingPanelOpen: boolean;
    setIsTradingPanelOpen: (open: boolean) => void;
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
      } else {
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
              {/* Left buttons - timeframe and chart style */}
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
                isVisible: viewMode === "box", // Only show in box mode like ZenModeControls
              })}

              {/* Scene navigation when in scene mode */}
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

              {/* Focus mode label when in box mode */}
              {viewMode === "box" && (
                <div className="flex items-center gap-3 px-4 w-[160px] justify-center">
                  <span className="font-russo text-xs text-[#818181] uppercase tracking-wide">
                    Focus Mode
                  </span>
                  <span className="font-russo text-xs font-medium text-white uppercase tracking-wide">
                    {cryptoStructures[focusedIndex]?.pair}
                  </span>
                </div>
              )}

              {/* Mode toggle button */}
              {renderButton({
                id: "viewMode",
                icon: viewMode === "scene" ? LuEye : LuEye,
                onClick: () =>
                  setViewMode(viewMode === "scene" ? "box" : "scene"),
                isActive: viewMode === "box",
                isVisible: true,
              })}
            </div>

            {/* Floating title below buttons */}
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
      </>
    );
  }
);

DemoBottomNavbar.displayName = "DemoBottomNavbar";

export const SectionBoxes3D = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Mobile detection and touch handling
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // State to track the current structure slice from ResoBox3DCircular (first structure)
  const [currentStructureSlice, setCurrentStructureSlice] =
    useState<BoxSlice | null>(null);

  // UI state for the 3D controls
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"scene" | "box">("scene");
  const [isTradingPanelOpen, setIsTradingPanelOpen] = useState(false);

  // Get crypto structures for UI
  const { cryptoStructures } = useAnimatedStructures();

  // Create initial structure slice for the intro (will be updated by ResoBox3DCircular)
  const initialStructureSlice = useMemo(() => {
    const currentValues = createDemoStep(4, sequences, BASE_VALUES); // Use first structure's startOffset
    const mockBoxData = createMockBoxData(currentValues);
    return { timestamp: new Date().toISOString(), boxes: mockBoxData };
  }, []);

  // Use the current slice from ResoBox3DCircular if available, otherwise use initial
  const structureSlice = currentStructureSlice || initialStructureSlice;
  const [currentScrollProgress, setCurrentScrollProgress] = useState(() => {
    // Get initial scroll progress immediately to avoid intro animation on refresh
    if (typeof window !== "undefined") {
      return scrollYProgress.get();
    }
    return 0;
  });

  // State to track box formation animation (starts immediately on mount)
  const [formationProgress, setFormationProgress] = useState(0);
  const [isFormationComplete, setIsFormationComplete] = useState(false);

  // Start formation animation immediately on mount
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2000; // 2 seconds for formation animation

    const animateFormation = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setFormationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animateFormation);
      } else {
        setIsFormationComplete(true);
      }
    };

    animateFormation();
  }, []);

  useEffect(() => {
    // Set initial scroll progress immediately on mount
    setCurrentScrollProgress(scrollYProgress.get());

    const unsubscribe = scrollYProgress.onChange((value) => {
      setCurrentScrollProgress(value);
    });
    return unsubscribe;
  }, [scrollYProgress]);
  // Mobile-optimized scroll thresholds - slightly different for touch devices
  const scrollThresholds = isMobile
    ? { start: 0.12, end: 0.22 } // Slightly earlier on mobile for better touch response
    : { start: 0.15, end: 0.25 };

  // Progressive reveal thresholds - start after screen is fully loaded (stable values)
  const leftSidebarThreshold = 0.28;
  const rightSidebarThreshold = 0.36;
  const focusModeThreshold = 0.42; // Focus mode happens shortly after right sidebar
  const finalFadeThreshold = 0.9;

  // Only show intro text during formation, then allow scroll-based fade
  const introTextOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, scrollThresholds.start, scrollThresholds.end],
    isFormationComplete ? [1, 1, 1, 0] : [1, 1, 1, 1] // Keep visible until formation complete
  );

  // Scroll-based animations only start after formation is complete
  const effectiveScrollProgress = isFormationComplete
    ? currentScrollProgress
    : 0;

  const scale = useTransform(
    scrollYProgress,
    [scrollThresholds.start, scrollThresholds.end],
    [1.0, 0.8]
  );
  const leftSidebarX = useTransform(
    scrollYProgress,
    [scrollThresholds.start, scrollThresholds.end],
    [-64, 0]
  );
  const rightSidebarX = useTransform(
    scrollYProgress,
    [scrollThresholds.start, scrollThresholds.end],
    [64, 0]
  );
  const sidebarOpacity = useTransform(
    scrollYProgress,
    [
      scrollThresholds.start,
      scrollThresholds.end,
      finalFadeThreshold - 0.05,
      finalFadeThreshold,
    ],
    [0, 1, 1, 0]
  );
  const navbarY = useTransform(
    scrollYProgress,
    [scrollThresholds.start, scrollThresholds.end],
    [-56, 0]
  );

  // Progressive reveal state management
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [autoFocusMode, setAutoFocusMode] = useState(false);

  // Handle progressive reveal after screen is loaded
  useEffect(() => {
    if (!isFormationComplete) return;

    const progress = currentScrollProgress;

    // Left sidebar opens at 0.30
    if (progress >= leftSidebarThreshold && !leftSidebarOpen) {
      setLeftSidebarOpen(true);
    } else if (progress < leftSidebarThreshold && leftSidebarOpen) {
      setLeftSidebarOpen(false);
    }

    // Right sidebar opens at 0.40
    if (progress >= rightSidebarThreshold && !rightSidebarOpen) {
      setRightSidebarOpen(true);
    } else if (progress < rightSidebarThreshold && rightSidebarOpen) {
      setRightSidebarOpen(false);
    }

    // Focus mode activates at 0.50
    if (progress >= focusModeThreshold && !autoFocusMode) {
      setAutoFocusMode(true);
      setViewMode("box"); // Switch to focus mode
    } else if (progress < focusModeThreshold && autoFocusMode) {
      setAutoFocusMode(false);
      setViewMode("scene"); // Switch back to scene mode
    }
  }, [
    currentScrollProgress,
    isFormationComplete,
    leftSidebarOpen,
    rightSidebarOpen,
    autoFocusMode,
    leftSidebarThreshold,
    rightSidebarThreshold,
    focusModeThreshold,
  ]);

  // Navigation functions for the UI controls
  const navigation = {
    next: () => setFocusedIndex((prev) => (prev + 1) % cryptoStructures.length),
    previous: () =>
      setFocusedIndex(
        (prev) => (prev - 1 + cryptoStructures.length) % cryptoStructures.length
      ),
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        // Mobile scroll optimizations
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y", // Allow vertical scrolling but prevent horizontal
        overscrollBehavior: "contain", // Prevent scroll chaining
      }}
    >
      <div className="h-[350vh] relative">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center relative">
          {structureSlice && structureSlice.boxes.length > 0 && (
            <ResoBox3DCircular
              slice={structureSlice}
              className="h-full w-full absolute inset-0 z-0"
              onCurrentSliceChange={setCurrentStructureSlice}
              focusedIndex={focusedIndex}
              viewMode={viewMode}
              introMode={!isFormationComplete}
              formationProgress={formationProgress}
              scrollProgress={effectiveScrollProgress}
              cameraDistance={scale}
            />
          )}
          <Screen
            scale={scale}
            scrollYProgress={scrollYProgress}
            showScreen={true}
            focusedIndex={focusedIndex}
          >
            <DemoNavbar y={navbarY} opacity={sidebarOpacity} />
            <DemoSidebarLeft
              x={leftSidebarX}
              opacity={sidebarOpacity}
              scrollYProgress={scrollYProgress}
              shouldOpen={leftSidebarOpen}
            />
            <DemoSidebarRight
              x={rightSidebarX}
              opacity={sidebarOpacity}
              scrollYProgress={scrollYProgress}
              shouldOpen={rightSidebarOpen}
            />

            {/* UI Controls - animate in and fade out at the end */}
            {isFormationComplete && (
              <>
                <motion.div style={{ opacity: sidebarOpacity }}>
                  <DemoBottomNavbar
                    cryptoStructures={cryptoStructures}
                    focusedIndex={focusedIndex}
                    setFocusedIndex={setFocusedIndex}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isTradingPanelOpen={isTradingPanelOpen}
                    setIsTradingPanelOpen={setIsTradingPanelOpen}
                    navigation={navigation}
                  />
                </motion.div>
              </>
            )}
          </Screen>
          <HeroText opacity={introTextOpacity} />
        </div>
      </div>
      <TradingAdvantage />
    </div>
  );
});

SectionBoxes3D.displayName = "SectionBoxes3D";
