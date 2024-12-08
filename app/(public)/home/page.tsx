'use client';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useSceneConfig } from './config';
import { useSceneManager } from '@/hooks/useSceneManager';
import Spline from '@splinetool/react-spline';
import { AnimatePresence } from 'framer-motion';
import type { SPEObject } from '@splinetool/runtime';
import { SCENE_STATES, type SceneState } from './constants/buttons';

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

type TransitionQueue = {
  stateId: string;
  source: 'button' | 'scene';
}[];

export default function App() {
  const splineRef = useRef<SplineRef>(null);
  const [currentState, setCurrentState] = useState<string>('state1');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionQueue = useRef<TransitionQueue>([]);
  const sceneObjects = useSceneConfig(splineRef);
  const visibility = useSceneManager(splineRef, sceneObjects);
  const finalSceneObjects = useSceneConfig(splineRef, visibility);

  const processNextTransition = useCallback(() => {
    if (
      isTransitioning ||
      !transitionQueue.current.length ||
      !splineRef.current
    )
      return;

    const nextTransition = transitionQueue.current[0];
    const state = SCENE_STATES[nextTransition.stateId];
    if (!state) return;

    setIsTransitioning(true);

    // Only emit the event if the transition was triggered by a button click
    if (nextTransition.source === 'button') {
      try {
        const button = splineRef.current.findObjectByName(state.buttonName);
        if (button) {
          button.emitEvent('mouseDown');
        }
      } catch (error) {
        console.warn('Failed to emit event:', error);
      }
    }

    if (state.nextState) {
      setCurrentState(state.nextState);
    }

    // Remove the processed transition from the queue
    transitionQueue.current = transitionQueue.current.slice(1);

    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  }, [isTransitioning]);

  // Process queue when available
  useEffect(() => {
    if (!isTransitioning && transitionQueue.current.length > 0) {
      processNextTransition();
    }
  }, [isTransitioning, processNextTransition]);

  const queueTransition = useCallback(
    (stateId: string, source: 'button' | 'scene') => {
      transitionQueue.current.push({ stateId, source });
      if (!isTransitioning) {
        processNextTransition();
      }
    },
    [isTransitioning, processNextTransition]
  );

  const onLoad = useCallback(
    (spline: any) => {
      if (!spline) return;
      splineRef.current = spline;

      const handleMouseDown = (e: Event) => {
        const splineEvent = e as SplineMouseEvent;
        const clickedState = Object.values(SCENE_STATES).find(
          (state) => state.buttonName === splineEvent.target.name
        );

        if (clickedState) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Transitioning from ${clickedState.id}`);
          }
          queueTransition(clickedState.id, 'scene');
        }
      };

      spline.addEventListener('mouseDown', handleMouseDown);
      return () => spline.removeEventListener('mouseDown', handleMouseDown);
    },
    [queueTransition]
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
            onClick={() => queueTransition(state.id, 'button')}
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
            aria-label={`Trigger ${state.id}`}
            disabled={isTransitioning}
          >
            {state.id}
            {transitionQueue.current.some((t) => t.stateId === state.id) &&
              ' (Queued)'}
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
