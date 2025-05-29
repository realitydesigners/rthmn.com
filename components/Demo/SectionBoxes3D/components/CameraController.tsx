import { memo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { lerp } from "../utils/mathUtils";

interface CameraControllerProps {
	viewMode: "scene" | "box";
	isTransitioning: boolean;
	setIsTransitioning: (value: boolean) => void;
	focusedPosition: [number, number, number];
	scrollProgress: number;
	introMode: boolean;
	isClient: boolean;
	cameraDistance?: MotionValue<number>;
}

export const CameraController = memo(
	({
		viewMode,
		isTransitioning,
		setIsTransitioning,
		focusedPosition,
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

			if (cameraDistance && scrollProgress >= 0.25) {
				const baseDistance = 70;
				const initialDistance = baseDistance / currentCameraDistance;
				camera.position.setZ(initialDistance);
			}

			setIsInitialized(true);
		}, [
			isClient,
			gl,
			camera,
			isInitialized,
			cameraDistance,
			scrollProgress,
			currentCameraDistance,
		]);

		useFrame(() => {
			if (!isClient || !isInitialized) return;

			// Handle camera distance for zooming
			if (cameraDistance && scrollProgress >= 0.25) {
				const baseDistance = 70;
				const targetDistance = baseDistance / currentCameraDistance;
				camera.position.setZ(targetDistance);
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
