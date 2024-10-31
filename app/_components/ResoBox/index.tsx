'use client';
import type React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import type { Box, BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';

interface BoxComponentProps {
  slice: BoxSlice | null;
  isLoading: boolean;
}

const ShiftedBox: React.FC<BoxComponentProps> = ({ slice, isLoading }) => {
  const [boxCount, setBoxCount] = useState(8);
  const [demoStep, setDemoStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const baseValues = [
    2000, 1732, 1500, 1299, 1125, 974, 843, 730, 632, 548, 474, 411, 356, 308,
    267, 231
  ];

  const generatePatterns = () => {
    const patterns: number[][] = [];
    const size = 8;

    // Start with all up
    let currentPattern = Array(size).fill(1);
    patterns.push([...currentPattern]);

    // Basic wave sequence
    const sequences = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, -1], // Last one down
      [1, 1, 1, 1, 1, 1, -1, -1], // Last two down
      [1, 1, 1, 1, 1, -1, -1, -1], // Last three down
      [1, 1, 1, 1, -1, -1, -1, -1], // Last four down
      [1, 1, 1, 1, -1, -1, -1, 1], // Last one up
      [1, 1, 1, 1, -1, -1, 1, 1], // Last one up
      [1, 1, 1, 1, -1, 1, 1, 1], // Last one up
      [1, 1, 1, 1, 1, 1, 1, 1], // Last one up
      [1, 1, 1, 1, 1, 1, 1, -1],
      [1, 1, 1, 1, 1, 1, -1, -1], // Last one up
      [1, 1, 1, 1, 1, -1, -1, -1],
      [1, 1, 1, 1, -1, -1, -1, -1],
      [1, 1, 1, -1, -1, -1, -1, -1],
      [1, 1, 1, -1, -1, -1, -1, 1],
      [1, 1, 1, -1, -1, -1, 1, 1],
      [1, 1, 1, -1, -1, 1, 1, 1],
      [1, 1, 1, -1, 1, 1, 1, 1],
      [1, 1, 1, -1, 1, 1, 1, -1],
      [1, 1, 1, -1, 1, -1, -1, -1],
      [1, 1, 1, -1, -1, -1, -1, -1],
      [1, 1, -1, -1, -1, -1, -1, -1],
      [1, -1, -1, -1, -1, -1, -1, -1],
      [1, -1, -1, -1, -1, -1, -1, 1],
      [1, -1, -1, -1, -1, -1, 1, 1],
      [1, -1, -1, -1, -1, 1, 1, 1],
      [1, -1, -1, -1, -1, 1, 1, -1],
      [1, -1, -1, -1, -1, 1, -1, -1],
      [1, -1, -1, -1, -1, 1, 1, 1]
    ];

    return sequences;
  };

  const patterns = generatePatterns();
  const stepsPerPattern = 2;
  const totalStepsRef = useRef(patterns.length * stepsPerPattern);

  const createDemoStep = (step: number) => {
    const patternIndex = Math.floor(step / stepsPerPattern) % patterns.length;
    const pattern = patterns[patternIndex];

    return baseValues.slice(0, boxCount).map((value, index) => {
      if (index >= pattern.length) return value;
      return value * pattern[index];
    });
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const currentValues = createDemoStep(demoStep);
  const mockBoxData: Box[] = currentValues.map((value) => ({
    high: Math.abs(value) + 200,
    low: Math.abs(value) - 200,
    value: value
  }));

  const mockSlice: BoxSlice = {
    timestamp: new Date().toISOString(),
    boxes: mockBoxData
  };

  const currentSlice = slice || mockSlice;

  const renderShiftedBoxes = (boxArray: Box[]) => {
    if (!boxArray || boxArray.length === 0) return null;

    const maxSize = Math.abs(boxArray[0].value);

    const renderBox = (
      box: Box,
      index: number,
      prevColor: string | null = null
    ) => {
      const boxColor = box.value > 0 ? 'bg-[#555]' : 'bg-[#212121]';
      const size = (Math.abs(box.value) / maxSize) * 250;

      let positionStyle: React.CSSProperties = { top: 0, right: 0 };

      if (prevColor !== null) {
        if (prevColor !== boxColor) {
          positionStyle =
            prevColor === 'bg-[#212121]'
              ? { bottom: 0, right: 0 }
              : { top: 0, right: 0 };
        } else {
          positionStyle =
            box.value > 0 ? { top: 0, right: 0 } : { bottom: 0, right: 0 };
        }
      }

      return (
        <div
          key={`box-${index}-${box.value}-${demoStep}`}
          className={`absolute ${boxColor} border border-black`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            ...positionStyle,
            margin: '-1px'
          }}
        >
          {index < boxArray.length - 1 &&
            renderBox(boxArray[index + 1], index + 1, boxColor)}
        </div>
      );
    };

    return renderBox(boxArray[0], 0);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Number of Boxes</label>
          <input
            type="number"
            min="1"
            max={baseValues.length}
            value={boxCount}
            onChange={(e) => setBoxCount(Number(e.target.value))}
            className="w-32 rounded bg-gray-800 px-2 py-1 text-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Demo Controls</label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDemoStep(0);
                setIsPlaying(true);
              }}
              className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
            >
              {isPlaying ? 'Stop' : 'Play Demo'}
            </button>
            <button
              onClick={() => setDemoStep(0)}
              className="rounded bg-gray-600 px-4 py-1 text-white hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        Pattern {Math.floor(demoStep / stepsPerPattern) + 1} of{' '}
        {patterns.length}
      </div>

      <div className="relative min-h-[250px] w-[250px] overflow-hidden border border-[#181818] bg-black">
        {currentSlice && currentSlice.boxes.length > 0 && (
          <div className="relative h-full w-full">
            {renderShiftedBoxes(
              currentSlice.boxes.sort(
                (a, b) => Math.abs(b.value) - Math.abs(a.value)
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftedBox;
