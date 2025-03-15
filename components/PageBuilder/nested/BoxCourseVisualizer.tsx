'use client';

import type React from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BASE_VALUES, createDemoStep, createMockBoxData, sequences } from '@/components/Constants/constants';
import { FEATURE_TAGS } from '@/components/Constants/text';
import { NestedBoxes } from '@/components/Charts/NestedBoxes';
import type { BoxSlice } from '@/types/types';

const POINT_OF_CHANGE_INDEX = 29;

type ColorScheme = 'green-red' | 'white-gradient';

// Memoize FeatureTags component
const FeatureTags = memo(() => (
    <div className='font-outfit flex flex-wrap justify-center gap-4 text-xs sm:text-sm lg:justify-start lg:gap-6'>
        {FEATURE_TAGS.map((feature, index) => (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={index}
                className='group flex cursor-pointer items-center gap-2 sm:gap-3'>
                <div className='items-centergap-1.5 relative flex'>
                    <div className='absolute -inset-0.5 rounded-full bg-[#22c55e]/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100' />
                    <feature.icon className='relative mr-2 h-3 w-3 text-white sm:h-4 sm:w-4' />
                    <span className='font-kodemono text-gray-400 transition-colors duration-300 group-hover:text-white'>{feature.text}</span>
                </div>
            </motion.div>
        ))}
    </div>
));

FeatureTags.displayName = 'FeatureTags';

interface BoxVisualizerProps {
    value: {
        colorScheme?: ColorScheme;
        animationSpeed?: number;
        pauseDuration?: number;
    };
}

interface BoxVisualizationProps {
    currentSlice: BoxSlice;
    demoStep: number;
    isPaused: boolean;
    colorScheme?: ColorScheme;
}

// Memoize BoxVisualization component
const BoxVisualization = memo(({ currentSlice, demoStep, isPaused, colorScheme = 'green-red' }: BoxVisualizationProps) => {
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
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sortedBoxes = useMemo(() => {
        return currentSlice?.boxes?.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) || [];
    }, [currentSlice]);

    const isPointOfChange = useMemo(() => {
        return Math.floor(demoStep / 1) % sequences.length === POINT_OF_CHANGE_INDEX;
    }, [demoStep]);

    return (
        <div className='relative h-[250px] w-[250px] rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm sm:h-[300px] sm:w-[300px] lg:h-[400px] lg:w-[400px]'>
            <motion.div
                className='absolute inset-0'
                animate={{
                    background: [
                        'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 100% 100%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)',
                    ],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />

            {currentSlice && sortedBoxes.length > 0 && (
                <div className='relative h-full w-full'>
                    <NestedBoxes boxes={sortedBoxes} demoStep={demoStep} isPaused={isPaused} isPointOfChange={isPointOfChange} baseSize={baseSize} colorScheme={colorScheme} />
                </div>
            )}
        </div>
    );
});

BoxVisualization.displayName = 'BoxVisualization';

const BoxCourseVisualizer = ({ value }: BoxVisualizerProps) => {
    const [demoStep, setDemoStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);
    const totalStepsRef = useRef(sequences.length);

    const currentSlice = useMemo(() => {
        const currentValues = createDemoStep(demoStep, sequences, BASE_VALUES);
        const mockBoxData = createMockBoxData(currentValues);
        return {
            timestamp: new Date().toISOString(),
            boxes: mockBoxData,
        };
    }, [demoStep]);

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
                }, value.pauseDuration || 5000);
                return;
            }

            if (!isPaused) {
                setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
            }
        }, value.animationSpeed || 150);

        return () => clearInterval(interval);
    }, [demoStep, isPaused, value.animationSpeed, value.pauseDuration]);

    return (
        <section className='flex w-full items-center justify-center'>
            <BoxVisualization currentSlice={currentSlice} demoStep={demoStep} isPaused={isPaused} colorScheme={value.colorScheme} />
        </section>
    );
};

export default memo(BoxCourseVisualizer);
