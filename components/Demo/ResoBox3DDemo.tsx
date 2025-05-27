"use client";

import type { BoxColors } from "@/stores/colorStore";
import type { Box, BoxSlice } from "@/types/types";
import {
	BASE_VALUES,
	createDemoStep,
	createMockBoxData,
	sequences,
} from "@/components/Constants/constants";
import { Edges, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
	ModeToggle,
	StructureIndicator,
	ControlPanel,
	NavButton,
	BaseButton,
} from "./SectionBoxes3D/Displays";
import * as THREE from "three";
import {
	LuBarChart3,
	LuInfo,
	LuHelpCircle,
	LuLayoutDashboard,
} from "react-icons/lu";
// TradingPanel import removed

const cryptoStructures = [
	{
		pair: "ETH",
		name: "Ethereum",
		startOffset: 20, // Different starting position
		speed: 1.2, // Faster than base
	},
	{
		pair: "BTC",
		name: "Bitcoin",
		startOffset: 4,
		speed: 0.8, // Slower than base
	},
	{
		pair: "SOL",
		name: "Solana",
		startOffset: 8, // Different starting position
		speed: 0.6, // Much slower
	},
	{
		pair: "ADA",
		name: "Cardano",
		startOffset: 40, // Different starting position
		speed: 1.0, // Base speed
	},
];

interface BoxDimensions {
	size: number;
	scale: number;
}

const calculateBoxDimensions = (
	index: number,
	baseSize: number,
): BoxDimensions => {
	const scale = (1 / Math.sqrt(1.5)) ** index;
	return {
		size: baseSize * scale,
		scale,
	};
};

// Calculate the corner position for a box inside its parent
const calculateCornerPosition = (
	currentBoxDimensions: BoxDimensions,
	parentBoxDimensions: BoxDimensions,
	isUp: boolean,
): [number, number, number] => {
	const parentHalfSize = parentBoxDimensions.size / 2;
	const currentHalfSize = currentBoxDimensions.size / 2;

	const xOffset = parentHalfSize - currentHalfSize;
	const zOffset = parentHalfSize - currentHalfSize;
	const yOffset = isUp
		? parentHalfSize - currentHalfSize
		: -(parentHalfSize - currentHalfSize);

	return [xOffset, yOffset, zOffset];
};

// 3D Box Component
interface Box3DProps {
	box: Box;
	boxColors: BoxColors;
	pair: string;
	absolutePosition: [number, number, number];
	dimensions: BoxDimensions;
	isOuterMost: boolean;
	scatteredPosition?: [number, number, number];
	formationProgress?: number;
	animationDelay?: number;
}

const Box3D = memo(
	({
		box,
		boxColors,
		pair,
		absolutePosition,
		dimensions,
		isOuterMost,
		scatteredPosition,
		formationProgress = 1,
		animationDelay = 0,
	}: Box3DProps) => {
		const meshRef = useRef<THREE.Mesh>(null);
		const groupRef = useRef<THREE.Group>(null);

		const baseColor = new THREE.Color(
			box.value > 0 ? boxColors.positive : boxColors.negative,
		);

		// Check if box is scattered for material adjustments (but keep same color)
		const isScattered = scatteredPosition && formationProgress < 0.8;

		// Animation logic for scattered to formed transition
		useFrame(() => {
			if (!groupRef.current || !scatteredPosition) return;

			// Apply delay to formation progress
			const delayedProgress = Math.max(
				0,
				Math.min(
					1,
					(formationProgress - animationDelay) / (1 - animationDelay),
				),
			);

			// Smooth easing function
			const easeInOutCubic = (t: number) =>
				t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
			const easedProgress = easeInOutCubic(delayedProgress);

			// Interpolate position between scattered and final
			const currentPos = [
				scatteredPosition[0] +
					(absolutePosition[0] - scatteredPosition[0]) * easedProgress,
				scatteredPosition[1] +
					(absolutePosition[1] - scatteredPosition[1]) * easedProgress,
				scatteredPosition[2] +
					(absolutePosition[2] - scatteredPosition[2]) * easedProgress,
			];

			groupRef.current.position.set(
				currentPos[0],
				currentPos[1],
				currentPos[2],
			);

			// No rotation at all - keep boxes static
			if (meshRef.current) {
				meshRef.current.rotation.x = 0;
				meshRef.current.rotation.y = 0;
			}
		});

		const finalPosition: [number, number, number] = scatteredPosition
			? [0, 0, 0]
			: absolutePosition;

		return (
			<group ref={groupRef} position={finalPosition}>
				<mesh
					ref={meshRef}
					scale={[dimensions.size, dimensions.size, dimensions.size]}
					castShadow
					receiveShadow
				>
					<boxGeometry />
					<meshPhysicalMaterial
						color={baseColor}
						transparent={true}
						opacity={1}
						metalness={0.4}
						roughness={0.1}
						clearcoat={1.0}
						clearcoatRoughness={0.1}
						transmission={0.1}
						thickness={0.5}
						ior={1.5}
						side={THREE.FrontSide}
						depthWrite={true}
						envMapIntensity={1.5}
					/>

					<Edges
						threshold={15} // Default angle threshold
						color={baseColor.clone().multiplyScalar(0.1)} // Slightly darker than base
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

const BoxStructure = memo(
	({
		slice,
		boxColors,
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
			const baseSize = 12; // Better size for proper nested structure

			sortedBoxes.forEach((box, index) => {
				const currentDimensions = calculateBoxDimensions(index, baseSize);
				let calculatedPosition: [number, number, number] = [0, 0, 0];
				const currentSignPositive = box.value > 0;

				if (index === 0) {
					// The first box is at the center position
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

						const [offsetX, offsetY, offsetZ] = calculateCornerPosition(
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

		return (
			<group>
				{/* Render all boxes in this structure */}
				{sortedBoxes.map((box, index) => {
					const data = calculatedPositionsAndDimensions.get(box.originalIndex);
					if (!data) return null;
					const { absolutePosition, dimensions } = data;

					// Ensure every box gets a scattered position, even if not pre-generated
					let scatteredPos = scatteredPositions?.get(box.originalIndex);
					if (!scatteredPos && scatteredPositions) {
						// Generate a fallback scattered position for boxes without one
						scatteredPos = [
							Math.random() * 60 + 30, // X between 30-90
							(Math.random() - 0.5) * 40, // Y between -20 to 20
							(Math.random() - 0.5) * 60, // Z between -30 to 30
						];
						scatteredPositions.set(box.originalIndex, scatteredPos);
					}

					return (
						<Box3D
							key={`${pair}-${box.originalIndex}`}
							box={box}
							boxColors={boxColors}
							pair={pair}
							absolutePosition={absolutePosition}
							dimensions={dimensions}
							isOuterMost={false}
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

// Animated Structure Component for smooth transitions
interface AnimatedStructureProps {
	structure: {
		position: [number, number, number];
		scale: number;
		opacity: number;
		pair: string;
		name: string;
	};
	slice: BoxSlice;
	boxColors: BoxColors;
	rotation?: { x: number; y: number; z: number };
	isFocused?: boolean;
	scatteredPositions?: Map<number, [number, number, number]>;
	formationProgress?: number;
}

const AnimatedStructure = memo(
	({
		structure,
		slice,
		boxColors,
		rotation,
		isFocused,
		scatteredPositions,
		formationProgress = 1,
	}: AnimatedStructureProps) => {
		const groupRef = useRef<THREE.Group>(null);

		// Smooth animation using useFrame
		useFrame(() => {
			if (!groupRef.current) return;

			// Animate position
			const targetPos = structure.position;
			const currentPos = groupRef.current.position;
			const lerpFactor = 0.08; // Adjust for animation speed

			currentPos.x += (targetPos[0] - currentPos.x) * lerpFactor;
			currentPos.y += (targetPos[1] - currentPos.y) * lerpFactor;
			currentPos.z += (targetPos[2] - currentPos.z) * lerpFactor;

			// Animate scale
			const targetScale = structure.scale;
			const currentScaleValue = groupRef.current.scale.x;
			const newScale =
				currentScaleValue + (targetScale - currentScaleValue) * lerpFactor;

			groupRef.current.scale.setScalar(newScale);

			// Apply rotation if provided and this is the focused structure
			if (rotation && isFocused) {
				groupRef.current.rotation.x = rotation.x;
				groupRef.current.rotation.y = rotation.y;
				groupRef.current.rotation.z = rotation.z;
			}
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

AnimatedStructure.displayName = "AnimatedStructure";

// Camera Controller Component for smooth transitions
interface CameraControllerProps {
	viewMode: "scene" | "box";
	isTransitioning: boolean;
	setIsTransitioning: (value: boolean) => void;
	focusedStructurePosition: [number, number, number];
}

const CameraController = memo(
	({
		viewMode,
		isTransitioning,
		setIsTransitioning,
		focusedStructurePosition,
	}: CameraControllerProps) => {
		const { camera } = useThree();
		const scenePosition = useRef(new THREE.Vector3(0, 0, 70));
		const boxPosition = useRef(
			new THREE.Vector3(
				focusedStructurePosition[0] + 15,
				focusedStructurePosition[1] + 10,
				focusedStructurePosition[2] + 15,
			),
		);
		const targetLookAt = useRef(new THREE.Vector3(...focusedStructurePosition));

		// Update box position when focused structure changes
		useFrame(() => {
			if (viewMode === "box") {
				boxPosition.current.set(
					focusedStructurePosition[0] + 15,
					focusedStructurePosition[1] + 10,
					focusedStructurePosition[2] + 15,
				);
				targetLookAt.current.set(...focusedStructurePosition);
			}

			if (isTransitioning) {
				const lerpFactor = 0.1;
				const targetPos =
					viewMode === "scene" ? scenePosition.current : boxPosition.current;
				const lookAtPos =
					viewMode === "scene"
						? new THREE.Vector3(0, 0, 0)
						: targetLookAt.current;

				camera.position.lerp(targetPos, lerpFactor);
				camera.lookAt(lookAtPos);

				// Check if we're close enough to stop transitioning
				const distance = camera.position.distanceTo(targetPos);
				if (distance < 0.1) {
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
	boxColors: BoxColors;
	onDominantStateChange?: (dominantState: string) => void;
	onCurrentSliceChange?: (slice: BoxSlice) => void; // New prop to expose current focused slice
	showOnlyBTC?: boolean; // New prop to show only BTC structure
	introMode?: boolean; // New prop to enable intro scattered state
	formationProgress?: number; // Progress from 0 (scattered) to 1 (formed)
}

export const ResoBox3DCircular = memo(
	({
		slice,
		className = "",
		boxColors,
		onDominantStateChange,
		onCurrentSliceChange,
		showOnlyBTC = false,
		introMode = false,
		formationProgress = 1,
	}: ResoBox3DCircularProps) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const [focusedIndex, setFocusedIndex] = useState(0);
		const [viewMode, setViewMode] = useState<"scene" | "box">("scene");
		const [isTransitioning, setIsTransitioning] = useState(false);
		const [isTradingPanelOpen, setIsTradingPanelOpen] = useState(false);

		// Define the four cryptocurrency structures with individual animation states

		// Individual animation states for each structure
		const [structureSteps, setStructureSteps] = useState(() =>
			cryptoStructures.map((crypto) => crypto.startOffset),
		);

		// Animation effect for independent structure movement
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

		// Generate individual data slices for each structure
		const structureSlices = useMemo(() => {
			return structureSteps.map((step) => {
				const currentValues = createDemoStep(
					Math.floor(step),
					sequences,
					BASE_VALUES,
				);
				const mockBoxData = createMockBoxData(currentValues);
				return { timestamp: new Date().toISOString(), boxes: mockBoxData };
			});
		}, [structureSteps]);

		// Generate scattered positions for intro mode - only once when introMode is enabled
		const scatteredPositions = useMemo(() => {
			if (!introMode) return undefined;

			const positions = new Map<number, [number, number, number]>();

			// Generate positions for more boxes to ensure all nested boxes get scattered
			// Increase to 12 to cover all possible nested boxes
			for (let i = 0; i < 12; i++) {
				const scatteredPos: [number, number, number] = [
					Math.random() * 60 + 30, // Random X between 30 and 90 (closer, more visible)
					(Math.random() - 0.5) * 40, // Random Y between -20 and 20 (closer)
					(Math.random() - 0.5) * 60, // Random Z between -30 and 30 (closer)
				];
				positions.set(i, scatteredPos);
			}

			return positions;
		}, [introMode]); // Only depend on introMode, not on slice changes

		// Calculate circular positions with rotation based on focused index
		const calculatePositions = useMemo(() => {
			const radius = 40;
			const baseAngle = (focusedIndex * Math.PI * 2) / cryptoStructures.length;

			const positions = cryptoStructures.map((crypto, index) => {
				// Calculate angle for this structure
				const angle =
					(index * Math.PI * 2) / cryptoStructures.length - baseAngle;

				// Calculate position on circle
				const x = Math.cos(angle) * radius;
				const z = Math.sin(angle) * radius;

				// Determine if this is the focused structure (closest to front center)
				const isFocused = index === focusedIndex;

				return {
					position: [x, 0, z] as [number, number, number],
					scale: isFocused ? 1.2 : 0.8, // Focused structure is slightly larger
					opacity: isFocused ? 1 : 0.7,
					...crypto,
				};
			});

			return positions;
		}, [focusedIndex]); // Remove cryptoStructures from dependency array

		// Find which structure is actually closest to the front center (for UI display)
		const actualFocusedIndex = useMemo(() => {
			// During intro mode or showOnlyBTC mode, always return BTC index
			if (introMode || showOnlyBTC) {
				const btcIndex = cryptoStructures.findIndex(
					(crypto) => crypto.pair === "BTC",
				);
				return btcIndex !== -1 ? btcIndex : 0;
			}

			let closestIndex = 0;
			let closestDistance = Number.POSITIVE_INFINITY;

			calculatePositions.forEach((pos, index) => {
				// Distance from front center [0, 0, positive z]
				const distance = Math.sqrt(pos.position[0] ** 2 + pos.position[2] ** 2);
				if (distance < closestDistance && pos.position[2] > 0) {
					closestDistance = distance;
					closestIndex = index;
				}
			});

			return closestIndex;
		}, [calculatePositions, introMode, showOnlyBTC]);

		// Calculate dominant state of the currently focused structure
		const dominantState = useMemo(() => {
			// During intro/showOnlyBTC mode, always use the passed slice (BTC data)
			// After intro, use the slice of the actually focused structure
			const focusedSlice =
				introMode || showOnlyBTC ? slice : structureSlices[actualFocusedIndex];

			if (!focusedSlice?.boxes || focusedSlice.boxes.length === 0) {
				return "neutral";
			}

			// Sort boxes by absolute value to get the largest one
			const sortedBoxes = focusedSlice.boxes.sort(
				(a, b) => Math.abs(b.value) - Math.abs(a.value),
			);

			return sortedBoxes[0].value > 0 ? "blue" : "red";
		}, [structureSlices, actualFocusedIndex, introMode, showOnlyBTC, slice]);

		// Emit dominant state changes to parent component
		useEffect(() => {
			if (onDominantStateChange) {
				onDominantStateChange(dominantState);
			}
		}, [dominantState, onDominantStateChange]);

		// Emit current focused slice to parent component
		useEffect(() => {
			if (onCurrentSliceChange) {
				// During intro/showOnlyBTC mode, always use the passed slice (BTC data)
				// After intro, use the slice of the actually focused structure
				const currentSlice =
					introMode || showOnlyBTC
						? slice
						: structureSlices[actualFocusedIndex];

				if (currentSlice) {
					onCurrentSliceChange(currentSlice);
				}
			}
		}, [
			structureSlices,
			actualFocusedIndex,
			onCurrentSliceChange,
			introMode,
			showOnlyBTC,
			slice,
		]);

		const handleNext = () => {
			setFocusedIndex((prev) => (prev + 1) % cryptoStructures.length);
		};

		const handlePrevious = () => {
			setFocusedIndex(
				(prev) =>
					(prev - 1 + cryptoStructures.length) % cryptoStructures.length,
			);
		};

		const toggleViewMode = () => {
			const newMode = viewMode === "scene" ? "box" : "scene";
			setViewMode(newMode);
			setIsTransitioning(true);

			// Handle panel state
			if (newMode === "scene") {
				setIsTradingPanelOpen(false);
			} else {
				// Open trading panel when entering box mode
				setIsTradingPanelOpen(true);
			}
		};

		if (!slice?.boxes || slice.boxes.length === 0) {
			return null;
		}

		return (
			<div
				ref={containerRef}
				className={`relative h-full w-full bg-black  ${className}`}
			>
				<Canvas
					camera={{
						position: [0, 0, 70],
						fov: 50,
					}}
					resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
					dpr={1}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: "high-performance",
					}}
				>
					{/* Enhanced Lighting Setup */}
					<ambientLight intensity={2} />
					<directionalLight
						position={[100, 100, 100]}
						intensity={1}
						castShadow
						shadow-mapSize-width={2048}
						shadow-mapSize-height={2048}
					/>

					{/* Atmospheric Fog Effect */}
					<fog attach="fog" args={["#000000", 80, 200]} />

					{/* Particle System for Ambient Effect */}
					{introMode && (
						<group>
							{[...Array(50)].map((_, i) => (
								<mesh
									key={`particle-${Date.now()}-${i}`}
									position={[
										(Math.random() - 0.5) * 200,
										(Math.random() - 0.5) * 100,
										(Math.random() - 0.5) * 150,
									]}
								>
									<sphereGeometry args={[0.1, 4, 4]} />
									<meshBasicMaterial
										color="#ffffff"
										transparent
										opacity={Math.random() * 0.3 + 0.1}
									/>
								</mesh>
							))}
						</group>
					)}

					<CameraController
						viewMode={viewMode}
						isTransitioning={isTransitioning}
						setIsTransitioning={setIsTransitioning}
						focusedStructurePosition={
							calculatePositions[actualFocusedIndex]?.position || [0, 0, 0]
						}
					/>

					<OrbitControls
						enabled={viewMode === "box" && !isTransitioning}
						enableRotate={viewMode === "box" && !isTransitioning}
						maxDistance={40}
						minDistance={5}
						autoRotate={false}
						target={
							calculatePositions[actualFocusedIndex]?.position || [0, 0, 0]
						}
					/>

					{calculatePositions.map((structure, index) => {
						const isFocused = index === focusedIndex;
						const isActuallyFocused = index === actualFocusedIndex;
						const shouldShowStructure =
							viewMode === "scene" || isActuallyFocused;

						// In intro mode or showOnlyBTC mode, only show BTC structure
						if (introMode || showOnlyBTC) {
							const btcIndex = cryptoStructures.findIndex(
								(crypto) => crypto.pair === "BTC",
							);
							if (index !== btcIndex) return null; // Only show BTC structure

							// During intro mode, BTC should be positioned where it will appear in circular mode
							// When focusedIndex is 0 (BTC), it appears at the front center of the circle
							// Calculate BTC's position in the circular arrangement when it's focused
							const radius = 40;
							const btcAngle =
								(0 * Math.PI * 2) / cryptoStructures.length -
								(0 * Math.PI * 2) / cryptoStructures.length; // BTC is at index 0, focused
							const btcX = Math.cos(btcAngle) * radius; // This will be 0 * radius = 0
							const btcZ = Math.sin(btcAngle) * radius; // This will be 0 * radius = 0

							// But we want it at the front of the circle, so when focused it should be at [0, 0, radius]
							const currentPosition: [number, number, number] = [0, 0, 30]; // Front center of the circle

							// For BTC in intro/showOnlyBTC mode, use the position where it will appear in circular mode
							return (
								<AnimatedStructure
									key={structure.pair}
									structure={{
										...structure,
										position: currentPosition,
										scale: 1.0, // Keep consistent scale
									}}
									slice={slice} // Always use the passed slice for BTC
									boxColors={boxColors}
									rotation={undefined}
									isFocused={true} // Always focused when showing only BTC
									scatteredPositions={
										introMode ? scatteredPositions : undefined
									}
									formationProgress={formationProgress}
								/>
							);
						}

						if (!shouldShowStructure) {
							return null;
						}

						// Use generated slices for normal multi-structure mode
						const currentSlice = structureSlices[index];

						return (
							<AnimatedStructure
								key={structure.pair}
								structure={structure}
								slice={currentSlice}
								boxColors={boxColors}
								rotation={undefined}
								isFocused={isFocused}
								scatteredPositions={undefined}
								formationProgress={1} // Always formed in normal mode
							/>
						);
					})}
				</Canvas>

				{/* Top Structure Indicator - hidden during intro */}
				{!introMode && !showOnlyBTC && (
					<div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
						<StructureIndicator
							structures={cryptoStructures}
							activeIndex={actualFocusedIndex}
							onSelect={setFocusedIndex}
						/>
					</div>
				)}

				{/* BTC Structure Indicator during intro mode */}
				{(introMode || showOnlyBTC) && (
					<div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
						<StructureIndicator
							structures={cryptoStructures}
							activeIndex={cryptoStructures.findIndex(
								(crypto) => crypto.pair === "BTC",
							)} // Always show BTC during intro
							onSelect={() => {}} // No selection during intro
						/>
					</div>
				)}

				{/* Bottom Navigation Controls - hidden during intro */}
				{!introMode && !showOnlyBTC && (
					<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
						<div className="flex items-center gap-4">
							{viewMode === "scene" && (
								<>
									{/* Navigation Arrows */}
									<div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
										{/* Background glow */}
										<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10" />

										{/* Top highlight */}
										<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

										<div className="relative z-10 flex items-center gap-3">
											<NavButton direction="left" onClick={handlePrevious} />
											<div className="w-px h-8 bg-gradient-to-b from-transparent via-[#32353C] to-transparent" />
											<NavButton direction="right" onClick={handleNext} />
										</div>
									</div>
								</>
							)}

							{viewMode === "box" && (
								<>
									{/* Box Mode Action Panel */}
									<div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
										{/* Background glow */}
										<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10" />

										{/* Top highlight */}
										<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

										<div className="relative z-10 flex items-center gap-3">
											<span className="font-outfit text-xs text-[#818181] uppercase tracking-wider">
												Focus Mode
											</span>

											<div className="w-px h-6 bg-gradient-to-b from-transparent via-[#32353C] to-transparent" />

											{/* Trading Panel Toggle */}
											<BaseButton
												onClick={() =>
													setIsTradingPanelOpen(!isTradingPanelOpen)
												}
												variant={isTradingPanelOpen ? "primary" : "secondary"}
												size="md"
												className="group"
											>
												<LuBarChart3 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
											</BaseButton>

											<BaseButton
												variant="secondary"
												size="md"
												className="group"
											>
												<LuLayoutDashboard className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
											</BaseButton>
										</div>
									</div>
								</>
							)}

							{/* Mode Toggle - Always visible */}
							<ModeToggle viewMode={viewMode} onToggle={toggleViewMode} />
						</div>
					</div>
				)}

				{/* Trading Info Side Panel */}
				{/* <TradingInfoPanel
					isOpen={isTradingPanelOpen}
					onClose={() => setIsTradingPanelOpen(false)}
					tradingData={
						mockTradingData[cryptoStructures[actualFocusedIndex].pair]
					}
				/> */}
			</div>
		);
	},
);

ResoBox3DCircular.displayName = "ResoBox3DCircular";
