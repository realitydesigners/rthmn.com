'use client';
import type React from 'react';
import { oxanium, outfit, kodeMono, russo } from '@/fonts';
import type { Box, BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { sequences } from './sequences';
import {
  FaRobot,
  FaBrain,
  FaWaveSquare,
  FaChartLine,
  FaMicrochip,
  FaAtom,
  FaCode,
  FaServer
} from 'react-icons/fa';

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
    }, 500);

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
    <div className="flex h-screen items-center justify-center px-12">
      {/* Left Side - Title and Description */}
      <div className="flex w-1/2 flex-col gap-8 pl-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h1
              className={`${outfit.className} text-7xl font-bold tracking-tight text-white`}
            >
              Intelligent
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <h2
              className={`${outfit.className} text-7xl font-bold tracking-tight text-white`}
            >
              Market Analysis
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <h2
              className={`${outfit.className} text-7xl font-bold tracking-tight text-white`}
            >
              System
            </h2>
          </div>
        </div>

        <div className={`${kodeMono.className} flex flex-col gap-6`}>
          <p className="text-lg leading-relaxed text-gray-300">
            Advanced pattern recognition algorithms combined with real-time
            market data processing. Designed to identify emerging trends and
            market behaviors through statistical analysis and machine learning
            techniques.
          </p>

          {/* Update the stats cards */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            {[
              {
                icon: FaChartLine,
                label: 'Markets',
                value: '50+'
              },
              {
                icon: FaServer,
                label: 'Time Frames',
                value: '1s-1d'
              },
              {
                icon: FaCode,
                label: 'Indicators',
                value: '125+'
              },
              {
                icon: FaWaveSquare,
                label: 'Updates',
                value: 'Live'
              },
              {
                icon: FaBrain,
                label: 'Signals',
                value: '24/7'
              },
              {
                icon: FaMicrochip,
                label: 'Data Points',
                value: '1M+/s'
              },
              {
                icon: FaAtom,
                label: 'Accuracy',
                value: '99.9%'
              },
              {
                icon: FaServer,
                label: 'Exchanges',
                value: '15+'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors duration-300 hover:border-white/20"
              >
                <div className="mb-2 flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-white" />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
                <div className="text-lg font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Update the feature tags */}
          <div className="flex gap-8 text-sm">
            <div className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center gap-2">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#22c55e]/20 to-transparent opacity-0 blur transition-opacity duration-500 group-hover:opacity-100"></div>
                <FaChartLine className="relative h-4 w-4 animate-pulse text-white" />
                <span className="text-gray-300 transition-colors duration-300 group-hover:text-white">
                  Pattern Analysis
                </span>
              </div>
            </div>

            <div className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center gap-2">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#3b82f6]/20 to-transparent opacity-0 blur transition-opacity duration-500 group-hover:opacity-100"></div>
                <FaWaveSquare className="relative h-4 w-4 animate-pulse text-white" />
                <span className="text-gray-300 transition-colors duration-300 group-hover:text-white">
                  Market Trends
                </span>
              </div>
            </div>

            <div className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center gap-2">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#8b5cf6]/20 to-transparent opacity-0 blur transition-opacity duration-500 group-hover:opacity-100"></div>
                <FaRobot className="relative h-4 w-4 animate-pulse text-white" />
                <span className="text-gray-300 transition-colors duration-300 group-hover:text-white">
                  Smart Alerts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visualization and Analysis */}
      <div className="flex w-1/2 flex-col items-center justify-center gap-6">
        {/* Main Container */}
        <div className="flex w-full max-w-[700px] flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-white" />
            <span
              className={`${kodeMono.className} text-xs uppercase tracking-wider text-white`}
            >
              System Visualization
            </span>
          </div>

          <div className="grid grid-cols-[1fr_250px] gap-4">
            {/* Left Column - Pattern Table */}
            <div
              className={`${kodeMono.className} rounded-lg border border-white/10 bg-black/50 p-4 backdrop-blur-sm`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Sequence History
                  </span>
                  <span className="text-xs text-gray-400">
                    Pattern {Math.floor(demoStep / 1) + 1} of {patterns.length}
                  </span>
                </div>

                <div
                  ref={tableRef}
                  className="scrollbar-none h-[400px] overflow-y-auto"
                >
                  <table className="w-full border-separate border-spacing-1">
                    <tbody>
                      {patterns
                        .slice(
                          0,
                          (Math.floor(demoStep / 1) % patterns.length) + 1
                        )
                        .map((pattern, patternIndex) => {
                          const isCurrentPattern =
                            patternIndex ===
                            Math.floor(demoStep / 1) % patterns.length;
                          return (
                            <tr
                              key={patternIndex}
                              className={`${
                                isCurrentPattern
                                  ? 'bg-white/10'
                                  : 'hover:bg-white/5'
                              } rounded-lg transition-colors duration-200`}
                            >
                              <td className="rounded-l-lg bg-black/40 px-3 py-2 text-left text-xs text-gray-400">
                                {`Pattern ${patternIndex + 1}`}
                              </td>
                              {pattern.map((value, boxIndex) => (
                                <td
                                  key={boxIndex}
                                  className={`rounded-sm px-2 py-1 text-center ${
                                    value === 1
                                      ? 'bg-green-500/10 text-green-400'
                                      : 'bg-red-500/10 text-red-400'
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

            {/* Right Column - Box Visualization */}
            <div className="flex flex-col gap-4">
              <div className="relative h-[250px] w-[250px] rounded-lg border border-white/10 bg-black/50 backdrop-blur-sm">
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

              {/* Analysis Indicators */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftedBox;
