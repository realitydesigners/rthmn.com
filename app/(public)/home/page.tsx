'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef } from 'react';
import { BoxModule } from './modules/BoxModule';
import { useSuppressSplineError } from '@/hooks/useSupressSplineError';

export default function App() {
  useSuppressSplineError();
  const splineRef = useRef(null);

  const onLoad = (spline: any) => {
    if (!spline) return;
    splineRef.current = spline;
  };

  return (
    <main className="relative flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <Spline
          scene="https://prod.spline.design/cP3iqEd5u4uCWRDI/scene.splinecode"
          onLoad={onLoad}
        />
      </div>
      <BoxModule splineRef={splineRef} />
    </main>
  );
}
