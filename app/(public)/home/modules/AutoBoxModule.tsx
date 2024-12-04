'use client';
import React, { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

// Types
interface BoxDimensions {
  size: number;
  scale: number;
  position: { x: number; y: number; z: number };
}

type BoxPosition = 'Up' | 'Down';
type BoxConfig = 'Up' | 'Down';
type BoxesConfig = [BoxConfig, BoxConfig, BoxConfig, BoxConfig, BoxConfig];

interface BoxState {
  name: string;
  position: BoxPosition;
}

interface ConfigState {
  config: BoxesConfig;
  label: string;
}

// Predefined configurations for auto-play
const CONFIGS: ConfigState[] = [
  {
    config: ['Up', 'Up', 'Up', 'Up', 'Up'] as BoxesConfig,
    label: 'UUUUU'
  },
  {
    config: ['Up', 'Up', 'Up', 'Up', 'Down'] as BoxesConfig,
    label: 'UUUUD'
  },
  {
    config: ['Up', 'Up', 'Up', 'Down', 'Up'] as BoxesConfig,
    label: 'UUUDU'
  },
  {
    config: ['Up', 'Up', 'Down', 'Up', 'Up'] as BoxesConfig,
    label: 'UUDUU'
  }
];

interface AutoBoxModuleProps {
  splineRef: React.MutableRefObject<any>;
}

export const AutoBoxModule: React.FC<AutoBoxModuleProps> = ({ splineRef }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [boxStates, setBoxStates] = useState<BoxState[]>([
    { name: 'Box 1', position: 'Up' },
    { name: 'Box 2', position: 'Up' },
    { name: 'Box 3', position: 'Up' },
    { name: 'Box 4', position: 'Up' },
    { name: 'Box 5', position: 'Up' }
  ]);

  // Constants
  const ANIMATION_DURATION = 500;
  const ANIMATION_STEPS = 30;
  const CORNER_THRESHOLD = 0.05;
  const GREEN_BOXES = ['1g', '2g', '3g', '4g', '5g'];

  // Helper functions
  const calculateBoxDimensions = (
    index: number,
    baseSize: number,
    scaleFactor: number
  ): BoxDimensions => {
    const scale = Math.pow(1 / scaleFactor, index);
    return {
      size: baseSize * scale,
      scale,
      position: { x: 0, y: 0, z: 0 }
    };
  };

  const calculateCornerOffset = (
    currentBox: BoxDimensions,
    parentBox: BoxDimensions,
    scaleFactor: number
  ): number => {
    const cornerDistance =
      ((parentBox.size - currentBox.size) / 2 + currentBox.size / 2) *
      (1 / Math.sqrt(1.2));
    return cornerDistance;
  };

  // Box manipulation functions
  const applyBoxConfiguration = async (config: BoxesConfig) => {
    if (isAnimating || !splineRef.current) return;

    setIsAnimating(true);
    setBoxStates((prevStates) =>
      prevStates.map((box, index) => ({
        ...box,
        position: config[index]
      }))
    );

    try {
      const spline = splineRef.current;
      const boxes = new Map<
        number,
        {
          box: any;
          startY: number;
          cornerOffset: number;
          finalY: number;
        }
      >();

      let currentParentY = 0;
      for (let i = 1; i <= 4; i++) {
        const box = spline.findObjectByName(GREEN_BOXES[i]);
        const parentBox = spline.findObjectByName(GREEN_BOXES[i - 1]);

        if (box && parentBox) {
          const currentDimensions = calculateBoxDimensions(
            i,
            100,
            Math.sqrt(2)
          );
          const parentDimensions = calculateBoxDimensions(
            i - 1,
            100,
            Math.sqrt(2)
          );
          const cornerOffset = calculateCornerOffset(
            currentDimensions,
            parentDimensions,
            Math.sqrt(2)
          );

          const finalY =
            currentParentY +
            (config[i] === 'Up' ? cornerOffset : -cornerOffset);
          currentParentY = finalY;

          boxes.set(i, {
            box,
            startY: box.position.y,
            cornerOffset,
            finalY
          });
        }
      }

      // Animate
      for (let step = 0; step <= ANIMATION_STEPS; step++) {
        const progress = step / ANIMATION_STEPS;
        for (let i = 4; i >= 1; i--) {
          const data = boxes.get(i);
          if (data) {
            const { box, startY, finalY } = data;
            const newY = startY + (finalY - startY) * progress;
            box.position.y = newY;
          }
        }
        await new Promise((resolve) =>
          setTimeout(resolve, ANIMATION_DURATION / ANIMATION_STEPS)
        );
      }

      // Set final positions
      boxes.forEach((data) => {
        data.box.position.y = data.finalY;
      });
    } finally {
      setIsAnimating(false);
    }
  };

  // Initial box setup
  useEffect(() => {
    const spline = splineRef.current;
    if (!spline) return;

    const positionNestedBoxes = (boxNames: string[]) => {
      boxNames.forEach((name, index) => {
        const currentBox = spline.findObjectByName(name);

        if (currentBox) {
          try {
            const currentDimensions = calculateBoxDimensions(
              index,
              100,
              Math.sqrt(2)
            );

            currentBox.scale.x = currentDimensions.scale;
            currentBox.scale.y = currentDimensions.scale;
            currentBox.scale.z = currentDimensions.scale;

            if (index > 0) {
              const parentName = GREEN_BOXES[index - 1];
              const parentBox = spline.findObjectByName(parentName);

              if (parentBox) {
                const parentDimensions = calculateBoxDimensions(
                  index - 1,
                  100,
                  Math.sqrt(2)
                );

                const cornerOffset = calculateCornerOffset(
                  currentDimensions,
                  parentDimensions,
                  Math.sqrt(2)
                );

                currentBox.position.x = parentBox.position.x + cornerOffset;
                currentBox.position.y = parentBox.position.y + cornerOffset;
                currentBox.position.z = parentBox.position.z - cornerOffset;
              }
            } else {
              currentBox.position.x = 0;
              currentBox.position.y = 0;
              currentBox.position.z = 0;
            }
          } catch (error) {
            console.error(`Error manipulating box ${name}:`, error);
          }
        }
      });
    };

    // Position the boxes and start auto-play
    positionNestedBoxes(GREEN_BOXES);
    setIsInitialized(true);
  }, [splineRef.current]);

  // Auto-play effect
  useEffect(() => {
    if (!isInitialized) return;

    const playNextConfig = async () => {
      if (isAnimating) return;

      await applyBoxConfiguration(CONFIGS[currentConfigIndex].config);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentConfigIndex((prev) => (prev + 1) % CONFIGS.length);
    };

    playNextConfig();
  }, [currentConfigIndex, isAnimating, isInitialized]);

  return (
    <div className="mt- fixed right-0 bottom-50 mr-2 flex w-[400px] flex-col gap-2">
      <div className="overflow-hidden rounded-md border border-[#222] bg-black/95 shadow-xl backdrop-blur-sm">
        <div className="font-kodemono flex h-8 items-center justify-between border-b border-[#222] px-4 text-xs font-medium tracking-wider text-[#818181]">
          <div className="flex items-center gap-2">
            <span className="uppercase">Auto Box Controls</span>
            <FaChevronDown size={8} className="opacity-50" />
          </div>
        </div>

        <div className="divide-y divide-[#222]">
          {/* Status Section */}
          <div className="p-2">
            <div className="font-kodemono mb-2 text-[11px] tracking-wider text-[#666] uppercase">
              Current State
            </div>
            <div className="grid grid-cols-5 gap-1">
              {boxStates.map((box, index) => (
                <div
                  key={box.name}
                  className="group flex flex-col items-center rounded border border-transparent bg-[#111] p-2 transition-all hover:border-[#333]"
                >
                  <span className="font-outfit text-[11px] font-medium text-[#666]">
                    Box {index + 1}
                  </span>
                  <span
                    className={`font-kodemono text-[13px] font-bold tracking-wider ${
                      box.position === 'Up' ? 'text-blue-400' : 'text-blue-300'
                    }`}
                  >
                    {box.position}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Configuration */}
          <div className="p-2">
            <div className="font-kodemono mb-2 text-[11px] tracking-wider text-[#666] uppercase">
              Current Configuration ({currentConfigIndex + 1}/{CONFIGS.length})
            </div>
            <div className="font-outfit text-center text-sm">
              {CONFIGS[currentConfigIndex].label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
