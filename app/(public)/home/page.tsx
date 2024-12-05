'use client';
import { useRef } from 'react';
import { useSceneConfig } from './config';
import { useSceneManager } from '@/hooks/useSceneManager';
import Spline from '@splinetool/react-spline';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  const splineRef = useRef(null);
  const sceneObjects = useSceneConfig(splineRef);
  const visibility = useSceneManager(splineRef, sceneObjects);
  const finalSceneObjects = useSceneConfig(splineRef, visibility);

  const onLoad = (spline: any) => {
    if (!spline) return;
    splineRef.current = spline;
  };

  return (
    <main className="fixed inset-0 flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <Spline
          scene="https://prod.spline.design/5BJvchJS1veR18W9/scene.splinecode"
          onLoad={onLoad}
        />
      </div>
      <AnimatePresence mode="wait">
        {finalSceneObjects.map((obj) => (
          <div key={obj.id}>{obj.component}</div>
        ))}
      </AnimatePresence>
    </main>
  );
}
