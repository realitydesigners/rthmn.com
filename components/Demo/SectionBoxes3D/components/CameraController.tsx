import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { memo, useEffect, useState } from "react";
import * as THREE from "three";
import { lerp } from "../utils/mathUtils";

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

			// Handle camera distance for zooming in scene mode
			if (cameraDistance && scrollProgress >= 0.25 && viewMode === "scene") {
				const baseDistance = 70;
				const targetDistance = baseDistance / currentCameraDistance;
				camera.position.setZ(targetDistance);
			}
		});

		return null;
	},
);

CameraController.displayName = "CameraController";
