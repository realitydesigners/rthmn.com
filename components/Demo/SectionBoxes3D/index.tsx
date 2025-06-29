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
import { useAnimationConfig, type StructureData } from "./useAnimationConfig";

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
      [0.16, 0.18], // Start after sidebars finish and complete quickly
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

  // Animation configuration hook - now centralized
  const {
    isMobile,
    timing,
    getRevealStates,
    isClient,
    createMotionValues,
    useProgressiveReveal,
    calculateStructures,
    calculateFocusedIndex,
  } = useAnimationConfig();

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
    const duration = 1200; // 1.2 seconds for formation animation (faster)

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
  // Timing now available from the hook above

  // Create all motion values using centralized function
  const motionValues = createMotionValues(scrollYProgress, isFormationComplete);
  const {
    scale,
    leftSidebarX,
    rightSidebarX,
    sidebarOpacity,
    navbarY,
    introTextOpacity,
  } = motionValues;

  // Scroll-based animations only start after formation is complete
  const effectiveScrollProgress = isFormationComplete
    ? currentScrollProgress
    : 0;

  const { leftSidebarOpen, rightSidebarOpen } = useProgressiveReveal(
    currentScrollProgress,
    isFormationComplete,
    isClient,
    setViewMode
  );

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
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
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
    className = "",
    onCurrentSliceChange,
    focusedIndex: externalFocusedIndex,
    viewMode: externalViewMode,
    introMode = false,
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
    const { calculateStructures, calculateFocusedIndex } = useAnimationConfig();

    const structures = useMemo(
      () =>
        calculateStructures(
          cryptoStructures,
          focusedIndex,
          viewMode,
          scrollProgress
        ),
      [
        cryptoStructures,
        focusedIndex,
        viewMode,
        scrollProgress,
        calculateStructures,
      ]
    );

    // Calculate which structure to focus on using centralized function
    const actualFocusedIndex = calculateFocusedIndex(
      structures,
      scrollProgress
    );

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
