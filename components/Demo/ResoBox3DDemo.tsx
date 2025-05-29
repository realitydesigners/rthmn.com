"use client";

import type { BoxColors } from "@/stores/colorStore";
import type { Box, BoxSlice } from "@/types/types";
import {
	BASE_VALUES,
	createDemoStep,
	createMockBoxData,
	sequences,
} from "@/components/Constants/constants";
import { Edges, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
	StructureIndicator,
	NavButton,
	BaseButton,
} from "./SectionBoxes3D/Displays";
import * as THREE from "three";
import { LuBarChart3, LuLayoutDashboard } from "react-icons/lu";

const cryptoStructures = [
	{ pair: "ETH", name: "Ethereum", startOffset: 20, speed: 1.2 },
	{ pair: "BTC", name: "Bitcoin", startOffset: 4, speed: 0.8 },
	{ pair: "SOL", name: "Solana", startOffset: 8, speed: 0.6 },
	{ pair: "ADA", name: "Cardano", startOffset: 40, speed: 1.0 },
];

// Utility functions
const easeInOutCubic = (t: number): number =>
	t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

const lerp = (start: number, end: number, factor: number) =>
	start + (end - start) * factor;

const calculateBoxScale = (index: number) => (1 / Math.sqrt(1.5)) ** index;

interface BoxDimensions {
	size: number;
	scale: number;
}

const getBoxDimensions = (index: number, baseSize = 12): BoxDimensions => {
	const scale = calculateBoxScale(index);
	return { size: baseSize * scale, scale };
};

const getCornerPosition = (
	current: BoxDimensions,
	parent: BoxDimensions,
	isUp: boolean,
): [number, number, number] => {
	const offset = (parent.size - current.size) / 2;
	return [offset, isUp ? offset : -offset, offset];
};

// 3D Box Component with simplified animation and material
const Box3D = memo(
	({
		box,

		absolutePosition,
		dimensions,
		scatteredPosition,
		formationProgress = 1,
		animationDelay = 0,
	}: {
		box: Box;

		absolutePosition: [number, number, number];
		dimensions: BoxDimensions;
		scatteredPosition?: [number, number, number];
		formationProgress?: number;
		animationDelay?: number;
	}) => {
		const groupRef = useRef<THREE.Group>(null);
		const color = box.value > 0 ? boxColors.positive : boxColors.negative;

		useFrame(() => {
			if (!groupRef.current || !scatteredPosition) return;

			const delayedProgress = Math.max(
				0,
				Math.min(
					1,
					(formationProgress - animationDelay) / (1 - animationDelay),
				),
			);
			const easedProgress = easeInOutCubic(delayedProgress);

			const pos = scatteredPosition.map((start, i) =>
				lerp(start, absolutePosition[i], easedProgress),
			);
			groupRef.current.position.set(pos[0], pos[1], pos[2]);
		});

		return (
			<group
				ref={groupRef}
				position={scatteredPosition ? [0, 0, 0] : absolutePosition}
			>
				<mesh scale={dimensions.size} castShadow receiveShadow>
					<boxGeometry />
					<meshPhysicalMaterial
						color={color}
						metalness={0.4}
						roughness={0.1}
						clearcoat={1}
						clearcoatRoughness={0.1}
						transmission={0.1}
						thickness={0.5}
						ior={1.5}
						envMapIntensity={1.5}
					/>
					<Edges
						threshold={15}
						color={new THREE.Color(color).multiplyScalar(0.1)}
					/>
				</mesh>
			</group>
		);
	},
);

// Box Structure Component - renders a complete nested box structure
interface BoxStructureProps {
	slice: BoxSlice;
	boxColors: BoxColors;
	pair: string;
	centerPosition: [number, number, number];
	scatteredPositions?: Map<number, [number, number, number]>;
	formationProgress?: number;
}

const boxColors = {
	positive: "#24FF66", // Matrix green
	negative: "#303238", // Dark gray
	styles: {
		borderRadius: 4,
		shadowIntensity: 0.4,
		opacity: 0.9,
		showBorder: true,
		globalTimeframeControl: false,
		showLineChart: false,
		viewMode: "3d" as const,
	},
};

const BoxStructure = memo(
	({
		slice,

		pair,
		centerPosition,
		scatteredPositions,
		formationProgress = 1,
	}: BoxStructureProps) => {
		// Prepare sorted boxes with original index
		const sortedBoxes = useMemo(
			() =>
				slice.boxes
					.map((box, i) => ({ ...box, originalIndex: i }))
					.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
			[slice.boxes],
		);

		// Calculate all absolute positions and dimensions relative to center position
		const calculatedPositionsAndDimensions = useMemo(() => {
			const positions = new Map<
				number,
				{
					absolutePosition: [number, number, number];
					dimensions: BoxDimensions;
				}
			>();
			const baseSize = 12;

			sortedBoxes.forEach((box, index) => {
				const currentDimensions = getBoxDimensions(index, baseSize);
				let calculatedPosition: [number, number, number] = [0, 0, 0];
				const currentSignPositive = box.value > 0;

				if (index === 0) {
					calculatedPosition = [...centerPosition];
				} else {
					const prevSortedBox = sortedBoxes[index - 1];
					const prevSortedBoxData = positions.get(prevSortedBox.originalIndex);

					if (prevSortedBoxData) {
						const parentPosition = prevSortedBoxData.absolutePosition;
						const parentDimensions = prevSortedBoxData.dimensions;
						const prevSignPositive = prevSortedBox.value > 0;

						const positionSignPositive =
							currentSignPositive === prevSignPositive
								? currentSignPositive
								: prevSignPositive;

						const [offsetX, offsetY, offsetZ] = getCornerPosition(
							currentDimensions,
							parentDimensions,
							positionSignPositive,
						);

						const initialPosition: [number, number, number] = [
							parentPosition[0] + offsetX,
							parentPosition[1] + offsetY,
							parentPosition[2] + offsetZ,
						];

						const epsilon = 0.005;
						const offsetVector: [number, number, number] = [
							offsetX,
							offsetY,
							offsetZ,
						];
						const magnitude = Math.sqrt(
							offsetVector[0] ** 2 +
								offsetVector[1] ** 2 +
								offsetVector[2] ** 2,
						);

						if (magnitude > 0) {
							const normalizedOffset: [number, number, number] = [
								(offsetVector[0] / magnitude) * epsilon,
								(offsetVector[1] / magnitude) * epsilon,
								(offsetVector[2] / magnitude) * epsilon,
							];
							calculatedPosition = [
								initialPosition[0] + normalizedOffset[0],
								initialPosition[1] + normalizedOffset[1],
								initialPosition[2] + normalizedOffset[2],
							];
						} else {
							calculatedPosition = initialPosition;
						}
					} else {
						console.warn(
							"Could not find previous box data for positioning:",
							prevSortedBox.originalIndex,
						);
						calculatedPosition = [...centerPosition];
					}
				}

				positions.set(box.originalIndex, {
					absolutePosition: calculatedPosition,
					dimensions: currentDimensions,
				});
			});

			return positions;
		}, [sortedBoxes, centerPosition]);

		// Custom box colors for 3D visualization

		return (
			<group>
				{/* Render all boxes in this structure */}
				{sortedBoxes.map((box, index) => {
					const data = calculatedPositionsAndDimensions.get(box.originalIndex);
					if (!data) return null;
					const { absolutePosition, dimensions } = data;

					// Get or generate scattered position if needed
					let scatteredPos = scatteredPositions?.get(box.originalIndex);
					if (!scatteredPos && scatteredPositions) {
						scatteredPos = [
							Math.random() * 60 + 30,
							(Math.random() - 0.5) * 40,
							(Math.random() - 0.5) * 60,
						];
						scatteredPositions.set(box.originalIndex, scatteredPos);
					}

					return (
						<Box3D
							key={`${pair}-${box.originalIndex}`}
							box={box}
							absolutePosition={absolutePosition}
							dimensions={dimensions}
							scatteredPosition={scatteredPos}
							formationProgress={formationProgress}
							animationDelay={index * 0.1}
						/>
					);
				})}
			</group>
		);
	},
);

BoxStructure.displayName = "BoxStructure";

// Simplified Animated Structure Component
const AnimatedStructure = memo(
	({
		structure,
		slice,
		isFocused,
		scatteredPositions,
		formationProgress = 1,
	}: {
		structure: {
			position: [number, number, number];
			scale: number;
			opacity: number;
			pair: string;
		};
		slice: BoxSlice;
		isFocused?: boolean;
		scatteredPositions?: Map<number, [number, number, number]>;
		formationProgress?: number;
	}) => {
		const groupRef = useRef<THREE.Group>(null);

		useFrame(() => {
			if (!groupRef.current) return;

			const { position, scale } = structure;
			const current = groupRef.current;
			const lerpFactor = 0.08;

			// Animate position and scale
			current.position.x = lerp(current.position.x, position[0], lerpFactor);
			current.position.y = lerp(current.position.y, position[1], lerpFactor);
			current.position.z = lerp(current.position.z, position[2], lerpFactor);
			current.scale.setScalar(lerp(current.scale.x, scale, lerpFactor));
		});

		return (
			<group ref={groupRef}>
				<BoxStructure
					slice={slice}
					boxColors={boxColors}
					pair={structure.pair}
					centerPosition={[0, 0, 0]}
					scatteredPositions={scatteredPositions}
					formationProgress={formationProgress}
				/>
			</group>
		);
	},
);

// Unified Camera Controller
const CameraController = memo(
	({
		viewMode,
		isTransitioning,
		setIsTransitioning,
		focusedPosition,
		scrollProgress,
		introMode,
	}: {
		viewMode: "scene" | "box";
		isTransitioning: boolean;
		setIsTransitioning: (value: boolean) => void;
		focusedPosition: [number, number, number];
		scrollProgress: number;
		introMode: boolean;
	}) => {
		const { camera } = useThree();

		useFrame(() => {
			// Handle scroll-based camera movement during intro
			if (scrollProgress >= 0.25) {
				const progress = Math.min(1, (scrollProgress - 0.25) / 0.1);
				const easedProgress = easeInOutCubic(progress);
				const distance = 70 / (1 + easedProgress * 0);
				camera.position.setZ(distance);
			}

			// Handle view mode transitions
			if (isTransitioning) {
				const targetPos =
					viewMode === "scene"
						? new THREE.Vector3(0, 0, 70)
						: new THREE.Vector3(
								focusedPosition[0] + 15,
								focusedPosition[1] + 10,
								focusedPosition[2] + 15,
							);
				const lookAt =
					viewMode === "scene"
						? new THREE.Vector3(0, 0, 0)
						: new THREE.Vector3(...focusedPosition);

				camera.position.lerp(targetPos, 0.1);
				camera.lookAt(lookAt);

				if (camera.position.distanceTo(targetPos) < 0.1) {
					setIsTransitioning(false);
					camera.position.copy(targetPos);
				}
			}
		});

		return null;
	},
);

CameraController.displayName = "CameraController";

// Circular arrangement of four box structures
interface ResoBox3DCircularProps {
	slice: BoxSlice;
	className?: string;

	onDominantStateChange?: (dominantState: string) => void;
	onCurrentSliceChange?: (slice: BoxSlice) => void; // New prop to expose current focused slice
	introMode?: boolean; // New prop to enable intro scattered state
	formationProgress?: number; // Progress from 0 (scattered) to 1 (formed)
	scrollProgress?: number; // New prop for scroll-based camera movement
}

export const ResoBox3DCircular = memo(
	({
		slice,
		className = "",

		onDominantStateChange,
		onCurrentSliceChange,
		introMode = false,
		formationProgress = 1,
		scrollProgress = 0,
	}: ResoBox3DCircularProps) => {
		const [focusedIndex, setFocusedIndex] = useState(0);
		const [viewMode, setViewMode] = useState<"scene" | "box">("scene");
		const [isTransitioning, setIsTransitioning] = useState(false);
		const [isTradingPanelOpen, setIsTradingPanelOpen] = useState(false);
		const [structureSteps, setStructureSteps] = useState<number[]>(
			cryptoStructures.map((crypto) => crypto.startOffset),
		);

		// Creative step animation - cycles through different market states
		useEffect(() => {
			const interval = setInterval(() => {
				setStructureSteps((prevSteps) =>
					prevSteps.map((step, index) => {
						const crypto = cryptoStructures[index];
						const increment = crypto.speed * 0.5; // Much slower base speed
						return (step + increment) % sequences.length;
					}),
				);
			}, 800); // Slower interval (was 200ms in original)

			return () => clearInterval(interval);
		}, []); // Remove cryptoStructures from dependency array

		// Generate structure data - this changes with structureSteps to create the animation
		const structureSlices = useMemo(() => {
			return cryptoStructures.map((crypto, index) => {
				const step = structureSteps[index];
				const values = createDemoStep(Math.floor(step), sequences, BASE_VALUES);
				return {
					timestamp: new Date().toISOString(),
					boxes: createMockBoxData(values),
				};
			});
		}, [structureSteps]);

		// Generate scattered positions - fixed for intro mode consistency
		const scatteredPositions = useMemo(() => {
			if (!introMode) return undefined;

			const positions = new Map<number, [number, number, number]>();
			// Generate positions for more boxes to ensure all nested boxes get scattered
			for (let i = 0; i < 12; i++) {
				const scatteredPos: [number, number, number] = [
					Math.random() * 60 + 30,
					(Math.random() - 0.5) * 40,
					(Math.random() - 0.5) * 60,
				];
				positions.set(i, scatteredPos);
			}
			return positions;
		}, [introMode]);

		// Calculate circular positions
		const structures = useMemo(
			() =>
				cryptoStructures.map((crypto, index) => {
					const angle =
						((index - focusedIndex) * Math.PI * 2) / cryptoStructures.length +
						Math.PI / 2;
					const isFocused = index === focusedIndex;
					return {
						...crypto,
						position: [Math.cos(angle) * 35, 0, Math.sin(angle) * 35] as [
							number,
							number,
							number,
						],
						scale: isFocused ? 1.2 : 0.8,
						opacity: isFocused ? 1 : 0.7,
					};
				}),
			[focusedIndex],
		);

		// Find actual focused structure (closest to front)
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

		// Calculate and emit dominant state - use animated data
		const currentSlice = introMode
			? structureSlices[0] // Use animated first structure data during intro
			: structureSlices[actualFocusedIndex];

		const dominantState = useMemo(() => {
			if (!currentSlice?.boxes?.length) return "neutral";
			const largest = currentSlice.boxes.reduce((max, box) =>
				Math.abs(box.value) > Math.abs(max.value) ? box : max,
			);
			return largest.value > 0 ? "blue" : "red";
		}, [currentSlice]);

		useEffect(
			() => onDominantStateChange?.(dominantState),
			[dominantState, onDominantStateChange],
		);
		useEffect(
			() => onCurrentSliceChange?.(currentSlice),
			[currentSlice, onCurrentSliceChange],
		);

		const navigation = {
			next: () =>
				setFocusedIndex((prev) => (prev + 1) % cryptoStructures.length),
			previous: () =>
				setFocusedIndex(
					(prev) =>
						(prev - 1 + cryptoStructures.length) % cryptoStructures.length,
				),
		};

		if (!slice?.boxes?.length) return null;

		return (
			<div className={`relative h-full w-full bg-black  ${className}`}>
				<Canvas
					camera={{ position: [0, 0, 70], fov: 50 }}
					resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
					className="absolute inset-0 w-screen h-screen z-0"
				>
					<ambientLight intensity={2} />
					<directionalLight position={[0, 60, 180]} intensity={1} />

					<CameraController
						viewMode={viewMode}
						isTransitioning={isTransitioning}
						setIsTransitioning={setIsTransitioning}
						focusedPosition={
							structures[actualFocusedIndex]?.position || [0, 0, 0]
						}
						scrollProgress={scrollProgress}
						introMode={introMode}
					/>

					<OrbitControls
						enabled={viewMode === "box" && !isTransitioning}
						enableRotate={viewMode === "box" && !isTransitioning}
						maxDistance={40}
						minDistance={5}
						autoRotate={false}
						target={structures[actualFocusedIndex]?.position || [0, 0, 0]}
					/>

					{structures.map((structure, index) => {
						// Show only first structure during intro, or based on view mode
						if (introMode && index !== 0) return null;
						if (
							!introMode &&
							viewMode === "box" &&
							index !== actualFocusedIndex
						)
							return null;

						// Use animated structure data instead of static slice
						const currentSlice = structureSlices[index];

						return (
							<AnimatedStructure
								key={structure.pair}
								structure={
									introMode
										? {
												...structure,
												position: [0, 0, 40],
												scale: 1.0,
												opacity: 1.0,
											}
										: structure
								}
								slice={currentSlice} // This now changes with the animation!
								isFocused={index === focusedIndex}
								scatteredPositions={introMode ? scatteredPositions : undefined}
								formationProgress={formationProgress}
							/>
						);
					})}
				</Canvas>

				{/* Top Structure Indicator - hidden during intro */}
				{!introMode && (
					<div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
						<StructureIndicator
							structures={cryptoStructures}
							activeIndex={focusedIndex}
							onSelect={setFocusedIndex}
						/>
					</div>
				)}

				{/* Bottom Navigation Controls - hidden during intro */}
				{!introMode && (
					<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
						<div className="flex items-center gap-4">
							{viewMode === "scene" && (
								<div className="flex items-center gap-3 px-4 py-2 rounded-xl ">
									<div className="relative z-10 flex items-center gap-3">
										<NavButton direction="left" onClick={navigation.previous} />
										<NavButton direction="right" onClick={navigation.next} />
									</div>
								</div>
							)}

							{viewMode === "box" && (
								<div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
									{/* Background glow */}
									<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10" />

									{/* Top highlight */}
									<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

									<div className="relative z-10 flex items-center gap-3">
										<span className="font-russo text-xs text-[#818181] uppercase tracking-wider">
											Focus Mode
										</span>

										<div className="w-px h-6 bg-gradient-to-b from-transparent via-[#32353C] to-transparent" />

										{/* Trading Panel Toggle */}
										<BaseButton
											onClick={() => setIsTradingPanelOpen(!isTradingPanelOpen)}
											variant={isTradingPanelOpen ? "primary" : "secondary"}
											size="md"
											className="group"
										>
											<LuBarChart3 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
										</BaseButton>

										<BaseButton variant="secondary" size="md" className="group">
											<LuLayoutDashboard className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
										</BaseButton>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	},
);

ResoBox3DCircular.displayName = "ResoBox3DCircular";
