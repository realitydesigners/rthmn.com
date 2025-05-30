import type { BoxColors } from "@/stores/colorStore";
import type { BoxSlice } from "@/types/types";
import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import * as THREE from "three";
import {
	type BoxDimensions,
	easeInOutCubic,
	generateScatteredPosition,
	getBoxDimensions,
	getCornerPosition,
	lerp,
} from "./mathUtils";

export const BoxStructure = memo(
	({
		slice,
		pair,
		structure,
		scatteredPositions,
		formationProgress = 1,
		isFocused = false,
	}: {
		slice: BoxSlice;
		pair: string;
		structure: {
			position: [number, number, number];
			scale: number;
			opacity: number;
			rotation?: [number, number, number];
		};
		scatteredPositions?: Map<number, [number, number, number]>;
		formationProgress?: number;
		isFocused?: boolean;
	}) => {
		const groupRef = useRef<THREE.Group>(null);

		// Calculate box positions and dimensions
		const calculatedData = useMemo(() => {
			const sortedBoxes = slice.boxes
				.map((box, i) => ({ ...box, originalIndex: i }))
				.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

			const positions = new Map<
				number,
				{
					absolutePosition: [number, number, number];
					dimensions: BoxDimensions;
				}
			>();

			sortedBoxes.forEach((box, index) => {
				const currentDimensions = getBoxDimensions(index, 12);
				let calculatedPosition: [number, number, number] = [0, 0, 0];

				if (index > 0) {
					const prevBox = sortedBoxes[index - 1];
					const prevData = positions.get(prevBox.originalIndex);

					if (prevData) {
						const [offsetX, offsetY, offsetZ] = getCornerPosition(
							currentDimensions,
							prevData.dimensions,
							box.value > 0 === prevBox.value > 0
								? box.value > 0
								: prevBox.value > 0,
						);

						const epsilon = isFocused ? 0.005 : 0.01;
						const magnitude = Math.sqrt(
							offsetX ** 2 + offsetY ** 2 + offsetZ ** 2,
						);

						if (magnitude > 0) {
							const normalizedOffset = [offsetX, offsetY, offsetZ].map(
								(offset) => (offset / magnitude) * epsilon,
							) as [number, number, number];

							calculatedPosition = [
								prevData.absolutePosition[0] + offsetX + normalizedOffset[0],
								prevData.absolutePosition[1] + offsetY + normalizedOffset[1],
								prevData.absolutePosition[2] + offsetZ + normalizedOffset[2],
							];
						}
					}
				}

				positions.set(box.originalIndex, {
					absolutePosition: calculatedPosition,
					dimensions: currentDimensions,
				});
			});

			return { sortedBoxes, positions };
		}, [slice.boxes, isFocused]);

		// Handle structure-level animation (position, scale)
		useFrame(() => {
			if (!groupRef.current) return;

			const { position, scale, rotation } = structure;
			const current = groupRef.current;
			const lerpFactor = 0.08;

			current.position.x = lerp(current.position.x, position[0], lerpFactor);
			current.position.y = lerp(current.position.y, position[1], lerpFactor);
			current.position.z = lerp(current.position.z, position[2], lerpFactor);
			current.scale.setScalar(lerp(current.scale.x, scale, lerpFactor));

			// Apply rotation if provided
			if (rotation) {
				current.rotation.x = lerp(current.rotation.x, rotation[0], lerpFactor);
				current.rotation.y = lerp(current.rotation.y, rotation[1], lerpFactor);
				current.rotation.z = lerp(current.rotation.z, rotation[2], lerpFactor);
			} else {
				// Return to default rotation when not in box mode
				current.rotation.x = lerp(current.rotation.x, 0, lerpFactor);
				current.rotation.y = lerp(current.rotation.y, 0, lerpFactor);
				current.rotation.z = lerp(current.rotation.z, 0, lerpFactor);
			}
		});

		return (
			<group ref={groupRef}>
				{calculatedData.sortedBoxes.map((box, index) => {
					const data = calculatedData.positions.get(box.originalIndex);
					if (!data) return null;

					// Handle scattered positions for intro animation
					let scatteredPos = scatteredPositions?.get(box.originalIndex);
					if (!scatteredPos && scatteredPositions) {
						scatteredPos = generateScatteredPosition();
						scatteredPositions.set(box.originalIndex, scatteredPos);
					}

					return (
						<BoxMesh
							key={`${pair}-${box.originalIndex}`}
							box={box}
							absolutePosition={data.absolutePosition}
							dimensions={data.dimensions}
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

// Individual box mesh component (inlined)
const BoxMesh = memo(
	({
		box,
		absolutePosition,
		dimensions,
		scatteredPosition,
		formationProgress = 1,
		animationDelay = 0,
	}: {
		box: { value: number; originalIndex: number };
		absolutePosition: [number, number, number];
		dimensions: BoxDimensions;
		scatteredPosition?: [number, number, number];
		formationProgress?: number;
		animationDelay?: number;
	}) => {
		const meshRef = useRef<THREE.Group>(null);

		const boxColors: BoxColors = {
			positive: "#24FF66",
			negative: "#303238",
		};
		const color = box.value > 0 ? boxColors.positive : boxColors.negative;

		useFrame(() => {
			if (!meshRef.current || !scatteredPosition) return;

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
			meshRef.current.position.set(pos[0], pos[1], pos[2]);
		});

		return (
			<group
				ref={meshRef}
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

BoxStructure.displayName = "BoxStructure";
BoxMesh.displayName = "BoxMesh";
