'use client';
import type React from 'react';
import type { BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';
import {
  sequences,
  createDemoStep,
  createMockBoxData
} from '@/app/_components/constants';
import { NestedBoxes } from '@/components/NestedBoxes';
import { STATS_DATA, FEATURE_TAGS } from '@/app/_components/text';

const POINT_OF_CHANGE_INDEX = 29;
const PAUSE_DURATION = 5000;
const BASE_VALUES = [2000, 1732, 1500, 1299, 1125, 974, 843, 730];

interface BoxComponentProps {
  slice: BoxSlice | null;
}

const StatsGrid = () => (
  <div className="mb-6 grid grid-cols-4 gap-4">
    {STATS_DATA.map((item, index) => (
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
);

const FeatureTags = () => (
  <div className="flex gap-8 text-sm">
    {FEATURE_TAGS.map((feature, index) => (
      <div key={index} className="group flex cursor-pointer items-center gap-3">
        <div className="relative flex items-center gap-2">
          <div
            className={`absolute -inset-0.5 rounded-full bg-gradient-to-r from-[${feature.color}]/20 to-transparent opacity-0 blur transition-opacity duration-500 group-hover:opacity-100`}
          ></div>
          <feature.icon className="relative h-4 w-4 animate-pulse text-white" />
          <span className="text-gray-300 transition-colors duration-300 group-hover:text-white">
            {feature.text}
          </span>
        </div>
      </div>
    ))}
  </div>
);

const BoxVisualization = ({ currentSlice, demoStep, isPaused }) => (
  <div className="relative h-[250px] w-[250px] rounded-lg border border-white/10 bg-black/50 backdrop-blur-sm">
    {currentSlice && currentSlice.boxes.length > 0 && (
      <div className="relative h-full w-full">
        <NestedBoxes
          boxes={currentSlice.boxes.sort(
            (a, b) => Math.abs(b.value) - Math.abs(a.value)
          )}
          demoStep={demoStep}
          isPaused={isPaused}
          isPointOfChange={
            Math.floor(demoStep / 1) % sequences.length ===
            POINT_OF_CHANGE_INDEX
          }
          baseSize={250}
          colorScheme="green-red"
        />
      </div>
    )}
  </div>
);

// Main Component
export const SectionBoxes: React.FC<BoxComponentProps> = ({ slice }) => {
  // State
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const totalStepsRef = useRef(sequences.length);

  // Auto-scroll effect
  useEffect(() => {
    if (tableRef.current) {
      const scrollContainer = tableRef.current;
      const currentRow = scrollContainer.querySelector('.current-pattern-row');
      if (currentRow) {
        currentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [demoStep]);

  // Animation interval effect
  useEffect(() => {
    const interval = setInterval(() => {
      const currentPatternIndex = Math.floor(demoStep / 1) % sequences.length;

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

  // Data preparation
  const currentValues = createDemoStep(demoStep, sequences, BASE_VALUES);
  const mockBoxData = createMockBoxData(currentValues);
  const currentSlice = slice || {
    timestamp: new Date().toISOString(),
    boxes: mockBoxData
  };

  return (
    <section className="flex h-screen items-center justify-center px-12">
      {/* Left Column */}
      <div className="flex w-1/2 flex-col gap-8 pl-16">
        <div className="flex items-center gap-4">
          <h1
            className={`text-outfit text-7xl font-bold leading-[.75em] tracking-tight text-white`}
          >
            Intelligent
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <h2
            className={`text-outfit text-7xl font-bold leading-[.75em] tracking-tight text-white`}
          >
            Market Analysis
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <h2
            className={`text-outfit text-7xl font-bold leading-[.75em] tracking-tight text-white`}
          >
            System
          </h2>
        </div>
        <div className={`text-kodemono flex flex-col gap-6`}>
          <p className="text-lg leading-relaxed text-gray-300">
            Advanced pattern recognition algorithms combined with real-time
            market data processing. Designed to identify emerging trends and
            market behaviors through statistical analysis and machine learning
            techniques.
          </p>
          <StatsGrid />
          <FeatureTags />
        </div>
      </div>
      <div className="flex w-1/2 flex-col items-center justify-center gap-6">
        <div className="flex w-full max-w-[700px] flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-white" />
            <span
              className={`text-kodemono text-xs uppercase tracking-wider text-white`}
            >
              System Visualization
            </span>
          </div>

          <div className="grid grid-cols-[1fr_250px] gap-4">
            <div className="flex flex-col gap-4">
              <BoxVisualization
                currentSlice={currentSlice}
                demoStep={demoStep}
                isPaused={isPaused}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
