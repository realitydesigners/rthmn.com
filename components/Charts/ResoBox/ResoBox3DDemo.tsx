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
import { Canvas, useFrame } from "@react-three/fiber";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

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
}

const AnimatedStructure = memo(
	({ structure, slice, boxColors }: AnimatedStructureProps) => {
		const groupRef = useRef<THREE.Group>(null);
		const [currentPosition, setCurrentPosition] = useState(structure.position);
		const [currentScale, setCurrentScale] = useState(structure.scale);

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

		// Define the four cryptocurrency structures with individual animation states
		const cryptoStructures = useMemo(
			() => [
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
			],
			[],
		);

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
		}, [cryptoStructures]);

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
		}, [focusedIndex, cryptoStructures]);

		const handleNext = () => {
			setFocusedIndex((prev) => (prev + 1) % cryptoStructures.length);
		};

		const handlePrevious = () => {
			setFocusedIndex(
				(prev) =>
					(prev - 1 + cryptoStructures.length) % cryptoStructures.length,
			);
		};

		if (!slice?.boxes || slice.boxes.length === 0) {
			return null;
		}

		return (
			<div ref={containerRef} className={`relative h-full w-full ${className}`}>
				<Canvas
					camera={{ position: [0, 0, 60], fov: 50 }}
					gl={{ antialias: true }}
					shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
				>
					<ambientLight intensity={1} />
					<directionalLight
						position={[10, 10, 100]}
						intensity={1}
						shadow-mapSize={[2048, 2048]}
					/>

					<OrbitControls
						enableZoom={true}
						enablePan={false}
						maxDistance={80}
						minDistance={20}
						autoRotate={false}
						enableRotate={true}
					/>

					{/* Connecting lines between structures */}
					{/* <group>
						{calculatePositions.map((structure, index) => {
							const nextIndex = (index + 1) % calculatePositions.length;
							const nextStructure = calculatePositions[nextIndex];
							return (
								<Line
									key={`line-${structure.pair}-${nextStructure.pair}`}
									points={[structure.position, nextStructure.position]}
									color="#24FF66"
									lineWidth={1}
									opacity={0.2}
								/>
							);
						})}
					</group> */}

					{/* Render structures with smooth animated positioning */}
					{calculatePositions.map((structure, index) => (
						<AnimatedStructure
							key={structure.pair}
							structure={structure}
							slice={structureSlices[index]}
							boxColors={boxColors}
						/>
					))}

					{/* Central origin indicator for focused structure */}
					<mesh position={[0, -8, 0]}>
						<sphereGeometry args={[0.3]} />
						<meshBasicMaterial color="#24FF66" opacity={0.4} transparent />
					</mesh>
				</Canvas>

				{/* Navigation Controls */}
				<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-30">
					<button
						type="button"
						onClick={handlePrevious}
						className="group flex items-center justify-center w-12 h-12 bg-black/40 backdrop-blur-sm border border-[#24FF66]/30 rounded-full hover:bg-[#24FF66]/10 hover:border-[#24FF66]/60 transition-all duration-300"
					>
						<svg
							className="w-5 h-5 text-[#24FF66] group-hover:text-white transition-colors"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="Previous structure"
						>
							<title>Previous structure</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					{/* Current structure indicator */}
					<div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm border border-[#24FF66]/30 rounded-full">
						<span className="text-[#24FF66] font-mono text-sm font-bold">
							{cryptoStructures[focusedIndex].pair}
						</span>
						<span className="text-white/60 text-xs">
							{cryptoStructures[focusedIndex].name}
						</span>
					</div>

					<button
						type="button"
						onClick={handleNext}
						className="group flex items-center justify-center w-12 h-12 bg-black/40 backdrop-blur-sm border border-[#24FF66]/30 rounded-full hover:bg-[#24FF66]/10 hover:border-[#24FF66]/60 transition-all duration-300"
					>
						<svg
							className="w-5 h-5 text-[#24FF66] group-hover:text-white transition-colors"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="Next structure"
						>
							<title>Next structure</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>

				{/* Structure indicators */}
				<div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
					{cryptoStructures.map((crypto, index) => (
						<button
							type="button"
							key={crypto.pair}
							onClick={() => setFocusedIndex(index)}
							className={`w-2 h-2 rounded-full transition-all duration-300 ${
								index === focusedIndex
									? "bg-[#24FF66] shadow-[0_0_8px_rgba(36,255,102,0.6)]"
									: "bg-white/20 hover:bg-white/40"
							}`}
						/>
					))}
				</div>
			</div>
		);
	},
);

ResoBox3DCircular.displayName = "ResoBox3DCircular";
