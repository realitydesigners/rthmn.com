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
        colorScheme?: 'green-red' | 'white-gradient';
        animationSpeed?: number;
        pauseDuration?: number;
        title?: string;
        description?: string;
        showLabels?: boolean;
        mode?: 'animated' | 'static';
        sequencesData?: string;
        baseValuesData?: string;
        pointOfChangeIndex?: number;
    };
}

interface BoxVisualizationProps {
    currentSlice: BoxSlice;
    demoStep: number;
    isPaused: boolean;
    colorScheme?: ColorScheme;
    showLabels?: boolean;
}

// Memoize BoxVisualization component
const BoxVisualization = memo(({ currentSlice, demoStep, isPaused, colorScheme = 'green-red', showLabels }: BoxVisualizationProps) => {
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
        <div className='w-full'>
            {currentSlice && sortedBoxes.length > 0 && (
                <div className='relative h-full w-full'>
                    <NestedBoxes
                        boxes={sortedBoxes}
                        demoStep={demoStep}
                        isPaused={isPaused}
                        isPointOfChange={isPointOfChange}
                        baseSize={baseSize}
                        colorScheme={colorScheme}
                        showLabels={showLabels}
                    />
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

    // Parse sequences from JSON string or use defaults
    const activeSequences = useMemo(() => {
        if (!value.sequencesData) return sequences;
        try {
            // Split by newlines and parse each line as an array
            const lines = value.sequencesData
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line && !line.includes('//')) // Remove empty lines and comments
                .map((line) => {
                    // Extract the array part and parse it
                    const match = line.match(/\[(.*?)\]/);
                    if (!match) return null;
                    return match[1].split(',').map((num) => parseInt(num.trim(), 10));
                })
                .filter((arr) => arr && arr.length === 8); // Ensure valid arrays only
            return lines.length > 0 ? lines : sequences;
        } catch (error) {
            console.warn('Error parsing sequences data:', error);
            return sequences;
        }
    }, [value.sequencesData]);

    // Parse base values from string or use defaults
    const activeBaseValues = useMemo(() => {
        if (!value.baseValuesData) return BASE_VALUES;
        try {
            // Split by commas and parse each number
            const values = value.baseValuesData
                .split(',')
                .map((num) => parseFloat(num.trim()))
                .filter((num) => !isNaN(num));
            return values.length === 8 ? values : BASE_VALUES;
        } catch (error) {
            console.warn('Error parsing base values:', error);
            return BASE_VALUES;
        }
    }, [value.baseValuesData]);

    const totalStepsRef = useRef(activeSequences.length);

    const currentSlice = useMemo(() => {
        const currentValues = createDemoStep(demoStep, activeSequences, activeBaseValues);
        const mockBoxData = createMockBoxData(currentValues);
        // Ensure boxes are sorted by absolute value in descending order
        const sortedBoxes = mockBoxData.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        return {
            timestamp: new Date().toISOString(),
            boxes: sortedBoxes,
        };
    }, [demoStep, activeSequences, activeBaseValues]);

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
        if (value.mode === 'static') return; // Don't animate in static mode

        const interval = setInterval(() => {
            const currentPatternIndex = Math.floor(demoStep / 1) % activeSequences.length;

            if (currentPatternIndex === activeSequences.length - 1 && !isPaused) {
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
    }, [demoStep, isPaused, value.animationSpeed, value.pauseDuration, value.mode, activeSequences]);

    return (
        <div className='flex h-full w-full flex-col items-center justify-center space-y-6 py-8'>
            {value.title && <h3 className='font-outfit text-center text-xl font-semibold text-white'>{value.title}</h3>}
            {value.description && <p className='font-outfit max-w-2xl text-center text-base text-gray-400'>{value.description}</p>}
            <div className='relative flex h-[400px] w-[400px] items-center justify-center'>
                <NestedBoxes
                    boxes={currentSlice.boxes}
                    demoStep={demoStep}
                    isPaused={isPaused}
                    colorScheme={value.colorScheme}
                    showLabels={value.showLabels}
                    mode={value.mode || 'animated'}
                    baseSize={400}
                    containerClassName='flex items-center justify-center'
                    isPointOfChange={Math.floor(demoStep / 1) % activeSequences.length === (value.pointOfChangeIndex || POINT_OF_CHANGE_INDEX)}
                />
            </div>
        </div>
    );
};

export default memo(BoxCourseVisualizer);
