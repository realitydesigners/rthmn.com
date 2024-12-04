'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef } from 'react';
import { BoxModule } from './modules/BoxModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { useSuppressSplineError } from '@/hooks/useSupressSplineError';
import { AutoBoxModule } from './modules/AutoBoxModule';

export default function App() {
  useSuppressSplineError();
  const splineRef = useRef(null);

  const showBoxModule = useModuleVisibility(splineRef, {
    objectName: 'BoxSection',
    threshold: 1100
  });

  const showAutoBoxModule = useModuleVisibility(splineRef, {
    objectName: 'BoxSection',
    threshold: 1500
  });

  const onLoad = (spline: any) => {
    if (!spline) return;
    splineRef.current = spline;
  };

  return (
    <main className="fixed inset-0 flex h-screen w-screen overflow-hidden">
      <div className="flex-1">
        <Spline
          scene="https://prod.spline.design/FJKjAlRWBk2Y3SyO/scene.splinecode"
          onLoad={onLoad}
        />
      </div>
      {/* {showBoxModule && <BoxModule splineRef={splineRef} />} */}
      {showAutoBoxModule && <AutoBoxModule splineRef={splineRef} />}
    </main>
  );
}
