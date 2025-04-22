'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { sequences } from '@/components/Constants/constants';
import { Histogram } from './Histogram';
import { FaCrosshairs, FaLayerGroup, FaSignal } from 'react-icons/fa';

// Define histogramBenefits constant here
const histogramBenefits = [
    {
        icon: FaLayerGroup,
        title: 'Pinpoint Key Levels',
        description: 'Instantly see high-volume nodes acting as crucial support and resistance zones.',
    },
    {
        icon: FaSignal,
        title: 'Gauge Market Strength',
        description: 'Understand where conviction lies by visualizing volume concentration at specific price points.',
    },
    {
        icon: FaCrosshairs,
        title: 'Spot Activity Hotspots',
        description: 'Identify price levels with the most trading activity, revealing areas of high interest.',
    },
];

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
        <section className='relative overflow-hidden bg-black py-16 text-center sm:py-24'>
            {/* Text Content Container */}
            <div className='mx-auto mb-12 max-w-3xl px-4 sm:px-6 lg:px-8'>
                <h2 className='font-outfit text-gray-gradient relative mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl'>Visualize Market Dynamics</h2>
                <p className='font-outfit text-md mx-auto mt-4 max-w-2xl text-gray-400 sm:text-lg lg:text-xl'>
                    Dive deep into order flow with our volume profile histogram. Identify key support/resistance levels and understand market conviction at a glance.
                </p>
            </div>

            {/* Histogram Container - Add relative positioning for overlay */}
            <div className='relative mx-auto w-full max-w-7xl rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg lg:px-[5vw]'>
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
                {/* Gradient Overlay */}
                <div className='pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent'></div>
            </div>

            {/* Benefits Section */}
            <div className='mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8'>
                {histogramBenefits.map((benefit) => (
                    <div key={benefit.title} className='text-center'>
                        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-800'>
                            <benefit.icon className='h-6 w-6 text-gray-400' aria-hidden='true' />
                        </div>
                        <h3 className='font-outfit mt-6 text-lg font-semibold text-white'>{benefit.title}</h3>
                        <p className='mt-2 text-base text-gray-400'>{benefit.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
