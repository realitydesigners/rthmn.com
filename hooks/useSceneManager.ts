import { useRef, useEffect, useState, ReactNode } from 'react';

interface SceneObject {
  name: string;
  show: number;
  hide: number;
  debug?: boolean;
  component?: ReactNode;
  originalScale?: { x: number; y: number; z: number };
}

interface SceneVisibility {
  [key: string]: boolean;
}

export const useSceneManager = (
  splineRef: React.MutableRefObject<any>,
  objects: SceneObject[]
) => {
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

    objects.forEach(({ name, show, hide, debug }) => {
      const object = spline.findObjectByName(name);
      if (!object) return;

      // Initialize object's original scale if not already stored
      initializeObject(name, object);
      const originalScale = originalScales.current[name];

      const distance = calculateDistance(camera.position, object.position);

      // Debug logging
      if (
        debug &&
        Math.abs(camera.position.y - (lastPositions.current[name] || 0)) > 0.1
      ) {
        console.log(`${name} Update:`, {
          currentY: Math.round(camera.position.y),
          objectY: Math.round(object.position.y),
          distance: Math.round(distance),
          scale: object.scale
        });
        lastPositions.current[name] = camera.position.y;
      }

      // Handle object scaling
      if (distance > hide) {
        object.scale.set(0, 0, 0);
      } else {
        // Restore original scale
        object.scale.set(originalScale.x, originalScale.y, originalScale.z);
      }

      // Update visibility state
      newStates[name] = distance < show;
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
