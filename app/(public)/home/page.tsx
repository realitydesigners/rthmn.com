'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef, useMemo } from 'react';
import { AutoBoxModule } from './modules/AutoBoxModule';
import { useSceneManager } from '@/hooks/useSceneManager';
import { useSuppressSplineError } from '@/hooks/useSupressSplineError';

export default function App() {
  useSuppressSplineError();
  const splineRef = useRef(null);

  const sceneObjects = useMemo(
    () => [
      {
        name: 'DataStream',
        show: 0,
        hide: 7000
      },
      {
        name: 'BoxSection',
        show: 1200,
        hide: 1300,

        component: <AutoBoxModule splineRef={splineRef} />
      }
    ],
    [splineRef]
  );

  const visibility = useSceneManager(splineRef, sceneObjects);

  const onLoad = (spline: any) => {
    if (!spline) return;
    splineRef.current = spline;

    console.log('All Scene Objects:', {
      all: spline.getAllObjects(),
      named: spline.getAllObjects().map((obj: any) => ({
        name: obj.name,
        type: obj.type,
        scale: obj.scale,
        position: obj.position
      }))
    });
  };

  return (
    <main className="fixed inset-0 flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <Spline
          scene="https://prod.spline.design/FJKjAlRWBk2Y3SyO/scene.splinecode"
          onLoad={onLoad}
        />
      </div>
      {sceneObjects.map(
        (obj) =>
          obj.component &&
          visibility[obj.name] && (
            <React.Fragment key={obj.name}>{obj.component}</React.Fragment>
          )
      )}
    </main>
  );
}
