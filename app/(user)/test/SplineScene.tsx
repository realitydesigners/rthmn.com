'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef } from 'react';

interface BoxDimensions {
  size: number;
  scale: number;
  position: { x: number; y: number; z: number };
}

export default function App() {
  const splineRef = useRef(null);
  const cameraRef = useRef(null);

  const calculateBoxDimensions = (
    index: number,
    baseSize: number,
    scaleFactor: number
  ): BoxDimensions => {
    const scale = Math.pow(1 / scaleFactor, index);
    return {
      size: baseSize * scale,
      scale,
      position: { x: 0, y: 0, z: 0 }
    };
  };

  const calculateCornerOffset = (
    currentBox: BoxDimensions,
    parentBox: BoxDimensions,
    scaleFactor: number
  ): number => {
    // A more mathematically precise version could be:
    const cornerDistance =
      ((parentBox.size - currentBox.size) / 2 + currentBox.size / 2) *
      (1 / Math.sqrt(1.2));

    // Note: 1/sqrt(1.2) ≈ 0.913 which is very close to our 0.91

    // This suggests the scaling factor is related to the diagonal distance
    // in a cube (sqrt(2)) and the scaling relationship between nested boxes
    return cornerDistance;
  };

  const onLoad = (spline: any) => {
    splineRef.current = spline;

    // Set up camera
    const cameraObject = spline.findObjectByName('Camera');
    if (cameraObject) {
      cameraRef.current = cameraObject;
      // Position camera for a good view of the nested boxes
      cameraObject.position.x = 1200;
      cameraObject.position.y = 1200;
      cameraObject.position.z = 1200;
      cameraObject.rotation.x = -45;
      cameraObject.rotation.y = 35;
      cameraObject.rotation.z = 30;

      // Optional: Adjust camera rotation/look-at
      if (cameraObject.lookAt) {
        cameraObject.lookAt(0, 0, 0);
      }
    } else {
      console.warn('Camera not found in scene');
    }

    const greenBoxes = ['1g', '2g', '3g', '4g', '5g'];
    const scaleFactor = Math.sqrt(2);
    const baseSize = 100;

    const positionNestedBoxes = (boxNames: string[]) => {
      boxNames.forEach((name, index) => {
        const currentBox = spline.findObjectByName(name);

        if (currentBox) {
          console.log(`Found box: ${name}`, currentBox);

          try {
            // Get current box dimensions
            const currentDimensions = calculateBoxDimensions(
              index,
              baseSize,
              scaleFactor
            );

            // Apply scale
            currentBox.scale.x = currentDimensions.scale;
            currentBox.scale.y = currentDimensions.scale;
            currentBox.scale.z = currentDimensions.scale;

            if (index > 0) {
              const parentName = boxNames[index - 1];
              const parentBox = spline.findObjectByName(parentName);

              if (parentBox) {
                // Get parent box dimensions
                const parentDimensions = calculateBoxDimensions(
                  index - 1,
                  baseSize,
                  scaleFactor
                );

                // Calculate corner offset using sqrt(2) relationship
                const cornerOffset = calculateCornerOffset(
                  currentDimensions,
                  parentDimensions,
                  scaleFactor
                );

                // Position smaller box in corner of parent box
                currentBox.position.x = parentBox.position.x + cornerOffset;
                currentBox.position.y = parentBox.position.y + cornerOffset;
                currentBox.position.z = parentBox.position.z - cornerOffset;

                console.log(
                  `Box ${name} - Size: ${currentDimensions.size}, ` +
                    `Parent Size: ${parentDimensions.size}, ` +
                    `Corner Offset: ${cornerOffset}`
                );
              }
            } else {
              // First box at origin
              currentBox.position.x = 0;
              currentBox.position.y = 0;
              currentBox.position.z = 0;
            }
          } catch (error) {
            console.error(`Error manipulating box ${name}:`, error);
            console.log('Box object structure:', currentBox);
          }
        } else {
          console.warn(`Box not found: ${name}`);
        }
      });
    };

    // Position the boxes
    positionNestedBoxes(greenBoxes);
  };

  return (
    <main className="relative flex h-screen w-screen justify-center">
      <SplineScene onLoad={onLoad} />
    </main>
  );
}

interface SplineSceneProps {
  onLoad: (spline: any) => void;
}

const SplineScene = ({ onLoad }: SplineSceneProps) => {
  return (
    <Spline
      scene="https://prod.spline.design/uySf2z0l5Nclc6eZ/scene.splinecode"
      onLoad={onLoad}
    />
  );
};
