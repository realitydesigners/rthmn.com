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
import * as THREE from "three";
import {
	LuChevronLeft,
	LuChevronRight,
	LuEye,
	LuBox,
	LuBarChart3,
	LuInfo,
	LuHelpCircle,
	LuLayoutDashboard,
	LuOrbit,
} from "react-icons/lu";
import { TradingInfoPanel, mockTradingData } from "./TradingPanel";
import Image from "next/image";

const cryptoStructures = [
	{
		pair: "BTC",
		name: "Bitcoin",
		startOffset: 4,
		speed: 0.8, // Slower than base
	},
	{
		pair: "ETH",
		name: "Ethereum",
		startOffset: 20, // Different starting position
		speed: 1.2, // Faster than base
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

// Modular Button Components
interface BaseButtonProps {
	onClick?: () => void;
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
}

const BaseButton = memo(
	({
		onClick,
		disabled = false,
		className = "",
		children,
		variant = "secondary",
		size = "md",
	}: BaseButtonProps) => {
		const sizeClasses = {
			sm: "h-8 w-8 text-xs",
			md: "h-10 w-10 text-sm",
			lg: "h-12 w-12 text-base",
		};

		const variantClasses = {
			primary:
				"bg-gradient-to-b from-white/20 via-white/10 to-transparent border-white/40 text-white hover:border-white/60 hover:from-white/30 hover:via-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
			secondary:
				"bg-gradient-to-b from-[#1C1E23]/80 via-[#0F1012]/60 to-[#0A0B0D]/40 border-[#1C1E23]/60 text-white/80 hover:border-[#32353C]/80 hover:from-[#1C1E23] hover:via-[#0F1012] hover:text-white hover:shadow-[0_0_15px_rgba(0,0,0,0.4)]",
			ghost:
				"bg-black/40 backdrop-blur-sm border-white/30 text-white hover:bg-white/10 hover:border-white/60 hover:text-white",
			danger:
				"bg-gradient-to-b from-red-500/20 via-red-500/10 to-transparent border-red-500/40 text-red-400 hover:border-red-500/60 hover:from-red-500/30 hover:via-red-500/15 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
		};

		return (
			<button
				type="button"
				onClick={onClick}
				disabled={disabled}
				className={`
				group relative flex items-center justify-center rounded-full border transition-all duration-300
				${sizeClasses[size]}
				${variantClasses[variant]}
				${disabled ? "opacity-50 cursor-not-allowed" : ""}
				${className}
			`}
			>
				{/* Subtle inner glow */}
				<div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.03] via-transparent to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

				{/* Top highlight */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				{/* Content */}
				<div className="relative z-10">{children}</div>
			</button>
		);
	},
);

BaseButton.displayName = "BaseButton";

// Navigation Button Component
interface NavButtonProps {
	direction: "left" | "right";
	onClick: () => void;
	disabled?: boolean;
}

const NavButton = memo(({ direction, onClick, disabled }: NavButtonProps) => (
	<BaseButton
		onClick={onClick}
		disabled={disabled}
		variant="ghost"
		size="lg"
		className="shadow-lg"
	>
		{direction === "left" ? (
			<LuChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
		) : (
			<LuChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
		)}
	</BaseButton>
));

NavButton.displayName = "NavButton";

// Control Panel Component
interface ControlPanelProps {
	children: React.ReactNode;
	title?: string;
	className?: string;
}

const ControlPanel = memo(
	({ children, title, className = "" }: ControlPanelProps) => (
		<div
			className={`
		relative overflow-hidden rounded-xl border border-[#1C1E23]/60 
		bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 
		backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)]
		${className}
	`}
		>
			{/* Subtle radial glow */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />

			{/* Top border highlight */}
			<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

			<div className="relative z-10 p-4">
				{title && (
					<div className="mb-3 flex items-center gap-2">
						<span className="font-outfit text-xs font-medium tracking-wider text-[#818181] uppercase">
							{title}
						</span>
					</div>
				)}
				{children}
			</div>
		</div>
	),
);

ControlPanel.displayName = "ControlPanel";

// Mode Toggle Component
interface ModeToggleProps {
	viewMode: "scene" | "box";
	onToggle: () => void;
}

const ModeToggle = memo(({ viewMode, onToggle }: ModeToggleProps) => (
	<BaseButton
		onClick={onToggle}
		variant="primary"
		size="lg"
		className="px-6 w-auto shadow-lg"
	>
		<div className="flex items-center gap-2">
			{viewMode === "scene" ? (
				<>
					<LuBox className="w-4 h-4" />
					<span className="font-outfit text-sm font-medium tracking-wide">
						BOX MODE
					</span>
				</>
			) : (
				<>
					<LuEye className="w-4 h-4" />
					<span className="font-outfit text-sm font-medium tracking-wide">
						SCENE MODE
					</span>
				</>
			)}
		</div>
	</BaseButton>
));

ModeToggle.displayName = "ModeToggle";

// Structure Indicator Component
interface StructureIndicatorProps {
	structures: Array<{ pair: string; name: string }>;
	activeIndex: number;
	onSelect: (index: number) => void;
}

const StructureIndicator = memo(
	({ structures, activeIndex, onSelect }: StructureIndicatorProps) => (
		<ControlPanel className="px-6 py-3">
			<div className="flex items-center gap-4">
				{/* Current structure info */}
				<div className="flex items-center gap-3">
					<span className="font-outfit text-lg font-bold text-[#24FF66] tracking-wide">
						{structures[activeIndex].pair}
					</span>
					<span className="font-outfit text-sm text-white/60">
						{structures[activeIndex].name}
					</span>
				</div>

				{/* Dot indicators */}
				<div className="flex gap-2">
					{structures.map((structure, index) => (
						<button
							key={structure.pair}
							type="button"
							onClick={() => onSelect(index)}
							className={`
							w-2 h-2 rounded-full transition-all duration-300
							${
								index === activeIndex
									? "bg-[#24FF66] shadow-[0_0_8px_rgba(36,255,102,0.6)] scale-125"
									: "bg-white/20 hover:bg-white/40 hover:scale-110"
							}
						`}
						/>
					))}
				</div>
			</div>
		</ControlPanel>
	),
);

StructureIndicator.displayName = "StructureIndicator";

// Helper functions matching BoxSection exactly
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
}

const Box3D = memo(
	({
		box,
		boxColors,
		pair,
		absolutePosition,
		dimensions,
		isOuterMost,
	}: Box3DProps) => {
		const meshRef = useRef<THREE.Mesh>(null);

		const baseColor = new THREE.Color(
			box.value > 0 ? boxColors.positive : boxColors.negative,
		);

		return (
			<group position={absolutePosition}>
				<mesh
					ref={meshRef}
					scale={[dimensions.size, dimensions.size, dimensions.size]}
					castShadow
					receiveShadow
				>
					<boxGeometry />
					<meshPhysicalMaterial
						color={baseColor}
						transparent={false}
						opacity={1}
						metalness={0.3}
						side={THREE.FrontSide}
						depthWrite={true}
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
}

const BoxStructure = memo(
	({ slice, boxColors, pair, centerPosition }: BoxStructureProps) => {
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
			const baseSize = 8; // Smaller base size for multiple structures

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
				{sortedBoxes.map((box) => {
					const data = calculatedPositionsAndDimensions.get(box.originalIndex);
					if (!data) return null;
					const { absolutePosition, dimensions } = data;

					return (
						<Box3D
							key={`${pair}-${box.originalIndex}`}
							box={box}
							boxColors={boxColors}
							pair={pair}
							absolutePosition={absolutePosition}
							dimensions={dimensions}
							isOuterMost={false}
						/>
					);
				})}

				{/* Label for this structure */}
				<Text
					position={[
						centerPosition[0],
						centerPosition[1] - 7,
						centerPosition[2],
					]}
					fontSize={1}
					color="#24FF66"
					anchorX="center"
					anchorY="middle"
				>
					{pair}
				</Text>
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
}

const AnimatedStructure = memo(
	({
		structure,
		slice,
		boxColors,
		rotation,
		isFocused,
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
		const scenePosition = useRef(new THREE.Vector3(0, 0, 60));
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
}

export const ResoBox3DCircular = memo(
	({ slice, className = "", boxColors }: ResoBox3DCircularProps) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const [focusedIndex, setFocusedIndex] = useState(0);
		const [viewMode, setViewMode] = useState<"scene" | "box">("scene");
		const [isTransitioning, setIsTransitioning] = useState(false);
		const [isTradingPanelOpen, setIsTradingPanelOpen] = useState(false);

		const [savedCameraPosition, setSavedCameraPosition] = useState<
			[number, number, number]
		>([0, 0, 60]);

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
		}, [calculatePositions]);

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
				className={`relative h-full w-full  ${className}`}
			>
				<Canvas
					camera={{
						position: [0, 0, 60],
						fov: 50,
					}}
					resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
					dpr={1}
				>
					<ambientLight intensity={1} />
					<directionalLight position={[10, 10, 100]} intensity={1} />

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

						if (!shouldShowStructure) return null;

						return (
							<AnimatedStructure
								key={structure.pair}
								structure={structure}
								slice={structureSlices[index]}
								boxColors={boxColors}
								rotation={undefined}
								isFocused={isFocused}
							/>
						);
					})}
				</Canvas>

				{/* View Mode Toggle - Above bottom section */}
				<div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50">
					<ModeToggle viewMode={viewMode} onToggle={toggleViewMode} />
				</div>

				{/* Navigation Controls */}
				<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-30">
					{viewMode === "scene" && (
						<>
							<NavButton direction="left" onClick={handlePrevious} />
							<StructureIndicator
								structures={cryptoStructures}
								activeIndex={actualFocusedIndex}
								onSelect={setFocusedIndex}
							/>
							<NavButton direction="right" onClick={handleNext} />
							<BaseButton
								onClick={() => setIsTradingPanelOpen(true)}
								variant="ghost"
								size="md"
								className="ml-4"
							>
								<LuInfo className="w-4 h-4" />
							</BaseButton>
						</>
					)}

					{/* Box Mode Controls */}
					{viewMode === "box" && (
						<div className="flex items-center gap-4">
							{/* Current structure in box mode */}
							<StructureIndicator
								structures={cryptoStructures}
								activeIndex={actualFocusedIndex}
								onSelect={setFocusedIndex}
							/>

							{/* Trading Panel Toggle */}
							<BaseButton
								onClick={() => setIsTradingPanelOpen(!isTradingPanelOpen)}
								variant={isTradingPanelOpen ? "primary" : "ghost"}
								size="md"
								className="ml-4"
							>
								<LuBarChart3 className="w-4 h-4" />
							</BaseButton>
						</div>
					)}
				</div>

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
