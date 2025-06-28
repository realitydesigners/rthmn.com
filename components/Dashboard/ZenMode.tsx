"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { motion } from "framer-motion";
import React, { memo, useMemo, useState, useCallback, useEffect } from "react";
import { LuEye, LuLayoutDashboard, LuBarChart3 } from "react-icons/lu";
import type { BoxColors } from "@/stores/colorStore";
import type { BoxSlice } from "@/types/types";
import { useTimeframeStore } from "@/stores/timeframeStore";
import { DashboardBoxStructure } from "./DashboardBoxStructure";
import { calculateCircularPosition } from "@/components/Demo/SectionBoxes3D/mathUtils";
import { useCanvasSetup } from "@/components/Demo/SectionBoxes3D/useCanvasSetup";
import { ZenModeLoading } from "@/app/(user)/dashboard/LoadingSkeleton";

interface ZenModeProps {
  pairData: Record<string, { boxes: BoxSlice[] }>;
  orderedPairs: string[];
  boxColors?: BoxColors;
  isLoading?: boolean;
  isVisible?: boolean;
}

// Create structure data from pair data (filtering now handled in DashboardBoxStructure)
const createStructureFromPair = (
  pair: string,
  boxSlice?: BoxSlice
): BoxSlice => {
  if (boxSlice && boxSlice.boxes) {
    return boxSlice;
  }

  // Fallback empty structure
  return {
    timestamp: new Date().toISOString(),
    boxes: [],
  };
};

// Zen Mode Controls Component
const ZenModeControls = memo(
  ({
    viewMode,
    onViewModeChange,
    focusedIndex,
    pairs,
    onFocusChange,
  }: {
    viewMode: "scene" | "focus";
    onViewModeChange: (mode: "scene" | "focus") => void;
    focusedIndex: number;
    pairs: string[];
    onFocusChange: (index: number) => void;
  }) => (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

          <div className="relative z-10 flex items-center gap-3">
            {/* Scene navigation when in scene mode */}
            {viewMode === "scene" && (
              <>
                <button
                  onClick={() =>
                    onFocusChange(
                      (focusedIndex - 1 + pairs.length) % pairs.length
                    )
                  }
                  className="w-8 h-8 bg-[#1C1E23] hover:bg-[#32353C] rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-white text-xs">←</span>
                </button>
                <button
                  onClick={() =>
                    onFocusChange((focusedIndex + 1) % pairs.length)
                  }
                  className="w-8 h-8 bg-[#1C1E23] hover:bg-[#32353C] rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-white text-xs">→</span>
                </button>
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-[#32353C] to-transparent" />
              </>
            )}

            {/* Focus mode label when in focus mode */}
            {viewMode === "focus" && (
              <>
                <span className="font-russo text-xs text-[#818181] uppercase tracking-wider">
                  Focus Mode
                </span>
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-[#32353C] to-transparent" />
              </>
            )}

            {/* Mode toggle button */}
            <button
              onClick={() =>
                onViewModeChange(viewMode === "scene" ? "focus" : "scene")
              }
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all group ${
                viewMode === "focus"
                  ? "bg-[#24FF66] text-black"
                  : "bg-[#1C1E23] hover:bg-[#32353C] text-white"
              }`}
            >
              {viewMode === "scene" ? (
                <LuLayoutDashboard className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <LuBarChart3 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

ZenModeControls.displayName = "ZenModeControls";

// Pair Structure Indicator
const PairIndicator = memo(
  ({
    pairs,
    activeIndex,
    onSelect,
  }: {
    pairs: string[];
    activeIndex: number;
    onSelect: (index: number) => void;
  }) => (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm">
        {pairs.map((pair, index) => (
          <button
            key={pair}
            onClick={() => onSelect(index)}
            className={`px-2 py-1 rounded text-xs font-russo transition-all ${
              index === activeIndex
                ? "bg-[#24FF66] text-black"
                : "text-[#818181] hover:text-white hover:bg-[#1C1E23]"
            }`}
          >
            {pair.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
);

PairIndicator.displayName = "PairIndicator";

// Simple static camera component - no animations
const StaticCamera = memo(
  ({ isVisible, viewMode }: { isVisible: boolean; viewMode: string }) => {
    const { camera } = useThree();

    useEffect(() => {
      if (!isVisible) return;

      // Always reset to fixed camera position without any animation when becoming visible
      // This prevents any residual camera state from previous sessions
      camera.position.set(0, 0, 70);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }, [camera, isVisible, viewMode]); // Reset when visibility or view mode changes

    return null;
  }
);

StaticCamera.displayName = "StaticCamera";

export const ZenMode = memo(
  ({
    pairData,
    orderedPairs,
    boxColors,
    isLoading,
    isVisible = true,
  }: ZenModeProps) => {
    const { isClient } = useCanvasSetup();
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [viewMode, setViewMode] = useState<"scene" | "focus">("scene");
    const [internallyEntering, setInternallyEntering] = useState(false);

    // Handle entering transition internally
    useEffect(() => {
      if (isVisible) {
        setInternallyEntering(true);
        // Auto-hide loading after 300ms
        const timer = setTimeout(() => {
          setInternallyEntering(false);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setInternallyEntering(false);
      }
    }, [isVisible]); // Remove internallyEntering from deps to prevent infinite loop

    const shouldShowLoading = internallyEntering;

    // Calculate structure positions and properties - only recalculate when visible
    const structures = useMemo(() => {
      if (!isVisible) return []; // Skip expensive calculations when not visible

      return orderedPairs.map((pair, index) => {
        const circularPosition = calculateCircularPosition(
          index,
          focusedIndex,
          orderedPairs.length
        );
        const isFocused = index === focusedIndex;

        // In focus mode, bring the focused structure forward
        const position =
          viewMode === "focus" && isFocused
            ? ([
                circularPosition[0] * 0.5, // Reduced from 0.3 to keep it further from camera
                circularPosition[1] * 0.5, // Reduced from 0.3
                circularPosition[2] * 0.5 + 30, // Increased offset from 20 to 30
              ] as [number, number, number])
            : circularPosition;

        return {
          pair,
          position,
          scale: isFocused ? 1.2 : 0.8,
          opacity: isFocused ? 1 : 0.7,
          rotation:
            viewMode === "focus" && isFocused
              ? ([0.05, -0.3, 0] as [number, number, number]) // Reduced rotation angles for better view
              : undefined,
        };
      });
    }, [orderedPairs, focusedIndex, viewMode, isVisible]);

    // Reset focus when pairs change
    useEffect(() => {
      if (focusedIndex >= orderedPairs.length) {
        setFocusedIndex(0);
      }
    }, [orderedPairs.length, focusedIndex]);

    // Show loading screen during entering transition
    if (shouldShowLoading) {
      return <ZenModeLoading isVisible={true} />;
    }

    if (!orderedPairs.length) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-black">
          <div className="text-center">
            <LuEye className="w-16 h-16 text-[#32353C] mx-auto mb-4" />
            <h3 className="font-russo text-lg font-bold text-white mb-2">
              Zen Mode
            </h3>
            <p className="text-[#818181] max-w-md">
              No trading pairs selected. Add some pairs to experience the zen
              view.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-full w-full">
        <Canvas
          camera={{ position: [0, 0, 70], fov: 50 }}
          className="absolute inset-0 w-screen h-screen z-0"
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance",
          }}
          frameloop={isVisible ? "always" : "never"}
        >
          <ambientLight intensity={2} />
          <directionalLight position={[0, 60, 180]} intensity={1} />
          <StaticCamera isVisible={isVisible} viewMode={viewMode} />
          <OrbitControls
            enabled={viewMode === "focus" && isVisible}
            enableRotate={viewMode === "focus" && isVisible}
            maxDistance={100}
            minDistance={20}
            autoRotate={false}
            target={structures[focusedIndex]?.position || [0, 0, 0]}
            enablePan={false}
            enableZoom={true}
            zoomSpeed={0.5}
          />

          {/* Render all structures - only when visible */}
          {isVisible &&
            structures.map((structure, index) => {
              // In focus mode, only show the focused structure
              if (viewMode === "focus" && index !== focusedIndex) {
                return null;
              }

              const currentSlice = createStructureFromPair(
                structure.pair,
                pairData[structure.pair]?.boxes?.[0]
              );

              // Only show structures that should be visible based on opacity
              if (structure.opacity <= 0.01) {
                return null;
              }

              return (
                <DashboardBoxStructure
                  key={structure.pair}
                  slice={currentSlice}
                  pair={structure.pair}
                  structure={{
                    position: structure.position,
                    scale: structure.scale,
                    opacity: structure.opacity,
                    rotation: structure.rotation,
                  }}
                  isFocused={index === focusedIndex}
                  boxColors={boxColors}
                  isVisible={isVisible}
                  enableTransitions={true}
                />
              );
            })}
        </Canvas>
        {isVisible && (
          <ZenModeControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            focusedIndex={focusedIndex}
            pairs={orderedPairs}
            onFocusChange={setFocusedIndex}
          />
        )}
      </div>
    );
  }
);

ZenMode.displayName = "ZenMode";
