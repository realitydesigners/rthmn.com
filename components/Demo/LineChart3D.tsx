"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useRef, useState, useMemo } from "react";
import * as THREE from "three";

// Individual rectangle section component
const RectangleSection = ({
	startX,
	endX,
	color,
}: {
	startX: number;
	endX: number;
	color: string;
}) => {
	const sectionWidth = endX - startX;
	const centerX = (startX + endX) / 2;

	const geometry = useMemo(() => {
		const geo = new THREE.BoxGeometry(sectionWidth, 2, 0.2);
		return new THREE.EdgesGeometry(geo);
	}, [sectionWidth]);

	if (sectionWidth <= 0) return null;

	return (
		<lineSegments geometry={geometry} position={[centerX, 0, 0]}>
			<lineBasicMaterial color={color} />
		</lineSegments>
	);
};

// 3D Rectangle sections with different colors
const RectangleSections = ({
	width,
	sections,
}: {
	width: number;
	sections: Array<{ startX: number; endX: number; color: string }>;
}) => {
	return (
		<>
			{sections.map((section, index) => (
				<RectangleSection
					key={index}
					startX={section.startX}
					endX={section.endX}
					color={section.color}
				/>
			))}
		</>
	);
};

// Fluid line that moves up and down
const FluidLine = ({
	time,
	onBoundaryHit,
	onProgressUpdate,
}: {
	time: number;
	onBoundaryHit: (isTop: boolean, xPosition: number) => void;
	onProgressUpdate: (currentWidth: number) => void;
}) => {
	const pointsHistoryRef = useRef<THREE.Vector3[]>([]);
	const lastBoundaryRef = useRef<"none" | "top" | "bottom">("none");
	const lastCheckedPointRef = useRef(0);
	const trimOffsetRef = useRef(0); // Track how much we've trimmed

	// Rectangle height is 2, so bounds are exactly -1 to 1
	const rectangleHeight = 2;
	const maxY = rectangleHeight / 2;
	const minY = -rectangleHeight / 2;
	const maxVisibleWidth = 20; // Fixed maximum width

	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();

		// Add new points as time progresses (preserve history)
		const timeStep = 0.1;
		// Start with enough time to create full width immediately
		const timeOffset = 20; // 20 seconds to generate 200 points (20 units width)
		const targetPoints = Math.floor((time + timeOffset) / timeStep);

		if (targetPoints <= 0) return geo;

		// Add new points if we need more
		while (
			pointsHistoryRef.current.length < targetPoints &&
			pointsHistoryRef.current.length < 1000
		) {
			const pointIndex = pointsHistoryRef.current.length;
			const pointTime = pointIndex * timeStep;

			// X position is simply the point index * spacing (no scaling needed)
			const x = pointIndex * 0.1; // Each point is 0.1 units apart

			// Generate Y position with organic movement (this gets "frozen" once created)
			const baseWave = Math.sin(pointTime * 2) * 0.7;
			const detailWave = Math.sin(pointTime * 5) * 0.2;
			const slowWave = Math.sin(pointTime * 0.8) * 0.4;

			// Add some controlled randomness that's deterministic for each point
			const noise = Math.sin(pointTime * 1.5 + pointIndex * 0.7) * 0.15;
			const noise2 = Math.cos(pointTime * 2.3 + pointIndex * 0.3) * 0.08;

			// Combine all movements and clamp to exact rectangle bounds
			let y = baseWave + detailWave + slowWave + noise + noise2;
			y = Math.max(minY, Math.min(maxY, y));

			// Store this point permanently in history
			pointsHistoryRef.current.push(new THREE.Vector3(x, y, 0));
		}

		// Calculate trimming for infinite scrolling effect
		const totalWidth = pointsHistoryRef.current.length * 0.1;
		let trimAmount = 0;

		// Start trimming as soon as we have enough points for max width
		if (totalWidth > maxVisibleWidth) {
			trimAmount = totalWidth - maxVisibleWidth;
			trimOffsetRef.current = trimAmount;
		}

		// Get visible points (sliding window - trim from left, keep right)
		const trimPointCount = Math.floor(trimAmount / 0.1);
		const visiblePoints = pointsHistoryRef.current.slice(
			trimPointCount,
			targetPoints,
		);

		// Adjust X positions to account for trimming (shift everything left)
		const adjustedPoints = visiblePoints.map((point) => {
			const adjustedX = point.x - trimAmount;
			return new THREE.Vector3(adjustedX, point.y, point.z);
		});

		// Always report full width immediately once we have enough points
		const currentWidth = Math.min(totalWidth, maxVisibleWidth);
		onProgressUpdate(maxVisibleWidth); // Always report full width

		if (adjustedPoints.length > 1) {
			geo.setFromPoints(adjustedPoints);
		}

		return geo;
	}, [time, onProgressUpdate]);

	// Check for boundary hits in useFrame (not during render)
	useFrame(() => {
		const currentPoints = pointsHistoryRef.current;
		if (currentPoints.length <= lastCheckedPointRef.current) return;

		// Check only new points since last check
		for (let i = lastCheckedPointRef.current; i < currentPoints.length; i++) {
			const point = currentPoints[i];
			const y = point.y;

			// More precise boundary detection - the line is clamped to exactly ±1
			if (y >= maxY - 0.001 && lastBoundaryRef.current !== "top") {
				lastBoundaryRef.current = "top";
				// Use adjusted X position that accounts for trimming
				onBoundaryHit(true, point.x - trimOffsetRef.current);
			} else if (y <= minY + 0.001 && lastBoundaryRef.current !== "bottom") {
				lastBoundaryRef.current = "bottom";
				// Use adjusted X position that accounts for trimming
				onBoundaryHit(false, point.x - trimOffsetRef.current);
			} else if (y < maxY - 0.05 && y > minY + 0.05) {
				// Reset boundary state when line moves away from boundaries
				// Use smaller margin to be more responsive
				if (lastBoundaryRef.current !== "none") {
					lastBoundaryRef.current = "none";
				}
			}
		}

		lastCheckedPointRef.current = currentPoints.length;
	});

	// Line thickness varies with movement intensity
	const intensity = Math.abs(Math.sin(time * 2)) + 0.5;

	return (
		<primitive
			object={
				new THREE.Line(
					geometry,
					new THREE.LineBasicMaterial({
						color: "#00ff00",
						linewidth: 2 + intensity * 3,
					}),
				)
			}
		/>
	);
};

// Animation controller component that runs inside Canvas
const AnimationController = () => {
	const [time, setTime] = useState(0);
	const [boundaryHits, setBoundaryHits] = useState<
		Array<{ x: number; isTop: boolean }>
	>([]);
	const [rectangleWidth, setRectangleWidth] = useState(20); // Start at full width
	const trimOffsetRef = useRef(0);

	useFrame((state) => {
		setTime(state.clock.elapsedTime);

		// Calculate current trim offset
		const timeStep = 0.1;
		const timeOffset = 20; // Same offset as FluidLine
		const targetPoints = Math.floor(
			(state.clock.elapsedTime + timeOffset) / timeStep,
		);
		const totalWidth = targetPoints * 0.1;
		const maxVisibleWidth = 20;

		if (totalWidth > maxVisibleWidth) {
			const newTrimOffset = totalWidth - maxVisibleWidth;
			const offsetDelta = newTrimOffset - trimOffsetRef.current;

			if (offsetDelta > 0) {
				// Trim boundary hits that have moved outside the visible window
				setBoundaryHits((prev) => {
					return prev
						.map((hit) => ({
							...hit,
							x: hit.x - offsetDelta, // Move existing hits left by the trim amount
						}))
						.filter((hit) => hit.x >= 0); // Remove hits that are now outside visible area
				});

				trimOffsetRef.current = newTrimOffset;
			}
		}
	});

	// Handle boundary hits and store their positions
	const handleBoundaryHit = (isTop: boolean, xPosition: number) => {
		setBoundaryHits((prev) => {
			// Very strict duplicate prevention
			if (prev.length > 0) {
				const lastHit = prev[prev.length - 1];
				// Don't allow same boundary type at all, or any hit within 1.0 units
				if (lastHit.isTop === isTop || Math.abs(lastHit.x - xPosition) < 1.0) {
					return prev;
				}
			}
			return [...prev, { x: xPosition, isTop }];
		});
	};

	// Handle line progress updates
	const handleProgressUpdate = (currentWidth: number) => {
		setRectangleWidth(currentWidth);
	};

	// Rectangle bounds based on actual line progress
	const currentLeftEdge = 0; // Start from 0
	const currentRightEdge = rectangleWidth;

	// Create sections based on boundary hits
	const sections = useMemo(() => {
		const result: Array<{ startX: number; endX: number; color: string }> = [];

		if (boundaryHits.length === 0) {
			return [
				{
					startX: currentLeftEdge,
					endX: currentRightEdge,
					color: "#00ff00", // Start with green (bullish)
				},
			];
		}

		let currentX = currentLeftEdge;
		let currentColor = "#00ff00"; // Start with green (bullish)

		for (let i = 0; i < boundaryHits.length; i++) {
			const hit = boundaryHits[i];

			if (hit.x > currentX) {
				result.push({
					startX: currentX,
					endX: hit.x,
					color: currentColor,
				});
			}

			// Color logic: hitting top = bullish period (green), hitting bottom = bearish period (gray)
			currentColor = hit.isTop ? "#00ff00" : "#666666";
			currentX = hit.x;
		}

		if (currentX < currentRightEdge) {
			result.push({
				startX: currentX,
				endX: currentRightEdge,
				color: currentColor,
			});
		}

		return result;
	}, [boundaryHits, currentLeftEdge, currentRightEdge]);

	return (
		<>
			<RectangleSections width={rectangleWidth} sections={sections} />
			<FluidLine
				time={time}
				onBoundaryHit={handleBoundaryHit}
				onProgressUpdate={handleProgressUpdate}
			/>
		</>
	);
};

// Main component
export const LineChart3D = () => {
	return (
		<div className="w-full h-[70vh] bg-black">
			<Canvas
				camera={{ position: [0, 2, 4], fov: 75 }}
				className="w-full h-full"
			>
				<ambientLight intensity={0.6} />
				<directionalLight position={[10, 10, 5]} intensity={1} />

				<OrbitControls
					enablePan={true}
					enableZoom={true}
					enableRotate={true}
					maxDistance={15}
					minDistance={2}
				/>

				<AnimationController />
			</Canvas>
		</div>
	);
};
