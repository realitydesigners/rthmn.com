'use client';
import type React from 'react';
import { outfit, kodeMono } from '@/fonts';
import type { BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { getAnimationSequence, sequences } from '@/app/_components/constants';
import { MotionDiv } from '@/components/MotionDiv';
import { TypeAnimation } from 'react-type-animation';

const POINT_OF_CHANGE_INDEX = 29;
const PAUSE_DURATION = 5000;
const BOX_COUNT = 8;

interface BoxComponentProps {
  slice: BoxSlice | null;
}

const HistoricalPatternView = ({ tableRef, demoStep, patterns }) => {
  const animationSequence = getAnimationSequence();
  const currentSequenceIndex = Math.floor(demoStep / 1) % patterns.length;

  const TOTAL_CONTAINER_HEIGHT = 400;
  const HEADER_HEIGHT = 32;
  const FOOTER_HEIGHT = 24;
  const AVAILABLE_HEIGHT =
    TOTAL_CONTAINER_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;
  const BOX_SIZE = Math.floor(AVAILABLE_HEIGHT / BOX_COUNT);
  const PATTERN_WIDTH = BOX_SIZE + 4;

  return (
    <div className="space-y-8">
      <div
        className={`text-kodemono relative w-full rounded-xl border border-white/5 bg-black/30 p-6 backdrop-blur-lg`}
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
                      {sequence.positions.map(
                        ({ boxNumber, position, isUp }) => (
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
                              transition:
                                'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
                              {`${isUp ? '' : '-'}${boxNumber}`}
                            </div>
                          </div>
                        )
                      )}
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
    </div>
  );
};

export const SectionHistogram: React.FC<BoxComponentProps> = ({ slice }) => {
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const totalStepsRef = useRef(sequences.length);

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

  return (
    <section className="relative min-h-screen overflow-hidden bg-black py-32 lg:px-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent"></div>
      <div className="relative flex w-full flex-col gap-24 px-8">
        <div className="relative flex flex-col items-center text-center">
          <div className="text-kodemono mb-6 flex items-center gap-3 text-sm tracking-wider text-white/60">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            ADVANCED PATTERN RECOGNITION
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          <h2
            className={`text-outfit text-gradient relative z-10 text-7xl font-bold leading-tight tracking-tight`}
          >
            The Future of
            <br />
            Financial Analysis
          </h2>
          <TypeAnimation
            sequence={[
              'Uncover hidden patterns in market data with 3D visualization.',
              1000,
              '',
              100,
              'Predict market trends with a futuristic chart analysis tool.',
              1000,
              '',
              100,
              'Optimize your trading strategy with real-time chart indicators.',
              1000,
              '',
              100
            ]}
            wrapper="h2"
            speed={50}
            deletionSpeed={80}
            className={`text-kodemono w-11/12 pt-6 text-xl`}
            repeat={Infinity}
          />
        </div>
        <HistoricalPatternView
          tableRef={tableRef}
          demoStep={demoStep}
          patterns={sequences}
        />
      </div>
      {/* Position States Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-16 text-center">
            <div
              className={`text-kodemono text-kodemono text-gray mb-6 flex items-center justify-center gap-3 text-sm tracking-wider`}
            >
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              POSITION STATES
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <h2
              className={`text-gradient text-outfit mb-8 from-white via-white to-white/60 text-4xl font-bold tracking-tight lg:text-5xl`}
            >
              8-Dimensional Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                state: 'P1',
                name: 'Accumulation Base',
                description: 'Initial position building phase'
              },
              {
                state: 'P2',
                name: 'Early Momentum',
                description: 'First signs of directional bias'
              },
              {
                state: 'P3',
                name: 'Momentum Acceleration',
                description: 'Increased position commitment'
              },
              {
                state: 'P4',
                name: 'Peak Extension',
                description: 'Maximum position extension'
              },
              {
                state: 'P5',
                name: 'Initial Reversal',
                description: 'First signs of position unwinding'
              },
              {
                state: 'P6',
                name: 'Momentum Shift',
                description: 'Clear change in position bias'
              },
              {
                state: 'P7',
                name: 'Distribution Phase',
                description: 'Advanced position unwinding'
              },
              {
                state: 'P8',
                name: 'Reset State',
                description: 'Return to neutral positioning'
              }
            ].map((item, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-lg border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="rounded-full bg-white/10 p-3">
                    <div
                      className={`text-kodemono text-lg font-bold text-white/80`}
                    >
                      {item.state}
                    </div>
                  </div>
                  <h3
                    className={`text-outfit text-lg font-semibold text-white/90`}
                  >
                    {item.name}
                  </h3>
                </div>
                <p className="text-kodemono text-sm text-white/60">
                  {item.description}
                </p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};
