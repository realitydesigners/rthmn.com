'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { sequences } from '@/app/_components/constants/constants';
import { Histogram } from './Histogram';

export const SectionHistogram = () => {
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
        patternWidth: PATTERN_WIDTH,
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
        <section className='relative overflow-hidden'>
            <div className='w-full bg-black px-[0vw] lg:px-[10vw]'>
                <Histogram
                    tableRef={tableRef}
                    demoStep={demoStep}
                    patterns={sequences}
                    dimensions={dimensions}
                    onPause={() => setIsPaused(true)}
                    onResume={() => setIsPaused(false)}
                    onNext={() => setDemoStep((prev) => (prev + 1) % totalStepsRef.current)}
                    onPrevious={() => setDemoStep((prev) => (prev - 1 + totalStepsRef.current) % totalStepsRef.current)}
                    isPaused={isPaused}
                />
            </div>
        </section>
    );
};
