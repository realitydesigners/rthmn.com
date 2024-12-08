'use client';
import { useRef, useEffect, useState } from 'react';
import { useSceneConfig, Buttons } from './config';
import { useSceneManager } from '@/hooks/useSceneManager';
import Spline from '@splinetool/react-spline';

export default function HomeClient({
  url,
  posts,
  marketData,
  products
}: {
  url: string;
  posts: any[];
  marketData: any[];
  products: any[];
}) {
  const splineRef = useRef(null);
  const sceneObjects = useSceneConfig(splineRef);

  const {
    visibilityStates,
    handleButtonClick,
    isSceneLoaded,
    triggerSceneTransition
  } = useSceneManager(splineRef, sceneObjects, Buttons);

  const finalSceneObjects = useSceneConfig(splineRef, visibilityStates);

  return (
    <main className="fixed inset-0 flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <Spline
          scene={url}
          onLoad={(spline) => {
            splineRef.current = spline;
            triggerSceneTransition();
          }}
        />
      </div>
      <div className="fixed right-4 bottom-4 z-10 flex flex-col gap-2">
        {Object.values(Buttons).map((state) => (
          <button
            key={state.id}
            onClick={() => handleButtonClick(state.id)}
            className="rounded bg-blue-500 px-4 py-2 text-white"
            aria-label={`Trigger ${state.id}`}
          >
            {state.id}
          </button>
        ))}
      </div>

      {finalSceneObjects.map((obj) => (
        <div key={obj.id}>{obj.component}</div>
      ))}
    </main>
  );
}
