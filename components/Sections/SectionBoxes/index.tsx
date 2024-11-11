'use client';
import type React from 'react';
import type { BoxSlice } from '@/types/types';
import { useState, useEffect, useRef } from 'react';
import {
  sequences,
  createDemoStep,
  createMockBoxData
} from '@/app/constants/constants';
import { NestedBoxes } from '@/components/NestedBoxes';
import { FEATURE_TAGS } from '@/app/constants/text';
import { MotionDiv } from '@/components/MotionDiv';

const POINT_OF_CHANGE_INDEX = 29;
const PAUSE_DURATION = 5000;
const BASE_VALUES = [2000, 1732, 1500, 1299, 1125, 974, 843, 730];

interface BoxComponentProps {
  slice: BoxSlice | null;
}

const FeatureTags = () => (
  <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm lg:justify-start lg:gap-6">
    {FEATURE_TAGS.map((feature, index) => (
      <MotionDiv
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        key={index}
        className="group flex cursor-pointer items-center gap-2 sm:gap-3"
      >
        <div className="items-centergap-1.5 relative flex">
          <div className="absolute -inset-0.5 rounded-full bg-[#22c55e]/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
          <feature.icon className="relative mr-2 h-3 w-3 text-white sm:h-4 sm:w-4" />
          <span className="text-kodemono text-white/60 transition-colors duration-300 group-hover:text-white">
            {feature.text}
          </span>
        </div>
      </MotionDiv>
    ))}
  </div>
);

const BoxVisualization = ({ currentSlice, demoStep, isPaused }) => {
  const [baseSize, setBaseSize] = useState(250);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setBaseSize(400);
      } else if (window.innerWidth >= 640) {
        setBaseSize(300);
      } else {
        setBaseSize(250);
      }
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative h-[250px] w-[250px] rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm sm:h-[300px] sm:w-[300px] lg:h-[400px] lg:w-[400px]">
      <MotionDiv
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, #22c55e15 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

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
            baseSize={baseSize}
            colorScheme="green-red"
          />
        </div>
      )}
    </div>
  );
};

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
    }, 150);

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
    <section className="relative h-full w-full px-4 py-16 sm:px-8 lg:px-[10vw] lg:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#22c55e]/[0.03] via-transparent to-transparent blur-xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="flex flex-col justify-center">
            <div className="text-kodemono mb-4 flex items-center gap-3 text-xs tracking-wider text-white/60 sm:mb-6 sm:text-sm">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent sm:w-12" />
              MARKET INTELLIGENCE SYSTEM
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent sm:w-12" />
            </div>

            <h2 className="text-outfit text-gray-gradient mb-4 text-4xl font-bold leading-tight tracking-tight sm:mb-8 sm:text-5xl lg:text-6xl">
              Natural Pattern
              <br />
              Recognition
            </h2>

            <p className="text-kodemono mb-8 text-base leading-relaxed text-white/60 sm:mb-12 sm:text-lg">
              Discover hidden market patterns through advanced mathematics.
            </p>

            {/* Box Visualization for mobile only - appears after title */}
            <div className="my-12 flex items-center justify-center lg:hidden">
              <BoxVisualization
                currentSlice={currentSlice}
                demoStep={demoStep}
                isPaused={isPaused}
              />
            </div>

            <FeatureTags />
          </div>

          {/* Box Visualization for desktop only - appears in right column */}
          <div className="hidden items-center justify-center lg:flex">
            <BoxVisualization
              currentSlice={currentSlice}
              demoStep={demoStep}
              isPaused={isPaused}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
