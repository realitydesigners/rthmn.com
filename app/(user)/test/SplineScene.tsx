'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef, useState } from 'react';
import { LuLayoutGrid, LuSettings } from 'react-icons/lu';
import { IconType } from 'react-icons';
import { FaChevronDown } from 'react-icons/fa';

interface BoxDimensions {
  size: number;
  scale: number;
  position: { x: number; y: number; z: number };
}

type BoxPosition = 'Up' | 'Down';

interface BoxState {
  name: string;
  position: BoxPosition;
}

type BoxConfig = 'Up' | 'Down';
type BoxesConfig = [BoxConfig, BoxConfig, BoxConfig, BoxConfig, BoxConfig];

interface ConfigState {
  config: BoxesConfig;
  label: string;
}

const generateConfigs = (): ConfigState[] => {
  const configs: ConfigState[] = [];
  const positions: BoxConfig[] = ['Up', 'Down'];

  for (let i = 0; i < Math.pow(2, 5); i++) {
    const binary = i.toString(2).padStart(5, '0');
    const config = binary
      .split('')
      .map((b) => (b === '0' ? 'Up' : 'Down')) as BoxesConfig;
    configs.push({
      config,
      label: config.map((c) => (c === 'Up' ? 'U' : 'D')).join('')
    });
  }

  return configs;
};

interface SidebarIconButtonProps {
  icon: IconType;
  isActive: boolean;
  onClick: () => void;
}

interface DashboardProps {
  boxStates: BoxState[];
  configs: ConfigState[];
  isAnimating: boolean;
  onConfigSelect: (config: BoxesConfig) => void;
}

const Dashboard = ({
  boxStates,
  configs,
  isAnimating,
  onConfigSelect
}: DashboardProps) => {
  return (
    <div className="mt- fixed top-50 right-0 mr-2 flex w-[400px] flex-col gap-2">
      {/* Box Controls Panel */}
      <div className="overflow-hidden rounded-md border border-[#222] bg-black/95 shadow-xl backdrop-blur-sm">
        <div className="font-kodemono flex h-8 items-center justify-between border-b border-[#222] px-4 text-xs font-medium tracking-wider text-[#818181]">
          <div className="flex items-center gap-2">
            <span className="uppercase">Box Controls</span>
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

          {/* Configurations Section */}
          <div className="p-2">
            <div className="font-kodemono mb-2 text-[11px] tracking-wider text-[#666] uppercase">
              Available Patterns
            </div>
            <div className="grid grid-cols-4 gap-1">
              {configs.map((config, index) => (
                <button
                  key={index}
                  onClick={() => onConfigSelect(config.config)}
                  disabled={isAnimating}
                  className={`group font-outfit flex h-9 items-center justify-center rounded border border-transparent bg-[#111] px-2 text-[13px] font-bold tracking-wider transition-all ${
                    isAnimating
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:border-[#333] hover:bg-[#181818]'
                  }`}
                >
                  <span className="text-white">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-2">
            <div className="font-kodemono mb-2 text-[11px] tracking-wider text-[#666] uppercase">
              Legend
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded bg-[#111] p-2">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="font-outfit text-[11px] text-[#666]">
                  Up - Top Corner
                </span>
              </div>
              <div className="flex items-center gap-2 rounded bg-[#111] p-2">
                <div className="h-2 w-2 rounded-full bg-blue-300" />
                <span className="font-outfit text-[11px] text-[#666]">
                  Down - Bottom Corner
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const splineRef = useRef(null);
  const cameraRef = useRef(null);
  const smallestBoxRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [boxStates, setBoxStates] = useState<BoxState[]>([
    { name: 'Box 1', position: 'Up' },
    { name: 'Box 2', position: 'Up' },
    { name: 'Box 3', position: 'Up' },
    { name: 'Box 4', position: 'Up' },
    { name: 'Box 5', position: 'Up' }
  ]);
  const [activePanel, setActivePanel] = useState<'status' | 'config' | null>(
    null
  );

  const configs = generateConfigs();

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
    // A more mathematically precise version could be:
    const cornerDistance =
      ((parentBox.size - currentBox.size) / 2 + currentBox.size / 2) *
      (1 / Math.sqrt(1.2));

    // Note: 1/sqrt(1.2) ≈ 0.913 which is very close to our 0.91

    // This suggests the scaling factor is related to the diagonal distance
    // in a cube (sqrt(2)) and the scaling relationship between nested boxes
    return cornerDistance;
  };

  const ANIMATION_DURATION = 500; // Faster animation (0.5 seconds)
  const ANIMATION_STEPS = 30; // Maintain 60fps
  const CORNER_THRESHOLD = 0.05; // More precise corner detection
  const GREEN_BOXES = ['1g', '2g', '3g', '4g', '5g'];

  interface ProcessBoxParams {
    index: number;
    config: BoxesConfig;
  }

  const processBox = async ({ index, config }: ProcessBoxParams) => {
    if (index === 0) return; // First box stays at origin

    const box = splineRef.current.findObjectByName(GREEN_BOXES[index]);
    const parentBox = splineRef.current.findObjectByName(
      GREEN_BOXES[index - 1]
    );

    if (!box || !parentBox) return;

    const currentDimensions = calculateBoxDimensions(index, 100, Math.sqrt(2));
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

    // Calculate target position
    const targetY =
      parentBox.position.y +
      (config[index] === 'Up' ? cornerOffset : -cornerOffset);

    // Function to check if box has reached target
    const hasReachedTarget = () => Math.abs(box.position.y - targetY) < 0.01;

    // If box is already at target, no need to animate
    if (hasReachedTarget()) return;

    const startY = box.position.y;

    // Animate the position
    for (let step = 0; step <= ANIMATION_STEPS; step++) {
      const progress = step / ANIMATION_STEPS;
      const newY = startY + (targetY - startY) * progress;
      box.position.y = newY;
      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_DURATION / ANIMATION_STEPS)
      );
    }

    // Force exact position
    box.position.y = targetY;

    // Wait until box has definitely reached target position
    while (!hasReachedTarget()) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  };

  const applyBoxConfiguration = async (config: BoxesConfig) => {
    if (isAnimating) return;

    const spline = splineRef.current;
    if (!spline) return;

    setIsAnimating(true);
    setBoxStates((prevStates) =>
      prevStates.map((box, index) => ({
        ...box,
        position: config[index]
      }))
    );

    try {
      // Calculate initial positions and offsets
      const boxes = new Map<
        number,
        {
          box: any;
          startY: number;
          cornerOffset: number;
          finalY: number;
        }
      >();

      // First calculate all final positions
      let currentParentY = 0; // Base box position
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

          // Calculate final position based on parent's final position
          const finalY =
            currentParentY +
            (config[i] === 'Up' ? cornerOffset : -cornerOffset);
          currentParentY = finalY; // Update for next box

          boxes.set(i, {
            box,
            startY: box.position.y,
            cornerOffset,
            finalY
          });
        }
      }

      // Single animation loop
      const totalSteps = 30;
      const stepDuration = 500 / totalSteps;

      for (let step = 0; step <= totalSteps; step++) {
        const progress = step / totalSteps;

        // Update positions from smallest to largest
        for (let i = 4; i >= 1; i--) {
          const data = boxes.get(i);
          if (data) {
            const { box, startY, finalY } = data;
            // Animate directly to final position
            const newY = startY + (finalY - startY) * progress;
            box.position.y = newY;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, stepDuration));
      }

      // Set final positions
      for (let i = 4; i >= 1; i--) {
        const data = boxes.get(i);
        if (data) {
          data.box.position.y = data.finalY;
        }
      }
    } finally {
      setIsAnimating(false);
    }
  };

  const onLoad = (spline: any) => {
    splineRef.current = spline;

    // Set up camera
    const cameraObject = spline.findObjectByName('Camera');
    if (cameraObject) {
      cameraRef.current = cameraObject;
      // Position camera for a good view of the nested boxes
      cameraObject.position.x = 1200;
      cameraObject.position.y = 1200;
      cameraObject.position.z = 1200;
      cameraObject.rotation.x = -45;
      cameraObject.rotation.y = 35;
      cameraObject.rotation.z = 30;

      // Optional: Adjust camera rotation/look-at
      if (cameraObject.lookAt) {
        cameraObject.lookAt(0, 0, 0);
      }
    } else {
      console.warn('Camera not found in scene');
    }

    const greenBoxes = ['1g', '2g', '3g', '4g', '5g'];
    const scaleFactor = Math.sqrt(2);
    const baseSize = 100;

    // Store the smallest box reference
    smallestBoxRef.current = spline.findObjectByName('5g');

    const positionNestedBoxes = (boxNames: string[]) => {
      boxNames.forEach((name, index) => {
        const currentBox = spline.findObjectByName(name);

        if (currentBox) {
          console.log(`Found box: ${name}`, currentBox);

          try {
            // Get current box dimensions
            const currentDimensions = calculateBoxDimensions(
              index,
              baseSize,
              scaleFactor
            );

            // Apply scale
            currentBox.scale.x = currentDimensions.scale;
            currentBox.scale.y = currentDimensions.scale;
            currentBox.scale.z = currentDimensions.scale;

            if (index > 0) {
              const parentName = boxNames[index - 1];
              const parentBox = spline.findObjectByName(parentName);

              if (parentBox) {
                // Get parent box dimensions
                const parentDimensions = calculateBoxDimensions(
                  index - 1,
                  baseSize,
                  scaleFactor
                );

                // Calculate corner offset using sqrt(2) relationship
                const cornerOffset = calculateCornerOffset(
                  currentDimensions,
                  parentDimensions,
                  scaleFactor
                );

                // Position smaller box in corner of parent box
                currentBox.position.x = parentBox.position.x + cornerOffset;
                currentBox.position.y = parentBox.position.y + cornerOffset;
                currentBox.position.z = parentBox.position.z - cornerOffset;

                console.log(
                  `Box ${name} - Size: ${currentDimensions.size}, ` +
                    `Parent Size: ${parentDimensions.size}, ` +
                    `Corner Offset: ${cornerOffset}`
                );
              }
            } else {
              // First box at origin
              currentBox.position.x = 0;
              currentBox.position.y = 0;
              currentBox.position.z = 0;
            }
          } catch (error) {
            console.error(`Error manipulating box ${name}:`, error);
            console.log('Box object structure:', currentBox);
          }
        } else {
          console.warn(`Box not found: ${name}`);
        }
      });
    };

    // Position the boxes
    positionNestedBoxes(greenBoxes);
  };

  return (
    <main className="relative flex h-full w-full overflow-hidden">
      <div className="flex-1">
        <SplineScene onLoad={onLoad} />
      </div>

      <Dashboard
        boxStates={boxStates}
        configs={configs}
        isAnimating={isAnimating}
        onConfigSelect={applyBoxConfiguration}
      />
    </main>
  );
}

interface SplineSceneProps {
  onLoad: (spline: any) => void;
}

const SplineScene = ({ onLoad }: SplineSceneProps) => {
  return (
    <Spline
      scene="https://prod.spline.design/ojzfkQJP2K4w4LC6/scene.splinecode"
      onLoad={onLoad}
    />
  );
};
