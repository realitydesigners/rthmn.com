import { useRef, useEffect, useState, ReactNode } from 'react';
import { useSuppressSplineError } from './useSupressSplineError';

interface SceneObject {
  id: string;
  name: string;
  scaleIn: number;
  scaleOut: number;
  fadeIn: number;
  fadeOut: number;
  component?: ReactNode;
}

interface SceneVisibility {
  [key: string]: {
    isVisible: boolean;
    distance: number;
    isScaled: boolean;
  };
}

export const useSceneManager = (
  splineRef: React.MutableRefObject<any>,
  objects: SceneObject[]
) => {
  // Suppress Spline errors
  useSuppressSplineError();

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastPositions = useRef<Record<string, number>>({});
  const originalScales = useRef<
    Record<string, { x: number; y: number; z: number }>
  >({});
  const [visibilityStates, setVisibilityStates] = useState<SceneVisibility>({});

  // Store original scales when objects are first found
  const initializeObject = (name: string, object: any) => {
    if (!originalScales.current[name]) {
      originalScales.current[name] = {
        x: object.scale.x,
        y: object.scale.y,
        z: object.scale.z
      };
    }
  };

  const calculateDistance = (pos1: any, pos2: any) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  const checkObjectDistances = (spline: any) => {
    const camera = spline.findObjectByName('Camera');
    if (!camera) return;

    const newStates: SceneVisibility = {};

    objects.forEach(({ id, name, scaleIn, scaleOut, fadeIn, fadeOut }) => {
      const object = spline.findObjectByName(name);
      if (!object) return;

      initializeObject(name, object);
      const originalScale = originalScales.current[name];
      const distance = calculateDistance(camera.position, object.position);

      // Handle Spline object scaling
      if (distance > scaleOut) {
        object.scale.set(0, 0, 0);
      } else {
        object.scale.set(originalScale.x, originalScale.y, originalScale.z);
      }

      // Handle component visibility
      newStates[id] = {
        isVisible: distance >= fadeIn && distance < fadeOut,
        distance,
        isScaled: distance < scaleOut
      };
    });

    setVisibilityStates(newStates);
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (splineRef.current) {
        checkObjectDistances(splineRef.current);
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [objects]);

  useEffect(() => {
    const spline = splineRef.current;
    if (!spline) return;

    checkObjectDistances(spline);

    spline.addEventListener('cameraMove', () => {
      checkObjectDistances(spline);
    });
  }, [objects]);

  return visibilityStates;
};
