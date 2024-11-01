'use client';
import type React from 'react';
import { oxanium, outfit, kodeMono, russo } from '@/fonts';
import type { Box, BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { sequences } from './sequences';

interface BoxComponentProps {
  slice: BoxSlice | null;
  isLoading: boolean;
}

const POINT_OF_CHANGE_INDEX = 28;
const PAUSE_DURATION = 5000;

interface PositionStyle {
  top?: number;
  bottom?: number;
  right: number;
}

const ShiftedBox: React.FC<BoxComponentProps> = ({ slice, isLoading }) => {
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const boxCount = 8;
  const baseValues = [2000, 1732, 1500, 1299, 1125, 974, 843, 730];

  const patterns = sequences;
  const totalStepsRef = useRef(patterns.length);

  // Add ref for the scrollable container
  const tableRef = useRef<HTMLDivElement>(null);

  // Add effect to handle auto-scrolling
  useEffect(() => {
    if (tableRef.current) {
      const scrollContainer = tableRef.current;
      const currentRow = scrollContainer.querySelector('.current-pattern-row');
      if (currentRow) {
        currentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [demoStep]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentPatternIndex = Math.floor(demoStep / 1) % patterns.length;

      if (currentPatternIndex === POINT_OF_CHANGE_INDEX && !isPaused) {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
        }, PAUSE_DURATION);
        return;
      }

      if (!isPaused) {
        setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [demoStep, isPaused]);

  const createDemoStep = (step: number) => {
    const patternIndex = Math.floor(step / 1) % patterns.length;
    const pattern = patterns[patternIndex];

    return baseValues.slice(0, boxCount).map((value, index) => {
      if (index >= pattern.length) return value;
      return value * pattern[index];
    });
  };

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
    const isPointOfChange =
      Math.floor(demoStep / 1) % patterns.length === POINT_OF_CHANGE_INDEX;

    const renderBox = (
      box: Box,
      index: number,
      prevColor: string | null = null
    ) => {
      const boxColor = box.value > 0 ? 'bg-green-900/50' : 'bg-red-900/50';
      const borderColor =
        isPointOfChange && box.value > 0 ? 'border-green-500' : 'border-black';
      const borderWidth =
        isPointOfChange && box.value > 0
          ? 'border rounded-lg'
          : 'border rounded-lg';
      const size = (Math.abs(box.value) / maxSize) * 250;

      let basePosition: PositionStyle = { top: 0, right: 0 };
      if (prevColor !== null) {
        if (prevColor !== boxColor) {
          basePosition =
            prevColor === 'bg-[#212121]'
              ? { bottom: 0, right: 0 }
              : { top: 0, right: 0 };
        } else {
          basePosition =
            box.value > 0 ? { top: 0, right: 0 } : { bottom: 0, right: 0 };
        }
      }

      const pauseTransform = isPaused
        ? {
            transform: `
              translateX(${index * 3}px)
              translateY(${index * 0}px)
            `,
            transition: 'all 0.8s cubic-bezier(0.8, 0, 0.2, 1)'
          }
        : {};

      const positionStyle: React.CSSProperties = {
        ...basePosition,
        ...pauseTransform
      };

      return (
        <div
          key={`box-${index}-${box.value}-${demoStep}`}
          className={`absolute ${boxColor} ${borderColor} ${borderWidth} duration-800 transition-all ease-out`}
          style={{
            width: `${size}px`,
            height: `${size}px`,

            ...positionStyle,
            margin: '-1px',
            boxShadow: isPaused
              ? `${index * 2}px ${index * 2}px ${index * 3}px rgba(0,0,0,0.2)`
              : 'none'
          }}
        >
          {index < boxArray.length - 1 &&
            renderBox(boxArray[index + 1], index + 1, boxColor)}
        </div>
      );
    };

    return <div className="relative">{renderBox(boxArray[0], 0)}</div>;
  };

  return (
    <div className="flex h-screen items-center justify-center gap-12">
      <div className="items- flex flex-col">
        <h1
          className={`${outfit.className} text-6xl font-bold tracking-tight text-white`}
        >
          A Next Generation
        </h1>
        <h2
          className={`${outfit.className} text-5xl font-bold tracking-tight text-transparent text-white`}
        >
          Algorithmic Trading Platform
        </h2>
      </div>
      <div className="flex w-auto flex-col items-center justify-center gap-4">
        <div className={`${kodeMono.className} text-sm text-gray-500`}>
          {isPaused && (
            <span className="text-green-500">System State Analysis</span>
          )}
        </div>
        <div className="relative min-h-[250px] w-[250px] bg-black">
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

        <div className={`${kodeMono.className} mb-2 text-gray-400`}>
          Sequence History: Pattern {Math.floor(demoStep / 1) + 1} of{' '}
          {patterns.length}
        </div>

        <div
          ref={tableRef}
          className={`${kodeMono.className} scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-800 h-[200px] overflow-y-auto text-xs`}
        >
          <table className="w-full border-collapse">
            <tbody>
              {patterns
                .slice(0, (Math.floor(demoStep / 1) % patterns.length) + 1)
                .map((pattern, patternIndex) => {
                  const isCurrentPattern =
                    patternIndex === Math.floor(demoStep / 1) % patterns.length;
                  return (
                    <tr
                      key={patternIndex}
                      className={`${
                        isCurrentPattern
                          ? 'current-pattern-row bg-gray-900/30'
                          : ''
                      } transition-colors duration-200`}
                    >
                      <td className="sticky left-0 bg-black pr-4 text-right text-gray-500">
                        {`Pattern ${patternIndex + 1}`}
                      </td>
                      {pattern.map((value, boxIndex) => (
                        <td
                          key={boxIndex}
                          className={`px-2 ${
                            value === 1 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {value === 1 ? '↑' : '↓'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShiftedBox;
