'use client';
import React, { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

// Types
interface BoxDimensions {
  size: number;
  scale: number;
  position: { x: number; y: number; z: number };
}

type BoxPosition = 1 | -1;
type BoxConfig = 1 | -1;
type BoxesConfig = [
  BoxConfig,
  BoxConfig,
  BoxConfig,
  BoxConfig,
  BoxConfig,
  BoxConfig,
  BoxConfig,
  BoxConfig
];

interface BoxState {
  name: string;
  position: BoxPosition;
}

interface ConfigState {
  config: BoxesConfig;
  label: string;
}

// Define sequences
const sequences: BoxesConfig[] = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, -1],
  [1, 1, 1, 1, 1, 1, -1, -1],
  [1, 1, 1, 1, 1, -1, -1, -1],
  [1, 1, 1, 1, -1, -1, -1, -1],
  [1, 1, 1, 1, -1, -1, -1, 1],
  [1, 1, 1, 1, -1, -1, 1, 1],
  [1, 1, 1, 1, -1, 1, 1, -1],
  [1, 1, 1, 1, -1, 1, -1, -1],
  [1, 1, 1, 1, -1, -1, -1, -1],
  [1, 1, 1, -1, -1, -1, -1, -1],
  [1, 1, 1, -1, -1, -1, -1, 1],
  [1, 1, 1, -1, -1, -1, 1, 1],
  [1, 1, 1, -1, -1, 1, 1, -1],
  [1, 1, 1, -1, -1, 1, -1, -1],
  [1, 1, 1, -1, -1, 1, -1, 1],
  [1, 1, 1, -1, -1, 1, 1, 1],
  [1, 1, 1, -1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
] as BoxesConfig[];

// Convert sequences to ConfigState format
const CONFIGS: ConfigState[] = sequences.map((config) => ({
  config,
  label: config.map((n) => (n === 1 ? 'P' : 'N')).join('') // P for Positive, N for Negative
}));

interface AutoBoxModuleProps {
  splineRef: React.MutableRefObject<any>;
}

export const BoxSection: React.FC<AutoBoxModuleProps> = ({ splineRef }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [boxStates, setBoxStates] = useState<BoxState[]>([
    { name: 'Box 1', position: 1 },
    { name: 'Box 2', position: 1 },
    { name: 'Box 3', position: 1 },
    { name: 'Box 4', position: 1 },
    { name: 'Box 5', position: 1 },
    { name: 'Box 6', position: 1 },
    { name: 'Box 7', position: 1 },
    { name: 'Box 8', position: 1 }
  ]);

  // Constants
  const ANIMATION_DURATION = 500;
  const ANIMATION_STEPS = 30;
  const CORNER_THRESHOLD = 0.05;
  const GREEN_BOXES = ['1g', '2g', '3g', '4g', '5g', '6g', '7g', '8g'];

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
      for (let i = 1; i <= 7; i++) {
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
            currentParentY + (config[i] === 1 ? cornerOffset : -cornerOffset);
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
        for (let i = 7; i >= 1; i--) {
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
    <div className="fixed right-0 -bottom-500 mr-2 flex w-[400px] flex-col gap-2">
      <div className="overflow-hidden rounded-md border border-[#222] bg-black/80 shadow-xl backdrop-blur-lg">
        {/* Header */}
        <div className="font-kodemono flex h-10 items-center justify-between border-b border-[#222]/50 px-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500/50" />
            <span className="text-xs font-medium tracking-wider text-[#818181]">
              SEQUENCE VISUALIZER
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#222]/30">
          {/* Sequence Visualization */}
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-kodemono text-[11px] text-[#666] uppercase">
                Pattern {currentConfigIndex + 1}/{CONFIGS.length}
              </span>
              <span className="font-mono text-[10px] text-[#444]">
                {sequences[currentConfigIndex].join('')}
              </span>
            </div>

            {/* Abstract Visualization */}
            <div className="relative h-16 w-full overflow-hidden rounded-md bg-[#111]">
              <div className="absolute inset-0 flex items-center justify-center">
                {sequences[currentConfigIndex].map((value, idx) => (
                  <div
                    key={idx}
                    className={`mx-0.5 h-12 w-1 transform transition-all duration-500 ${value === 1 ? 'bg-blue-400/40' : 'bg-blue-300/20'} ${value === 1 ? 'scale-y-100' : 'scale-y-50'} `}
                    style={{
                      transform: `scaleY(${value === 1 ? '1' : '0.5'}) translateY(${value === 1 ? '-4px' : '4px'})`,
                      transition: 'transform 0.5s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Current State */}
          <div className="p-4">
            <div className="flex flex-wrap gap-1">
              {boxStates.map((box, index) => (
                <div
                  key={box.name}
                  className={`relative flex h-12 w-12 items-center justify-center rounded ${box.position === 1 ? 'bg-blue-500/10' : 'bg-blue-300/5'} transition-all duration-300`}
                >
                  <div
                    className={`absolute inset-0 border ${box.position === 1 ? 'border-blue-400/30' : 'border-blue-300/20'} rounded transition-all duration-300`}
                  />
                  <span
                    className={`font-mono text-xs font-bold ${box.position === 1 ? 'text-blue-400' : 'text-blue-300/70'} `}
                  >
                    {box.position === 1 ? '+1' : '-1'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-2">
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-[#222]/30">
              <div
                className="h-full bg-blue-400/30 transition-all duration-500"
                style={{
                  width: `${(currentConfigIndex / (CONFIGS.length - 1)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
