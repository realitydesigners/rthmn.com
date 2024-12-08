'use client';
import { useRef, useCallback } from 'react';
import { useSceneConfig } from './config';
import { useSceneManager } from '@/hooks/useSceneManager';
import Spline from '@splinetool/react-spline';
import { AnimatePresence } from 'framer-motion';
import type { SPEObject } from '@splinetool/runtime';
import { SCENE_STATES } from './config';

type SplineRef = {
  findObjectByName: (name: string) => SPEObject;
} | null;

interface SplineEventTarget {
  name: string;
  id: string;
}

type SplineMouseEvent = CustomEvent & {
  target: SplineEventTarget;
};

export default function App() {
  const splineRef = useRef<SplineRef>(null);
  const sceneObjects = useSceneConfig(splineRef);
  const visibility = useSceneManager(splineRef, sceneObjects);
  const finalSceneObjects = useSceneConfig(splineRef, visibility);

  const handleStateChange = useCallback(
    (stateId: string, source: 'button' | 'scene') => {
      const state = SCENE_STATES[stateId];
      if (!state || !splineRef.current) return;

      if (source === 'button') {
        try {
          const button = splineRef.current.findObjectByName(state.buttonName);
          button?.emitEvent('mouseDown');
        } catch (error) {
          console.warn('Failed to emit event:', error);
        }
      }
    },
    []
  );

  const onLoad = useCallback(
    (spline: any) => {
      if (!spline) return;
      splineRef.current = spline;

      const handleMouseDown = (e: Event) => {
        const splineEvent = e as SplineMouseEvent;
        const stateId =
          splineEvent.target.name.charAt(0).toLowerCase() +
          splineEvent.target.name.slice(1);

        if (SCENE_STATES[stateId]) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Transitioning to ${stateId}`);
          }
          handleStateChange(stateId, 'scene');
        }
      };

      spline.addEventListener('mouseDown', handleMouseDown);
      return () => spline.removeEventListener('mouseDown', handleMouseDown);
    },
    [handleStateChange]
  );

  return (
    <main className="fixed inset-0 flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <Spline
          scene="https://prod.spline.design/WpLSES6seOFsIOi1/scene.splinecode"
          onLoad={onLoad}
        />
      </div>
      <div className="fixed right-4 bottom-4 z-10 flex flex-col gap-2">
        {Object.values(SCENE_STATES).map((state) => (
          <button
            key={state.id}
            onClick={() => handleStateChange(state.id, 'button')}
            className="rounded bg-blue-500 px-4 py-2 text-white"
            aria-label={`Trigger ${state.id}`}
          >
            {state.id}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {finalSceneObjects.map((obj) => (
          <div key={obj.id}>{obj.component}</div>
        ))}
      </AnimatePresence>
    </main>
  );
}
