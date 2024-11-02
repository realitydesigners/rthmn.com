'use client';
import type React from 'react';
import { outfit, kodeMono } from '@/fonts';
import type { Box, BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { getAnimationSequence, sequences } from './sequences';
import { NestedBoxes } from '@/components/NestedBoxes';

// Constants
const POINT_OF_CHANGE_INDEX = 29;
const PAUSE_DURATION = 5000;
const BOX_COUNT = 8;
const BASE_VALUES = [2000, 1732, 1500, 1299, 1125, 974, 843, 730];

// Updated Constants with pattern recognition focus
const INNOVATION_POINTS = [
  {
    title: 'Wave Pattern Detection',
    description:
      'Identifies complex market wave formations through proprietary position-based analysis, revealing hidden market structure',
    metric: '8x',
    metricLabel: 'Depth Analysis'
  },
  {
    title: 'Momentum Sequencing',
    description:
      'Tracks nested position changes to predict market momentum shifts before they occur in traditional indicators',
    metric: '< 50ms',
    metricLabel: 'Detection'
  },
  {
    title: 'Propagation Analysis',
    description:
      'Maps energy flow through market positions, identifying key reversal points and continuation patterns',
    metric: '99.9%',
    metricLabel: 'Accuracy'
  }
];

// Types
interface BoxComponentProps {
  slice: BoxSlice | null;
  isLoading: boolean;
}

// Helper Functions
const createDemoStep = (
  step: number,
  patterns: number[][],
  baseValues: number[]
) => {
  const patternIndex = Math.floor(step / 1) % patterns.length;
  const pattern = patterns[patternIndex];

  return baseValues.slice(0, BOX_COUNT).map((value, index) => {
    if (index >= pattern.length) return value;
    return value * pattern[index];
  });
};

const createMockBoxData = (values: number[]): Box[] => {
  return values.map((value) => ({
    high: Math.abs(value) + 200,
    low: Math.abs(value) - 200,
    value: value
  }));
};

// Updated UI Components
const Title = () => (
  <div className="relative flex flex-col items-center text-center">
    <div
      className={`${kodeMono.className} mb-6 flex items-center gap-3 text-sm tracking-wider text-white/60`}
    >
      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      ADVANCED PATTERN RECOGNITION
      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
    <h2
      className={`${outfit.className} relative z-10 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-7xl font-bold leading-tight tracking-tight text-transparent`}
    >
      Market Structure
      <br />
      Visualized
    </h2>
    <div className="mt-12 flex gap-16">
      {[
        { label: 'Pattern Detection', value: '94.3%' },
        { label: 'Position Changes', value: '2.5K+' },
        { label: 'Wave Accuracy', value: '11.2x' }
      ].map((stat, i) => (
        <div key={i} className="text-center">
          <div
            className={`${kodeMono.className} mb-2 text-2xl font-bold text-white/90`}
          >
            {stat.value}
          </div>
          <div className={`${kodeMono.className} text-sm text-white/40`}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InnovationPoint = ({ point, index }) => (
  <div className="group relative">
    <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-white/5 to-transparent opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100"></div>
    <div className="relative flex items-start gap-8 rounded-lg border border-white/5 bg-black/30 p-8 backdrop-blur-lg transition-all duration-300 hover:border-white/10 hover:bg-black/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-transparent">
        <span
          className={`${kodeMono.className} text-xl font-bold text-white/80`}
        >
          {(index + 1).toString().padStart(2, '0')}
        </span>
      </div>
      <div className="flex-1">
        <div className="mb-3 flex items-center justify-between">
          <h3
            className={`${outfit.className} text-2xl font-semibold text-white/90`}
          >
            {point.title}
          </h3>
          <div className="text-right">
            <div
              className={`${kodeMono.className} text-3xl font-bold text-white/90`}
            >
              {point.metric}
            </div>
            <div className="text-sm font-medium text-white/40">
              {point.metricLabel}
            </div>
          </div>
        </div>
        <p className="text-[15px] leading-relaxed text-white/60">
          {point.description}
        </p>
      </div>
    </div>
  </div>
);

const VisualizationSection = ({ currentSlice, demoStep, isPaused }) => (
  <div className="relative aspect-square w-full">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-[600px] w-[600px]">
        <div className="animate-pulse-slow absolute inset-0 -z-10 rounded-full bg-white/5 blur-3xl"></div>
        <div className="animate-pulse-slow bg-white/2 absolute inset-0 -z-10 rounded-full blur-2xl"></div>
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
            />
          </div>
        )}
      </div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>
  </div>
);

// Update the HistoricalPatternView component
const HistoricalPatternView = ({ tableRef, demoStep, patterns }) => {
  const animationSequence = getAnimationSequence();
  const currentSequenceIndex = Math.floor(demoStep / 1) % patterns.length;

  // Height calculations
  const TOTAL_CONTAINER_HEIGHT = 400;
  const HEADER_HEIGHT = 32;
  const FOOTER_HEIGHT = 24;
  const AVAILABLE_HEIGHT =
    TOTAL_CONTAINER_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;
  const BOX_SIZE = Math.floor(AVAILABLE_HEIGHT / BOX_COUNT);
  const PATTERN_WIDTH = BOX_SIZE + 4;

  return (
    <div
      className={`${kodeMono.className} relative w-full rounded-xl border border-white/5 bg-black/30 p-6 backdrop-blur-lg`}
      style={{ height: `${TOTAL_CONTAINER_HEIGHT}px` }}
    >
      <div
        className="mb-4 flex items-center justify-between"
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <span className="text-xs text-white/60">Pattern History</span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
          {currentSequenceIndex + 1} / {patterns.length}
        </span>
      </div>

      {/* Wrapper div for horizontal scroll */}
      <div className="overflow-x-auto">
        <div
          ref={tableRef}
          className="relative flex"
          style={{
            height: `${AVAILABLE_HEIGHT}px`,
            width: `${PATTERN_WIDTH * animationSequence.length}px`
          }}
        >
          {animationSequence
            .slice(0, currentSequenceIndex + 1)
            .map((sequence, patternIndex) => {
              const isCurrentPattern = patternIndex === currentSequenceIndex;

              return (
                <div
                  key={patternIndex}
                  className={`relative flex-shrink-0 ${
                    isCurrentPattern ? 'opacity-100' : 'opacity-60'
                  }`}
                  style={{
                    width: `${PATTERN_WIDTH}px`,
                    height: `${AVAILABLE_HEIGHT}px`
                  }}
                >
                  <div
                    className="relative"
                    style={{ height: `${AVAILABLE_HEIGHT}px` }}
                  >
                    {sequence.positions.map(({ boxNumber, position, isUp }) => (
                      <div
                        key={boxNumber}
                        className="absolute left-0 transition-all duration-500"
                        style={{
                          width: `${BOX_SIZE}px`,
                          height: `${BOX_SIZE}px`,
                          bottom: `${position * BOX_SIZE}px`,
                          background: isUp
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(0,0,0,0.4)',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          left: '2px'
                        }}
                      >
                        <div
                          className="absolute inset-0 flex items-center justify-center text-white/40"
                          style={{
                            fontSize: `${BOX_SIZE * 0.4}px`
                          }}
                        >
                          {boxNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="absolute text-center text-[10px] text-white/40"
                    style={{
                      width: `${PATTERN_WIDTH}px`,
                      bottom: `-${FOOTER_HEIGHT}px`,
                      height: `${FOOTER_HEIGHT}px`,
                      lineHeight: `${FOOTER_HEIGHT}px`
                    }}
                  >
                    {(patternIndex + 1).toString().padStart(2, '0')}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// Main Component
export const SectionBoxes2: React.FC<BoxComponentProps> = ({
  slice,
  isLoading
}) => {
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
    <section className="relative min-h-screen overflow-hidden bg-black py-32 lg:px-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent"></div>
      <div className="relative flex w-full flex-col gap-24 px-8">
        <Title />
        <HistoricalPatternView
          tableRef={tableRef}
          demoStep={demoStep}
          patterns={sequences}
        />
        <div className="grid grid-cols-[1fr_600px] gap-16">
          <div className="flex flex-col gap-6 py-12">
            {INNOVATION_POINTS.map((point, index) => (
              <InnovationPoint key={index} point={point} index={index} />
            ))}
          </div>
          <div className="flex flex-col gap-8">
            <VisualizationSection
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
