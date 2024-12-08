'use client';
import { useRef, useState } from 'react';
import { useSceneConfig, Buttons, ButtonsMap } from './config';
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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
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

      {/* Navigation Dots */}
      <div className="fixed bottom-8 left-1/2 flex -translate-x-1/2 flex-row items-center gap-6">
        {Buttons.map((button) => (
          <div key={button.sectionId} className="group relative">
            {/* Dot button */}
            <button
              onClick={() => handleButtonClick(button.sectionId)}
              onMouseEnter={() => setHoveredButton(button.sectionId)}
              onMouseLeave={() => setHoveredButton(null)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                currentSection === button.sectionId
                  ? 'scale-125 bg-blue-500'
                  : 'bg-gray-400 hover:bg-blue-400'
              }`}
              aria-label={`Navigate to ${button.name}`}
            />

            {/* Label that appears on hover */}
            <div
              className={`absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded px-2 py-1 whitespace-nowrap transition-all duration-200 ${
                hoveredButton === button.sectionId
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-1 opacity-0'
              } `}
            >
              <span className="text-sm font-medium text-gray-700">
                {button.name}
              </span>
            </div>

            {/* Active indicator line */}
            {currentSection === button.sectionId && (
              <div className="absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-blue-500 transition-all duration-300" />
            )}
          </div>
        ))}
      </div>

      {finalSceneObjects.map((obj) => (
        <div key={obj.id}>{obj.component}</div>
      ))}
    </main>
  );
}
