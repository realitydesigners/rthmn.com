'use client';
import type React from 'react';
import type { BoxSlice } from '@/types/types';
import { useState, useEffect, useRef } from 'react';
import { sequences } from '@/components/Constants/constants';
import { HistoricalPatternView } from './HistoricalPatternView';
import { StartButton } from '@/components/Buttons/StartNowButton';

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
  const PATTERN_WIDTH = BOX_SIZE;

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
    }, 50);

    return () => clearInterval(interval);
  }, [demoStep, isPaused]);

  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerWidth >= 1024 ? 150 : 100);
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
            className={`text-gray-gradient relative z-10 font-outfit text-[3em] font-bold leading-[1em] tracking-tight lg:text-[7em] lg:leading-[1em]`}
          >
            The Future of
            <br />
            Market Analysis
          </h2>
          <p
            className={`text-dark-gray mb-6 w-11/12 pt-6 font-kodemono text-lg lg:text-xl`}
          >
            The universal pattern recognition toolkit designed for trading.
          </p>

          <div className="mt-6 flex gap-6">
            <StartButton href="#pricing" custom={0} />
          </div>
        </div>

        <div className="w-full bg-black/75 px-[0vw] lg:px-[10vw]">
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
