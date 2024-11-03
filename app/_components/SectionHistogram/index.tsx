'use client';
import type React from 'react';
import type { BoxSlice } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { sequences } from '@/app/_components/constants';
import { MotionDiv } from '@/components/MotionDiv';
import { TypeAnimation } from 'react-type-animation';
import { POSITION_STATES } from '@/app/_components/text';
import { HistoricalPatternView } from './HistoricalPatternView';
import { FaWaveSquare, FaCube, FaFingerprint, FaAtom } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface BoxComponentProps {
  slice: BoxSlice | null;
}

export const SectionHistogram: React.FC<BoxComponentProps> = ({ slice }) => {
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const totalStepsRef = useRef(sequences.length);

  const POINT_OF_CHANGE_INDEX = 29;
  const PAUSE_DURATION = 0;
  const BOX_COUNT = 8;
  const TOTAL_CONTAINER_HEIGHT = 400;
  const HEADER_HEIGHT = 32;
  const FOOTER_HEIGHT = 24;
  const AVAILABLE_HEIGHT = TOTAL_CONTAINER_HEIGHT - FOOTER_HEIGHT;
  const BOX_SIZE = Math.floor(AVAILABLE_HEIGHT / BOX_COUNT);
  const PATTERN_WIDTH = BOX_SIZE + 4;

  const dimensions = {
    totalHeight: TOTAL_CONTAINER_HEIGHT,
    headerHeight: HEADER_HEIGHT,
    footerHeight: FOOTER_HEIGHT,
    availableHeight: AVAILABLE_HEIGHT,
    boxSize: BOX_SIZE,
    patternWidth: PATTERN_WIDTH
  };

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
    }, 250);

    return () => clearInterval(interval);
  }, [demoStep, isPaused]);

  return (
    <section className="relative min-h-screen overflow-hidden pt-60 lg:px-32">
      <div className="relative flex w-full flex-col gap-24 px-8">
        <div className="relative flex flex-col items-center text-center">
          <div className="text-kodemono mb-6 flex items-center gap-3 text-sm tracking-wider text-white/60">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            FRACTAL MATHEMATICS & NATURAL FREQUENCIES
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          <h2
            className={`text-outfit text-gray-gradient relative z-10 font-bold tracking-tight lg:text-[8em] lg:leading-[1em]`}
          >
            Nature's Patterns
            <br />
            In Markets
          </h2>
          <TypeAnimation
            sequence={[
              'Discover market rhythms that mirror natural fractal patterns.',
              1000,
              '',
              100,
              'Detect harmonic frequencies hidden in price movements.',
              1000,
              '',
              100,
              'Harness the mathematical order beneath market chaos.',
              1000,
              '',
              100
            ]}
            wrapper="h2"
            speed={50}
            deletionSpeed={80}
            className={`text-kodemono text-dark-gray w-11/12 pt-6 text-xl`}
            repeat={Infinity}
          />
        </div>
        <div className="bg-black/75">
          <HistoricalPatternView
            tableRef={tableRef}
            demoStep={demoStep}
            patterns={sequences}
            dimensions={dimensions}
            onPause={() => setIsPaused(true)}
            onResume={() => setIsPaused(false)}
            onNext={() =>
              setDemoStep((prev) => (prev + 1) % totalStepsRef.current)
            }
            onPrevious={() =>
              setDemoStep(
                (prev) =>
                  (prev - 1 + totalStepsRef.current) % totalStepsRef.current
              )
            }
            isPaused={isPaused}
          />
        </div>

        <div className="w-full px-8 pt-20 lg:px-80">
          <div className="my-20 lg:px-20">
            <h2
              className={`text-outfit text-gray-gradient mb-8 text-5xl font-bold leading-tight tracking-tight lg:text-6xl`}
            >
              The Universal Language of Markets
            </h2>

            <p
              className={`text-dark-gray text-outfit mt-8 text-2xl leading-relaxed lg:text-3xl lg:leading-[1.5em]`}
            >
              Just as fractals govern the growth of trees and the rhythm of
              waves, our algorithm detects these same mathematical patterns in
              the forex, stocks and cryptocurrency markets. By analyzing natural
              frequencies and self-similar structures, we reveal the hidden
              order in seemingly random price action.
              <br></br>
              <br></br>
              Our algorithms are built on a revolutionary discovery: markets
              move in natural sequences of positions, like the phases of the
              moon or the seasons of the year. These positions flow from one to
              the next in a predictable pattern. By understanding this sequence,
              we can anticipate market movements before they occur.
              <br></br>
              <br></br>
              What you're seeing above is this sequence in action - each column
              represents a moment in time, and the colored boxes show the
              market's position state. Green indicates positive energy flow,
              while red shows resistance. This pattern repeats across all
              timeframes, from 1-minute charts to weekly views.
            </p>
          </div>

          <h2
            className={`text-outfit text-gray-gradient mb-6 mt-40 text-3xl font-bold leading-tight tracking-tight lg:text-5xl`}
          >
            How It Works
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {POSITION_STATES.map((item, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05]"
              >
                <MotionDiv
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, #22c55e15 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 100%, #22c55e15 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 0%, #22c55e15 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)'
                    ]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                <div className="absolute inset-0 opacity-10">
                  <MotionDiv
                    className="h-full w-full"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                      opacity: [0.5, 0.8]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at center, #22c55e33, transparent)',
                      filter: 'blur(40px)'
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-white/5 p-3 backdrop-blur-sm">
                        {[FaWaveSquare, FaCube, FaFingerprint, FaAtom][index]({
                          className:
                            'w-6 h-6 text-white group-hover:text-white transition-colors'
                        })}
                      </div>
                      <h3
                        className={`text-outfit text-lg font-semibold text-white/90`}
                      >
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  <div className="relative">
                    <p className="text-kodemono text-sm leading-relaxed text-white/60">
                      {item.description}
                    </p>
                    <MotionDiv
                      className="absolute bottom-0 left-0 h-[1px] w-full"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, #22c55e33, transparent)'
                      }}
                    />
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
