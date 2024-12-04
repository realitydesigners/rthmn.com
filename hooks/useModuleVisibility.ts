import { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface ModuleVisibilityOptions {
  objectName: string; // Name of the object to track (e.g., 'BoxSection')
  threshold?: number; // Distance threshold for visibility
  debug?: boolean; // Whether to log position updates
  updateInterval?: number; // How often to check position (in ms)
}

export const useModuleVisibility = (
  splineRef: React.MutableRefObject<any>,
  options: ModuleVisibilityOptions
) => {
  const {
    objectName,
    threshold = 1100,
    debug = false,
    updateInterval = 100
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const lastYPosition = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Function to calculate distance between two 3D points
  const calculateDistance = (pos1: Position, pos2: Position) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // Function to check camera distance from target object
  const checkCameraDistance = (spline: any) => {
    const targetObject = spline.findObjectByName(objectName);
    const camera = spline.findObjectByName('Camera');

    if (targetObject && camera) {
      const distance = calculateDistance(
        camera.position,
        targetObject.position
      );

      // Log position updates if debug is enabled
      if (debug && Math.abs(camera.position.y - lastYPosition.current) > 0.1) {
        console.log(`${objectName} Update:`, {
          currentY: Math.round(camera.position.y),
          objectY: Math.round(targetObject.position.y),
          distance: Math.round(distance),
          distanceToObject: Math.round(
            Math.abs(camera.position.y - targetObject.position.y)
          )
        });
        lastYPosition.current = camera.position.y;
      }

      setIsVisible(distance < threshold);
    }
  };

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval for continuous checking
    intervalRef.current = setInterval(() => {
      if (splineRef.current) {
        checkCameraDistance(splineRef.current);
      }
    }, updateInterval);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [objectName, threshold, updateInterval]);

  // Set up camera movement listener
  useEffect(() => {
    const spline = splineRef.current;
    if (!spline) return;

    // Initial check
    checkCameraDistance(spline);

    // Add event listener for camera movement
    spline.addEventListener('cameraMove', () => {
      checkCameraDistance(spline);
    });
  }, [objectName, threshold]);

  return isVisible;
};
