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
import Link from 'next/link';

interface BoxComponentProps {
  slice: BoxSlice | null;
}

export const SectionHistogram: React.FC<BoxComponentProps> = ({ slice }) => {
  const [containerHeight, setContainerHeight] = useState(200);
  const [demoStep, setDemoStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const totalStepsRef = useRef(sequences.length);

  const POINT_OF_CHANGE_INDEX = 29;
  const PAUSE_DURATION = 0;
  const BOX_COUNT = 8;
  const AVAILABLE_HEIGHT = containerHeight;
  const BOX_SIZE = Math.floor(AVAILABLE_HEIGHT / BOX_COUNT);
  const PATTERN_WIDTH = BOX_SIZE + 4;

  const dimensions = {
    totalHeight: containerHeight,
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

  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerWidth >= 1024 ? 200 : 175);
    };

    // Set initial height
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden pt-60">
      <div className="relative flex w-full flex-col gap-24">
        <div className="relative flex flex-col items-center text-center">
          <h2
            className={`text-outfit text-gray-gradient relative z-10 text-[3em] font-bold leading-[1em] tracking-tight lg:text-[7em] lg:leading-[1em]`}
          >
            The Future of
            <br />
            Market Analysis
          </h2>
          <TypeAnimation
            sequence={[
              'Discover market rhythms that mirror natural fractal patterns.',
              1000,
              '',
              1000,
              'Detect harmonic frequencies hidden in typical time based charts.',
              1000,
              '',
              1000,
              'Harness the hidden order to technical analysis.',
              1000,
              '',
              1000
            ]}
            wrapper="h2"
            speed={50}
            deletionSpeed={80}
            className={`text-kodemono text-dark-gray lg;text-3xl mb-6 w-11/12 pt-6 text-lg`}
            repeat={Infinity}
          />

          <div className="mt-6 flex gap-6">
            <Link
              href="#pricing"
              className="text-kodemono group relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#6EE7B7] px-4 py-2 text-lg text-xl font-bold text-black transition-all duration-500 hover:scale-[1.02] lg:px-8 lg:py-4 lg:text-2xl"
            >
              Start Now
            </Link>
            <Link
              href="/algorithm"
              className="text-kodemono border-gray group relative flex items-center justify-center overflow-hidden rounded-lg border px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-[#34D399]/30 lg:px-8 lg:py-4 lg:text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="w-full bg-black/75 px-[10vw] px-[5vw]">
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
      </div>
    </section>
  );
};
