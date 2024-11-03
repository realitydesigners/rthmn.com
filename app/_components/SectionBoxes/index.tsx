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
import { MotionDiv } from '@/components/MotionDiv';
import { TypeAnimation } from 'react-type-animation';

const POINT_OF_CHANGE_INDEX = 29;
const PAUSE_DURATION = 5000;
const BASE_VALUES = [2000, 1732, 1500, 1299, 1125, 974, 843, 730];

interface BoxComponentProps {
  slice: BoxSlice | null;
}

const StatsGrid = () => (
  <div className="mb-6 grid grid-cols-4 gap-4">
    {STATS_DATA.map((item, index) => (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        key={index}
        className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05]"
      >
        {/* Flowing Radial Effect */}
        <MotionDiv
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, #22c55e15 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <item.icon className="h-4 w-4 text-white" />
            <span className="text-kodemono text-xs text-white/60">
              {item.label}
            </span>
          </div>
          <div className="text-outfit text-lg font-bold text-white/90">
            {item.value}
          </div>
        </div>
      </MotionDiv>
    ))}
  </div>
);

const FeatureTags = () => (
  <div className="flex gap-8 text-sm">
    {FEATURE_TAGS.map((feature, index) => (
      <MotionDiv
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        key={index}
        className="group flex cursor-pointer items-center gap-3"
      >
        <div className="relative flex items-center gap-2">
          <div className="absolute -inset-0.5 rounded-full bg-[#22c55e]/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
          <feature.icon className="relative h-4 w-4 text-white" />
          <span className="text-kodemono text-white/60 transition-colors duration-300 group-hover:text-white">
            {feature.text}
          </span>
        </div>
      </MotionDiv>
    ))}
  </div>
);

const BoxVisualization = ({ currentSlice, demoStep, isPaused }) => (
  <div className="relative h-[400px] w-[400px] rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm">
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
          baseSize={400}
          colorScheme="green-red"
        />
      </div>
    )}
  </div>
);

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
    <section className="relative h-full w-full py-60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#22c55e]/[0.03] via-transparent to-transparent blur-xl" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-24 px-8">
        <div className="flex flex-col justify-center">
          <div className="text-kodemono mb-6 flex items-center gap-3 text-sm tracking-wider text-white/60">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            MARKET INTELLIGENCE SYSTEM
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <h2 className="text-outfit text-gray-gradient mb-8 text-7xl font-bold leading-tight tracking-tight">
            Natural Pattern
            <br />
            Recognition
          </h2>

          <TypeAnimation
            sequence={[
              'Discover hidden market patterns through advanced mathematics.',
              1000,
              'Transform complexity into clear trading signals.',
              1000,
              'Trade with the natural flow of the markets.',
              1000
            ]}
            wrapper="p"
            speed={50}
            className="text-kodemono mb-12 text-lg leading-relaxed text-white/60"
            repeat={Infinity}
          />

          <StatsGrid />
          <FeatureTags />
        </div>

        <div className="flex items-center justify-center">
          <BoxVisualization
            currentSlice={currentSlice}
            demoStep={demoStep}
            isPaused={isPaused}
          />
        </div>
      </div>
    </section>
  );
};
