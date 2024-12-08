import { useRef, useEffect, useState, ReactNode, useCallback } from 'react';
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

interface SplineEventTarget {
  name: string;
  id: string;
}

type SplineMouseEvent = CustomEvent & {
  target: SplineEventTarget;
};

type ButtonConfig = {
  sectionId: string;
  object: string;
  name: string;
};

export const useSceneManager = (
  splineRef: any,
  objects: SceneObject[],
  sceneStates?: Record<string, ButtonConfig>
) => {
  useSuppressSplineError();

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const originalScales = useRef<
    Record<string, { x: number; y: number; z: number }>
  >({});
  const [visibilityStates, setVisibilityStates] = useState<SceneVisibility>({});
  const [isSceneLoaded, setIsSceneLoaded] = useState(false);

  const hasHandledInitialHash = useRef(false);

  const handleStateChange = useCallback(
    (stateId: string, source: 'button' | 'scene') => {
      const state = sceneStates?.[stateId];
      if (!state || !splineRef.current) return;

      if (source === 'button') {
        try {
          const button = splineRef.current.findObjectByName(state.object);
          button?.emitEvent('mouseDown');
          window.location.hash = state.sectionId;
        } catch (error) {
          console.warn('Failed to emit event:', error);
        }
      }
    },
    [sceneStates]
  );

  const handleButtonClick = useCallback(
    (stateId: string) => {
      handleStateChange(stateId, 'button');
    },
    [handleStateChange]
  );

  const setupMouseHandlers = useCallback(
    (spline: any) => {
      const handleMouseDown = (e: Event) => {
        const splineEvent = e as SplineMouseEvent;
        const stateId =
          splineEvent.target.name.charAt(0).toLowerCase() +
          splineEvent.target.name.slice(1);

        if (sceneStates?.[stateId]) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Transitioning to ${stateId}`);
          }
          handleStateChange(stateId, 'scene');
        }
      };

      spline.addEventListener('mouseDown', handleMouseDown);
      return () => spline.removeEventListener('mouseDown', handleMouseDown);
    },
    [handleStateChange, sceneStates]
  );

  // Original distance and scaling logic...
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

      if (distance > scaleOut) {
        object.scale.set(0, 0, 0);
      } else {
        object.scale.set(originalScale.x, originalScale.y, originalScale.z);
      }

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

  const triggerSceneTransition = useCallback(() => {
    const hash = window.location.hash.slice(1);
    if (hash && sceneStates && Object.keys(sceneStates).includes(hash)) {
      setTimeout(() => {
        const button = splineRef.current?.findObjectByName(
          sceneStates[hash].object
        );
        if (button) {
          button.emitEvent('mouseDown');
        }
      }, 500);
    }
  }, [sceneStates]);

  useEffect(() => {
    const spline = splineRef.current;
    if (!spline) return;

    checkObjectDistances(spline);
    if (sceneStates) {
      setupMouseHandlers(spline);
    }
    setIsSceneLoaded(true);

    spline.addEventListener('cameraMove', () => {
      checkObjectDistances(spline);
    });
  }, [objects, setupMouseHandlers, sceneStates]);

  return {
    visibilityStates,
    handleStateChange,
    handleButtonClick,
    isSceneLoaded,
    triggerSceneTransition
  };
};
