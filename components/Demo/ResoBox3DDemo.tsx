"use client";

import React from "react";
import type { BoxSlice } from "@/types/types";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { memo, useMemo, useState, useEffect } from "react";
import type { MotionValue } from "framer-motion";
import {
	calculateCircularPosition,
	generateScatteredPosition,
} from "./SectionBoxes3D/utils/mathUtils";
import { useCanvasSetup } from "./SectionBoxes3D/hooks/useCanvasSetup";
import { useAnimatedStructures } from "./SectionBoxes3D/hooks/useAnimatedStructures";
import { BoxStructure } from "./SectionBoxes3D/components/BoxStructure";
import { CameraController } from "./SectionBoxes3D/components/CameraController";

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
			"scene",
		);
		const viewMode = externalViewMode ?? internalViewMode;

		if (!slice?.boxes?.length) return null;
		// Generate scattered positions for intro
		const scatteredPositions = useMemo(() => {
			if (!introMode) return undefined;
			const positions = new Map<number, [number, number, number]>();
			for (let i = 0; i < 12; i++) {
				positions.set(i, generateScatteredPosition());
			}
			return positions;
		}, [introMode]);

		// Calculate structure positions and properties
		const structures = useMemo(
			() =>
				cryptoStructures.map((crypto, index) => {
					const basePosition = calculateCircularPosition(
						index,
						focusedIndex,
						cryptoStructures.length,
					);
					const isFocused = index === focusedIndex;

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
						opacity: isFocused ? 1 : 0.7,
						rotation:
							viewMode === "box" && isFocused
								? ([0.1, -0.75, 0] as [number, number, number])
								: undefined,
					};
				}),
			[cryptoStructures, focusedIndex, viewMode],
		);

		// Calculate focused structure and dominant state
		const actualFocusedIndex = introMode
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

		const currentSlice = introMode
			? structureSlices[0]
			: structureSlices[actualFocusedIndex];

		useEffect(
			() => onCurrentSliceChange?.(currentSlice),
			[currentSlice, onCurrentSliceChange],
		);

		return (
			<div className={`relative h-full w-full bg-black ${className}`}>
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

					{structures.map((structure, index) => {
						if (introMode && index !== 0) return null;
						if (
							!introMode &&
							viewMode === "box" &&
							index !== actualFocusedIndex
						)
							return null;

						const currentSlice = structureSlices[index];

						return (
							<BoxStructure
								key={structure.pair}
								slice={currentSlice}
								pair={structure.pair}
								structure={
									introMode
										? {
												position: [0, 0, 40],
												scale: 1.0,
												opacity: 1.0,
											}
										: {
												position: structure.position,
												scale: structure.scale,
												opacity: structure.opacity,
												rotation: structure.rotation,
											}
								}
								scatteredPositions={introMode ? scatteredPositions : undefined}
								formationProgress={formationProgress}
								isFocused={index === focusedIndex}
							/>
						);
					})}
				</Canvas>
			</div>
		);
	},
);

ResoBox3DCircular.displayName = "ResoBox3DCircular";
