import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { memo, useEffect, useState } from "react";
import * as THREE from "three";
import { lerp } from "./mathUtils";

interface CameraControllerProps {
	viewMode: "scene" | "box";
	scrollProgress: number;
	introMode: boolean;
	isClient: boolean;
	cameraDistance?: MotionValue<number>;
}

export const CameraController = memo(
	({
		viewMode,
		scrollProgress,
		introMode,
		isClient,
		cameraDistance,
	}: CameraControllerProps) => {
		const { camera, gl } = useThree();
		const [isInitialized, setIsInitialized] = useState(false);
		const [currentCameraDistance, setCurrentCameraDistance] = useState(() => {
			return cameraDistance ? cameraDistance.get() : 1;
		});

		// Subscribe to camera distance changes
		useEffect(() => {
			if (!cameraDistance) return;

			setCurrentCameraDistance(cameraDistance.get());
			const unsubscribe = cameraDistance.onChange(setCurrentCameraDistance);
			return unsubscribe;
		}, [cameraDistance]);

		// Initialize canvas
		useEffect(() => {
			if (!isClient || isInitialized) return;

			const canvas = gl.domElement;
			Object.assign(canvas.style, {
				position: "absolute",
				top: "0",
				left: "0",
				width: "100vw",
				height: "100vh",
			});

			gl.setSize(window.innerWidth, window.innerHeight);

			if (camera instanceof THREE.PerspectiveCamera) {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
			}

			// Set initial camera position without conflicts
			camera.position.set(0, 0, 70);

			setIsInitialized(true);
		}, [isClient, gl, camera, isInitialized]);

		useFrame(() => {
			if (!isClient || !isInitialized) return;

			const baseDistance = 70;
			let targetDistance = baseDistance;

			// Mobile-responsive scroll threshold and lerp factor
			const isMobile =
				typeof window !== "undefined" &&
				(window.innerWidth < 1024 || "ontouchstart" in window);
			const scrollThreshold = isMobile ? 0.12 : 0.15;
			const lerpFactor = isMobile ? 0.35 : 0.25; // Faster on mobile for better touch responsiveness

			// Handle camera distance for zooming in scene mode
			if (cameraDistance && viewMode === "scene") {
				if (scrollProgress >= scrollThreshold) {
					// Apply scaling when scrolled down
					targetDistance = baseDistance / currentCameraDistance;
				} else {
					// Return to original distance when scrolled back up
					targetDistance = baseDistance;
				}
			} else if (viewMode === "box") {
				// In box mode, keep the same distance as ZenMode focus mode
				// The OrbitControls target will handle the proper viewing angle
				targetDistance = baseDistance;
			}

			// Smooth camera position changes with device-optimized lerp factor
			camera.position.setZ(lerp(camera.position.z, targetDistance, lerpFactor));
		});

		return null;
	},
);

CameraController.displayName = "CameraController";
