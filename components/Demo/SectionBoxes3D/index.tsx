"use client";

import { CHART_STYLES } from "@/components/Charts/ChartStyleOptions";
import {
  BASE_VALUES,
  createDemoStep,
  createMockBoxData,
  sequences,
} from "@/components/Constants/constants";
import { DemoSidebarLeft } from "@/components/Demo/DemoSidebarLeft";
import { DemoSidebarRight } from "@/components/Demo/DemoSidebarRight";
import { DemoNavbar } from "@/components/Navbars/DemoNavbar";
import { useColorStore } from "@/stores/colorStore";
import type { BoxSlice } from "@/types/types";
import { cn } from "@/utils/cn";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { DemoBottomNavbar } from "../DemoBottomNavbar";
import { BoxStructure } from "./BoxStructure";
import { CameraController } from "./CameraController";
import { HeroText } from "./HeroText";
import { TradingAdvantage } from "./TradingAdvantage";
import { calculateCircularPosition } from "./mathUtils";
import { useAnimatedStructures } from "./useAnimatedStructures";
import { useCanvasSetup } from "./useCanvasSetup";

interface ScreenProps {
  scale: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  children: React.ReactNode;
  showScreen: boolean;
  focusedIndex: number;
}

// Screen component that wraps the entire demo with animated border and scaling
const Screen = memo(
  ({ scale, scrollYProgress, children, showScreen }: ScreenProps) => {
    // Border animation - appears after all UI elements are loaded
    const borderOpacity = useTransform(
      scrollYProgress,
      [0.18, 0.2], // Start after sidebars finish and complete quickly
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

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"scene" | "box">("scene");
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
  // Structure movement thresholds - structure moves from right to center first (matching ResoBox3DDemo)
  const structureMoveThreshold = isMobile ? 0.18 : 0.1;
  const structureMoveRange = 0.03;
  const uiAppearThreshold = structureMoveThreshold + structureMoveRange; // UI appears after structure is centered

  // Screen scaling and positioning thresholds
  const scrollThresholds = {
    start: uiAppearThreshold,
    end: uiAppearThreshold + 0.05,
  };

  // Progressive reveal thresholds - start after screen is fully loaded
  const leftSidebarThreshold = scrollThresholds.end + 0.03;
  const rightSidebarThreshold = leftSidebarThreshold + 0.08;
  const focusModeThreshold = rightSidebarThreshold + 0.06;
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
                    viewMode={viewMode}
                    setViewMode={setViewMode}
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

export const ResoBox3DCircular = memo(
  ({
    slice,
    className = "",
    onCurrentSliceChange,
    focusedIndex: externalFocusedIndex,
    viewMode: externalViewMode,
    introMode = false,
    formationProgress = 1,
    scrollProgress = 0,
    cameraDistance,
  }: {
    slice: BoxSlice;
    className?: string;
    onCurrentSliceChange?: (slice: BoxSlice) => void;
    focusedIndex?: number;
    viewMode?: "scene" | "box";
    introMode?: boolean;
    formationProgress?: number;
    scrollProgress?: number;
    cameraDistance?: MotionValue<number>;
  }) => {
    const { isClient, canvasDimensions } = useCanvasSetup();
    const { cryptoStructures, structureSlices } = useAnimatedStructures();
    const [internalFocusedIndex, setInternalFocusedIndex] = useState(0);
    const focusedIndex = externalFocusedIndex ?? internalFocusedIndex;
    const [internalViewMode, setInternalViewMode] = useState<"scene" | "box">(
      "scene"
    );
    const viewMode = externalViewMode ?? internalViewMode;

    if (!slice?.boxes?.length) return null;

    // Mobile-responsive scroll thresholds
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 1024 || "ontouchstart" in window);

    // Structure movement thresholds - structure moves from right to center first
    const structureMoveThreshold = isMobile ? 0.18 : 0.1; // When structure starts moving to center (earlier)
    const structureMoveRange = 0.03; // Quick movement to center
    const uiAppearThreshold = structureMoveThreshold + structureMoveRange; // UI appears after structure is centered
    const circularAppearThreshold = uiAppearThreshold + 0.05; // Circular structures appear after UI

    // Calculate structure position transition (right to center)
    const structureMoveProgress = Math.min(
      1,
      Math.max(
        0,
        (scrollProgress - structureMoveThreshold) / structureMoveRange
      )
    );

    // Determine what to show based on intro mode and scroll progress
    const showOnlyFirstStructure = scrollProgress < circularAppearThreshold;
    const showCircularArrangement = scrollProgress >= circularAppearThreshold;

    // Calculate transition progress for other structures appearing
    const circularAppearanceProgress = showCircularArrangement
      ? Math.min(1, (scrollProgress - circularAppearThreshold) / 0.05)
      : 0;

    // Calculate structure positions and properties
    const structures = useMemo(
      () =>
        cryptoStructures.map((crypto, index) => {
          const circularPosition = calculateCircularPosition(
            index,
            focusedIndex,
            cryptoStructures.length
          );
          const isFocused = index === focusedIndex;

          // For the first structure, smoothly transition from right to center to circular position
          let basePosition = circularPosition;
          if (index === 0) {
            // Define positions: right -> center -> circular
            const rightPosition: [number, number, number] = [12, 0, 30]; // Start less to the right
            const centerPosition: [number, number, number] = [0, 0, 40]; // Move to center

            if (showOnlyFirstStructure) {
              // Interpolate from right to center based on scroll
              basePosition = [
                rightPosition[0] +
                  (centerPosition[0] - rightPosition[0]) *
                    structureMoveProgress,
                rightPosition[1] +
                  (centerPosition[1] - rightPosition[1]) *
                    structureMoveProgress,
                rightPosition[2] +
                  (centerPosition[2] - rightPosition[2]) *
                    structureMoveProgress,
              ];
            } else {
              // After UI appears, move from center to circular position
              basePosition = [
                centerPosition[0] +
                  (circularPosition[0] - centerPosition[0]) *
                    circularAppearanceProgress,
                centerPosition[1] +
                  (circularPosition[1] - centerPosition[1]) *
                    circularAppearanceProgress,
                centerPosition[2] +
                  (circularPosition[2] - centerPosition[2]) *
                    circularAppearanceProgress,
              ];
            }
          }

          // In box mode, center and bring forward the focused structure (matching ZenMode)
          const position: [number, number, number] =
            viewMode === "box" && isFocused
              ? [0, 0, 25] // Match ZenMode focus positioning exactly
              : basePosition;

          return {
            ...crypto,
            position,
            scale:
              viewMode === "box" && isFocused
                ? 1.5 // Match ZenMode focus scale
                : index === 0 && showOnlyFirstStructure
                  ? 1.4 // Larger initial scale for first structure
                  : isFocused
                    ? 1.2 // Normal focused size in scene mode
                    : 0.8, // Normal unfocused size
            opacity:
              index === 0
                ? isFocused
                  ? 1
                  : 0.7 // First structure always visible after formation
                : circularAppearanceProgress * (isFocused ? 1 : 0.7), // Others fade in on scroll
            rotation:
              viewMode === "box" && isFocused
                ? ([0, -Math.PI / 4, 0] as [number, number, number]) // Match ZenMode focus rotation
                : index === 0 && showOnlyFirstStructure
                  ? ([0, -Math.PI / 4, 0] as [number, number, number]) // More rotation when on the right
                  : undefined,
          };
        }),
      [
        cryptoStructures,
        focusedIndex,
        viewMode,
        showOnlyFirstStructure,
        showCircularArrangement,
        structureMoveProgress,
        circularAppearanceProgress,
      ]
    );

    // Calculate which structure to focus on
    const actualFocusedIndex = showOnlyFirstStructure
      ? 0
      : structures.reduce((closest, struct, index) => {
          const currentDistance =
            struct.position[0] ** 2 + struct.position[2] ** 2;
          const closestDistance =
            structures[closest].position[0] ** 2 +
            structures[closest].position[2] ** 2;
          return currentDistance < closestDistance && struct.position[2] > 0
            ? index
            : closest;
        }, 0);

    const currentSlice = structureSlices[actualFocusedIndex];

    useEffect(
      () => onCurrentSliceChange?.(currentSlice),
      [currentSlice, onCurrentSliceChange]
    );

    return (
      <div className={`relative h-full w-full ${className}`}>
        <Canvas
          camera={{ position: [0, 0, 70], fov: 50 }}
          resize={{ scroll: true, debounce: { scroll: 0, resize: 0 } }}
          className="absolute inset-0 z-0 left-0 top-0 w-[100vw] h-[100vh]"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        >
          <ambientLight intensity={2} />
          <directionalLight position={[0, 60, 180]} intensity={1} />

          <CameraController
            viewMode={viewMode}
            scrollProgress={scrollProgress}
            introMode={introMode}
            isClient={isClient}
            cameraDistance={cameraDistance}
          />

          <OrbitControls
            enabled={viewMode === "box"}
            enableRotate={viewMode === "box"}
            maxDistance={100}
            minDistance={20}
            autoRotate={false}
            target={
              viewMode === "box"
                ? [0, 0, 30] // Match ZenMode focus target
                : structures[actualFocusedIndex]?.position || [0, 0, 0]
            }
            enablePan={false}
            enableZoom={false}
            zoomSpeed={0.5}
          />

          {/* Always show all structures with seamless transitions */}
          {structures.map((structure, index) => {
            // In box mode, only show the focused structure
            if (viewMode === "box" && index !== actualFocusedIndex) {
              return null;
            }

            const currentSlice = structureSlices[index];

            if (structure.opacity <= 0.01) {
              return null;
            }

            return (
              <BoxStructure
                key={structure.pair}
                slice={currentSlice}
                pair={structure.pair}
                structure={{
                  position: structure.position,
                  scale: structure.scale,
                  opacity: structure.opacity,
                  rotation: structure.rotation,
                }}
                scatteredPositions={undefined} // No more scattered animation
                formationProgress={1} // Always fully formed
                isFocused={index === actualFocusedIndex}
              />
            );
          })}
        </Canvas>
      </div>
    );
  }
);

ResoBox3DCircular.displayName = "ResoBox3DCircular";
