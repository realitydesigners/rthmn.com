'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef, useMemo } from 'react';
import { BoxSection } from './modules/BoxSection';
import { useSceneManager } from '@/hooks/useSceneManager';

export default function App() {
  const splineRef = useRef(null);

  const sceneObjects = useMemo(
    () => [
      {
        name: 'DataStream',
        show: 0,
        hide: 6800
      },
      {
        name: 'BoxSection',
        show: 1000,
        hide: 1100,
        component: <BoxSection splineRef={splineRef} />
      }
    ],
    [splineRef]
  );
  const visibility = useSceneManager(splineRef, sceneObjects);

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
      {sceneObjects.map(
        (obj) =>
          visibility[obj.name] && <div key={obj.name}>{obj.component}</div>
      )}
    </main>
  );
}
