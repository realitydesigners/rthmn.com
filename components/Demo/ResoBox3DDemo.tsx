"use client";

import type { BoxSlice } from "@/types/types";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import React from "react";
import { memo, useEffect, useMemo, useState } from "react";
import { BoxStructure } from "./SectionBoxes3D/BoxStructure";
import { CameraController } from "./SectionBoxes3D/CameraController";
import { useAnimatedStructures } from "./SectionBoxes3D/useAnimatedStructures";
import { useCanvasSetup } from "./SectionBoxes3D/useCanvasSetup";
import {
  calculateCircularPosition,
  generateScatteredPosition,
} from "./SectionBoxes3D/mathUtils";

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

    // Generate scattered positions for intro animation
    const scatteredPositions = useMemo(() => {
      const positions = new Map<number, [number, number, number]>();
      for (let i = 0; i < 12; i++) {
        positions.set(i, generateScatteredPosition());
      }
      return positions;
    }, []); // Only generate once, never changes

    // Determine what to show based on intro mode and scroll progress
    const showOnlyFirstStructure = introMode || scrollProgress < 0.25;
    const showCircularArrangement = !introMode && scrollProgress >= 0.25;

    // Calculate transition progress for the first structure moving to circular position
    // This happens immediately when formation completes, preparing for circular arrangement
    const firstStructureTransitionProgress = introMode ? 0 : 1;

    // Calculate transition progress for other structures appearing
    // This only happens when user scrolls
    const circularAppearanceProgress = showCircularArrangement
      ? Math.min(1, (scrollProgress - 0.25) / 0.1) // Quick fade-in over 0.1 scroll range
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

          // For the first structure, smoothly transition from center to circular position
          let basePosition = circularPosition;
          if (index === 0) {
            // Smoothly interpolate from center [0, 0, 40] to circular position
            const centerPosition: [number, number, number] = [0, 0, 40];
            basePosition = [
              centerPosition[0] +
                (circularPosition[0] - centerPosition[0]) *
                  firstStructureTransitionProgress,
              centerPosition[1] +
                (circularPosition[1] - centerPosition[1]) *
                  firstStructureTransitionProgress,
              centerPosition[2] +
                (circularPosition[2] - centerPosition[2]) *
                  firstStructureTransitionProgress,
            ];
          }

          // In box mode, bring the focused structure forward and rotate it
          const position =
            viewMode === "box" && isFocused
              ? ([
                  basePosition[0] * 0.3,
                  basePosition[1] * 0.3,
                  basePosition[2] * 0.3 + 20,
                ] as [number, number, number])
              : basePosition;

          return {
            ...crypto,
            position,
            scale: isFocused ? 1.2 : 0.8,
            opacity:
              index === 0
                ? isFocused
                  ? 1
                  : 0.7 // First structure always visible after formation
                : circularAppearanceProgress * (isFocused ? 1 : 0.7), // Others fade in on scroll
            rotation:
              viewMode === "box" && isFocused
                ? ([0.1, -0.75, 0] as [number, number, number])
                : undefined,
          };
        }),
      [
        cryptoStructures,
        focusedIndex,
        viewMode,
        showOnlyFirstStructure,
        showCircularArrangement,
        firstStructureTransitionProgress,
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
            maxDistance={40}
            minDistance={5}
            autoRotate={false}
            target={structures[actualFocusedIndex]?.position || [0, 0, 0]}
          />

          {/* Always show all structures with seamless transitions */}
          {structures.map((structure, index) => {
            // In box mode, only show the focused structure
            if (viewMode === "box" && index !== actualFocusedIndex) {
              return null;
            }

            const currentSlice = structureSlices[index];

            // Only show structures that should be visible based on opacity
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
                scatteredPositions={
                  index === 0 && introMode ? scatteredPositions : undefined
                }
                formationProgress={index === 0 ? formationProgress : 1}
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
