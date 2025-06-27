import { useUser } from "@/providers/UserProvider";
import type { BoxColors } from "@/stores/colorStore";
import type { BoxSlice } from "@/types/types";
import { useTimeframeStore } from "@/stores/timeframeStore";
import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef, useCallback } from "react";
import * as THREE from "three";
import {
  type BoxDimensions,
  easeInOutCubic,
  generateScatteredPosition,
  getBoxDimensions,
  getCornerPosition,
  lerp,
} from "../Demo/SectionBoxes3D/mathUtils";

export const DashboardBoxStructure = memo(
  ({
    slice,
    pair,
    structure,
    scatteredPositions,
    formationProgress = 1,
    isFocused = false,
    boxColors: propBoxColors,
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
    boxColors?: BoxColors;
  }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { boxColors: userBoxColors } = useUser();

    // Merge boxColors similar to ResoBox3D
    const mergedBoxColors = useMemo(() => {
      if (!propBoxColors) return userBoxColors;
      return {
        ...userBoxColors,
        ...propBoxColors,
        styles: {
          ...userBoxColors.styles,
          ...propBoxColors.styles,
        },
      };
    }, [propBoxColors, userBoxColors]);

    // Get timeframe settings for this pair
    const settings = useTimeframeStore(
      useCallback(
        (state) =>
          pair ? state.getSettingsForPair(pair) : state.global.settings,
        [pair]
      )
    );

    // Filter boxes based on timeframe settings
    const filteredSlice = useMemo(() => {
      if (!slice?.boxes) return slice;
      return {
        ...slice,
        boxes:
          slice.boxes.slice(
            settings.startIndex,
            settings.startIndex + settings.maxBoxCount
          ) || [],
      };
    }, [slice, settings.startIndex, settings.maxBoxCount]);

    // Calculate box positions and dimensions
    const calculatedData = useMemo(() => {
      const sortedBoxes = filteredSlice.boxes
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
                : prevBox.value > 0
            );

            const epsilon = isFocused ? 0.005 : 0.01;
            const magnitude = Math.sqrt(
              offsetX ** 2 + offsetY ** 2 + offsetZ ** 2
            );

            if (magnitude > 0) {
              const normalizedOffset = [offsetX, offsetY, offsetZ].map(
                (offset) => (offset / magnitude) * epsilon
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
    }, [filteredSlice.boxes, isFocused]);

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
        // Return to default rotation when not in focus mode
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
            <DashboardBoxMesh
              key={`${pair}-${box.originalIndex}`}
              box={box}
              absolutePosition={data.absolutePosition}
              dimensions={data.dimensions}
              scatteredPosition={scatteredPos}
              formationProgress={formationProgress}
              animationDelay={index * 0.1}
              boxColors={mergedBoxColors}
              isFocused={isFocused}
              pair={pair}
            />
          );
        })}
      </group>
    );
  }
);

// Individual dashboard box mesh component with trading-specific features
const DashboardBoxMesh = memo(
  ({
    box,
    absolutePosition,
    dimensions,
    scatteredPosition,
    formationProgress = 1,
    animationDelay = 0,
    boxColors,
    isFocused = false,
    pair,
  }: {
    box: { value: number; originalIndex: number };
    absolutePosition: [number, number, number];
    dimensions: BoxDimensions;
    scatteredPosition?: [number, number, number];
    formationProgress?: number;
    animationDelay?: number;
    boxColors?: BoxColors;
    isFocused?: boolean;
    pair: string;
  }) => {
    const meshRef = useRef<THREE.Group>(null);

    // Use user's color preferences or fallback to defaults
    const colors = {
      positive: boxColors?.positive || "#E2E8F0",
      negative: boxColors?.negative || "#2D3748",
    };

    const color = box.value > 0 ? colors.positive : colors.negative;

    useFrame(() => {
      if (!meshRef.current || !scatteredPosition) return;

      const delayedProgress = Math.max(
        0,
        Math.min(1, (formationProgress - animationDelay) / (1 - animationDelay))
      );
      const easedProgress = easeInOutCubic(delayedProgress);

      const pos = scatteredPosition.map((start, i) =>
        lerp(start, absolutePosition[i], easedProgress)
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
            transparent={false}
            opacity={1}
            metalness={0.3}
            side={THREE.FrontSide}
            depthWrite={true}
          />
          <Edges
            scale={1.001}
            threshold={15}
            color={new THREE.Color(color).multiplyScalar(0.1)}
          />
        </mesh>

        {/* Future enhancement: Add floating price/volume indicators */}
        {isFocused && (
          <group position={[0, dimensions.size[1] + 0.5, 0]}>
            {/* This is where we could add floating text or indicators */}
            {/* For now, just a subtle glow effect */}
            <mesh>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
          </group>
        )}
      </group>
    );
  }
);

DashboardBoxStructure.displayName = "DashboardBoxStructure";
DashboardBoxMesh.displayName = "DashboardBoxMesh";
