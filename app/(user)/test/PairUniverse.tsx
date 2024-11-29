'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef, useState, useEffect } from 'react';

interface PairUniverseProps {
  selectedPairs: string[];
}

interface Position3D {
  x: number;
  y: number;
  z: number;
}

export default function PairUniverse({ selectedPairs }: PairUniverseProps) {
  const splineRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [previousPairs, setPreviousPairs] = useState<string[]>([]);

  const calculatePosition = (index: number): Position3D => {
    const spacing = 400;
    return {
      x: (index - 1) * spacing,
      y: 0,
      z: 0
    };
  };

  const moveObject = (object: any, position: Position3D, visible: boolean) => {
    try {
      // Set position
      object.position.x = position.x;
      object.position.y = position.y;
      object.position.z = position.z;

      // Set scale based on visibility
      object.scale.x = visible ? 1 : 0;
      object.scale.y = visible ? 1 : 0;
      object.scale.z = visible ? 1 : 0;

      // Only rotate if visible
      if (visible) {
        object.rotation.y = Math.PI * 0.1;
      }
    } catch (error) {
      console.error('Error moving object:', error);
    }
  };

  const updatePositions = (spline: any) => {
    if (!spline) return;

    const objects = spline.getAllObjects();

    // Handle removed pairs
    previousPairs.forEach((pair) => {
      if (!selectedPairs.includes(pair)) {
        const object = objects.find((obj) => obj.name === pair);
        if (object) {
          moveObject(object, { x: 0, y: 0, z: 0 }, false);
          console.log(`Scaled down removed pair: ${pair}`);
        }
      }
    });

    // Handle current pairs
    selectedPairs.forEach((pair, index) => {
      const object = objects.find((obj) => obj.name === pair);
      if (object) {
        try {
          const position = calculatePosition(index);
          moveObject(object, position, true);
          console.log(`Positioned ${pair} at:`, position);
        } catch (error) {
          console.error(`Failed to position ${pair}:`, error);
        }
      }
    });

    // Update previous pairs for next comparison
    setPreviousPairs(selectedPairs);
  };

  useEffect(() => {
    if (sceneLoaded && splineRef.current) {
      updatePositions(splineRef.current);
    }
  }, [selectedPairs, sceneLoaded]);

  const onLoad = (spline: any) => {
    try {
      splineRef.current = spline;

      // Set up camera for side view
      const camera = spline.findObjectByName('Camera');
      if (camera) {
        camera.position.x = 0;
        camera.position.y = 500;
        camera.position.z = 1500;
        camera.rotation.x = -0.3;
        camera.rotation.y = 0;
        camera.rotation.z = 0;
      }

      setSceneLoaded(true);
      setIsLoading(false);

      if (selectedPairs.length) {
        updatePositions(spline);
      }
    } catch (error) {
      console.error('Error in onLoad:', error);
      setIsLoading(false);
    }
  };

  return (
    <Spline
      className="h-full w-full"
      scene="https://prod.spline.design/cV1oOhbcJ9pajG3g/scene.splinecode"
      onLoad={onLoad}
    />
  );
}
