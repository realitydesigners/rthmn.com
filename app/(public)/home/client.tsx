'use client';
import { useRef } from 'react';
import { useSceneConfig, ButtonsMap } from './config';
import { useSceneManager } from '@/hooks/useSceneManager';
import Spline from '@splinetool/react-spline';
import { NavigationDots } from './components/NavigationDots';

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
    triggerSceneTransition,
    currentSection
  } = useSceneManager(splineRef, sceneObjects, ButtonsMap);

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

      <NavigationDots
        currentSection={currentSection}
        onButtonClick={handleButtonClick}
      />

      {finalSceneObjects.map((obj) => (
        <div key={obj.id}>{obj.component}</div>
      ))}
    </main>
  );
}
