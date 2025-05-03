'use client';

import { useUser } from '@/providers/UserProvider';
import type { BoxColors } from '@/stores/colorStore';
import type { Box, BoxSlice } from '@/types/types';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line, Edges } from '@react-three/drei';
import * as THREE from 'three';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

// Helper functions matching BoxSection exactly
interface BoxDimensions {
    size: number;
    scale: number;
    // Remove position as it's calculated globally
}

const calculateBoxDimensions = (index: number, baseSize: number): BoxDimensions => {
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
    isUp: boolean
): [number, number, number] => {
    const parentHalfSize = parentBoxDimensions.size / 2;
    const currentHalfSize = currentBoxDimensions.size / 2;

    const xOffset = parentHalfSize - currentHalfSize;
    const zOffset = parentHalfSize - currentHalfSize;
    const yOffset = isUp ? parentHalfSize - currentHalfSize : -(parentHalfSize - currentHalfSize);

    return [xOffset, yOffset, zOffset];
};

// Reference lines component
const OriginLines = () => {
    const lineLength = 30;
    return (
        <group>
            {/* X axis - red */}
            <Line
                points={[
                    [0, 0, 0],
                    [lineLength, 0, 0],
                ]}
                color='#333333'
                lineWidth={1}
            />
            {/* Y axis - green */}
            <Line
                points={[
                    [0, 0, 0],
                    [0, lineLength, 0],
                ]}
                color='#333333'
                lineWidth={1}
            />
            {/* Z axis - blue */}
            <Line
                points={[
                    [0, 0, 0],
                    [0, 0, lineLength],
                ]}
                color='#333333'
                lineWidth={1}
            />
        </group>
    );
};

// 3D Box Component - Updated Props
interface Box3DProps {
    box: Box;
    boxColors: BoxColors;
    pair: string;
    absolutePosition: [number, number, number];
    dimensions: BoxDimensions; // Pass calculated dimensions
    isOuterMost: boolean;
}

const Box3D = memo(({ box, boxColors, pair, absolutePosition, dimensions, isOuterMost }: Box3DProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const baseColor = new THREE.Color(box.value > 0 ? boxColors.positive : boxColors.negative);

    // Use passed props directly
    return (
        <group position={absolutePosition}>
            <mesh ref={meshRef} scale={[dimensions.size, dimensions.size, dimensions.size]} castShadow receiveShadow>
                <boxGeometry />
                <meshPhysicalMaterial
                    color={baseColor}
                    transparent={false}
                    opacity={1}
                    metalness={0.3}
                    side={THREE.FrontSide}
                    depthWrite={true}
                />
                {/* Add subtle darker edges for definition */}
                <Edges
                    scale={1.001} // Avoid z-fighting with the box face
                    threshold={15} // Default angle threshold
                    color={baseColor.clone().multiplyScalar(0.1)} // Slightly darker than base
                />
            </mesh>
        </group>
    );
});

// Helper hook for box colors
interface ResoBox3DProps {
    slice: BoxSlice;
    className?: string;
    pair?: string;
    boxColors?: BoxColors;
}

// Main ResoBox3D component
export const ResoBox3D = memo(({ slice, className = '', pair = '', boxColors: propBoxColors }: ResoBox3DProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(0);
    const { boxColors: userBoxColors } = useUser();

    // Merge boxColors
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

    // Handle resize
    useEffect(() => {
        if (!containerRef.current) return;
        const element = containerRef.current;
        const observer = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const rect = entries[0].contentRect;
            setContainerSize(Math.min(rect.width, rect.height)); // Keep for potential future use
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Prepare sorted boxes with original index
    const sortedBoxes = useMemo(
        () =>
            slice.boxes
                .map((box, i) => ({ ...box, originalIndex: i }))
                .sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
        [slice.boxes]
    );

    // Calculate all absolute positions and dimensions
    const calculatedPositionsAndDimensions = useMemo(() => {
        const positions = new Map<number, { absolutePosition: [number, number, number]; dimensions: BoxDimensions }>();
        const baseSize = 12; // Consistent base size for calculations

        sortedBoxes.forEach((box, index) => {
            const currentDimensions = calculateBoxDimensions(index, baseSize);
            let calculatedPosition: [number, number, number] = [0, 0, 0];
            const currentSignPositive = box.value > 0;

            if (index === 0) {
                // The first box is always at the origin
                calculatedPosition = [0, 0, 0];
            } else {
                const prevSortedBox = sortedBoxes[index - 1];
                const prevSortedBoxData = positions.get(prevSortedBox.originalIndex);

                if (prevSortedBoxData) {
                    const parentPosition = prevSortedBoxData.absolutePosition;
                    const parentDimensions = prevSortedBoxData.dimensions;
                    const prevSignPositive = prevSortedBox.value > 0;

                    // Determine the sign to use for positioning:
                    // If signs match, use the current sign.
                    // If signs differ, use the *previous* sign to maintain corner orientation.
                    const positionSignPositive =
                        currentSignPositive === prevSignPositive ? currentSignPositive : prevSignPositive;

                    const [offsetX, offsetY, offsetZ] = calculateCornerPosition(
                        currentDimensions,
                        parentDimensions,
                        positionSignPositive // Use the determined sign for positioning
                    );

                    // Initial position calculation (corner inside parent)
                    const initialPosition: [number, number, number] = [
                        parentPosition[0] + offsetX,
                        parentPosition[1] + offsetY,
                        parentPosition[2] + offsetZ,
                    ];

                    // Calculate outwards offset to prevent Z-fighting
                    const epsilon = 0.005;
                    const offsetVector: [number, number, number] = [offsetX, offsetY, offsetZ];
                    const magnitude = Math.sqrt(offsetVector[0] ** 2 + offsetVector[1] ** 2 + offsetVector[2] ** 2);

                    if (magnitude > 0) {
                        const normalizedOffset: [number, number, number] = [
                            (offsetVector[0] / magnitude) * epsilon,
                            (offsetVector[1] / magnitude) * epsilon,
                            (offsetVector[2] / magnitude) * epsilon,
                        ];
                        // Add the small outward offset to the initial position
                        calculatedPosition = [
                            initialPosition[0] + normalizedOffset[0],
                            initialPosition[1] + normalizedOffset[1],
                            initialPosition[2] + normalizedOffset[2],
                        ];
                    } else {
                        // If magnitude is 0 (shouldn't happen with different sized boxes), use initial position
                        calculatedPosition = initialPosition;
                    }
                } else {
                    // Fallback: Should ideally not happen if logic is correct
                    console.warn('Could not find previous box data for positioning:', prevSortedBox.originalIndex);
                    calculatedPosition = [0, 0, 0]; // Default to origin as a safety measure
                }
            }

            // Store the calculated data using the original index as the key
            positions.set(box.originalIndex, { absolutePosition: calculatedPosition, dimensions: currentDimensions });
        });

        return positions;
    }, [sortedBoxes]); // Dependency is correct now

    if (!slice?.boxes || slice.boxes.length === 0) {
        return null;
    }

    return (
        <div ref={containerRef} className={`relative aspect-square h-full w-full ${className}`}>
            <Canvas
                camera={{ position: [25, 5, 25], fov: 30 }}
                gl={{ antialias: true }}
                shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
            >
                <ambientLight intensity={1} />
                <directionalLight position={[0, 0, 60]} intensity={1} shadow-mapSize={[1024, 1024]} />

                <OrbitControls enableZoom={true} enablePan={true} maxDistance={70} minDistance={40} />
                {/* <OriginLines /> */}
                <group
                // position={[6, 6, 6]}
                >
                    {/* Render based on sorted order but use calculated pos/dims */}
                    {sortedBoxes.map((box) => {
                        const data = calculatedPositionsAndDimensions.get(box.originalIndex);
                        if (!data) return null;
                        const { absolutePosition, dimensions } = data;

                        return (
                            <Box3D
                                key={`${slice.timestamp}-${box.originalIndex}`}
                                box={box}
                                boxColors={mergedBoxColors}
                                pair={pair}
                                absolutePosition={absolutePosition}
                                dimensions={dimensions}
                                isOuterMost={false}
                            />
                        );
                    })}
                </group>
            </Canvas>
        </div>
    );
});

ResoBox3D.displayName = 'ResoBox3D';
