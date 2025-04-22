'use client';

import type React from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BASE_VALUES, createDemoStep, createMockBoxData, sequences } from '@/components/Constants/constants';
import { FEATURE_TAGS } from '@/components/Constants/text';
import { NestedBoxes } from '@/components/Charts/NestedBoxes';
import { BoxSlice } from '@/types/types';

const POINT_OF_CHANGE_INDEX = 29;
const PAUSE_DURATION = 5000;

const StarField = () => {
    const [mounted, setMounted] = useState(false);
    const [stars, setStars] = useState<
        Array<{
            id: number;
            x: number;
            y: number;
            size: number;
            duration: number;
            delay: number;
        }>
    >([]);

    useEffect(() => {
        const generateStars = () => {
            const newStars = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: 1 + Math.random() * 2,
                duration: 15 + Math.random() * 20,
                delay: Math.random() * -15,
            }));
            setStars(newStars);
        };

        generateStars();
        setMounted(true);

        const handleResize = () => {
            generateStars();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) return null;

    return (
        <div className='absolute inset-0 overflow-hidden'>
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    initial={{
                        opacity: 0.1,
                        x: star.x,
                        y: star.y,
                    }}
                    animate={{
                        opacity: [0.1, 0.5, 0.1],
                        y: [star.y, -100],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                    }}
                    className='absolute'>
                    <div
                        style={{
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                        }}
                        className='rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    />
                </motion.div>
            ))}
        </div>
    );
};

const AuroraBackground = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{
            opacity: 0.3,
            backgroundPosition: ['0% 50%, 0% 50%', '100% 50%, 100% 50%'],
            filter: 'blur(30px)',
        }}
        transition={{
            backgroundPosition: {
                duration: 60,
                repeat: Infinity,
                ease: 'linear',
            },
        }}
        className={`pointer-events-none absolute inset-0 overflow-hidden [background-image:var(--white-gradient),var(--aurora)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] [background-size:200%,_200%] [background-position:0%_50%,0%_50%] backdrop-blur-[100px] will-change-transform [--aurora:repeating-linear-gradient(100deg,rgba(59,130,246,0.3)_10%,rgba(99,102,241,0.2)_15%,rgba(147,197,253,0.3)_20%,rgba(167,139,250,0.2)_25%,rgba(96,165,250,0.3)_30%)] [--white-gradient:repeating-linear-gradient(100deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.05)_16%)] after:absolute after:inset-0 after:animate-[aurora_15s_linear_infinite] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_200%] after:[background-attachment:fixed]`}
    />
);

// Decorative Corner Element Component
const CornerElement = ({ position, delay = 0 }: { position: string; delay?: number }) => {
    const baseClasses = 'absolute w-6 h-6 border-neutral-700/50';
    const positionClasses = {
        'top-left': 'top-0 left-0 border-t border-l',
        'top-right': 'top-0 right-0 border-t border-r',
        'bottom-left': 'bottom-0 left-0 border-b border-l',
        'bottom-right': 'bottom-0 right-0 border-b border-r',
    };
    return (
        <motion.div
            className={`${baseClasses} ${positionClasses[position]}`}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.6, ease: 'easeOut' }}
        />
    );
};

// Memoize FeatureTags component - Minimalist/Floating Style
const FeatureTags = memo(() => (
    <div className='font-outfit mt-8 flex flex-col items-center gap-3 lg:items-start lg:gap-4'>
        {FEATURE_TAGS.map((feature, index) => (
            <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                key={index}
                className='group flex cursor-pointer items-center gap-2'>
                <feature.icon className='h-3.5 w-3.5 text-neutral-500 transition-colors duration-300 group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_3px_rgba(34,197,94,0.4)]' />
                <span className='font-kodemono text-xs text-neutral-400 transition-colors duration-300 group-hover:text-neutral-200'>{feature.text}</span>
            </motion.div>
        ))}
    </div>
));
FeatureTags.displayName = 'FeatureTags';

interface BoxVisualizationProps {
    currentSlice: BoxSlice;
    demoStep: number;
    isPaused: boolean;
}

// Memoize BoxVisualization component - Added Aura Pulse & Corners
const BoxVisualization = memo(({ currentSlice, demoStep, isPaused }: BoxVisualizationProps) => {
    const [baseSize, setBaseSize] = useState(250);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setBaseSize(400);
            else if (window.innerWidth >= 640) setBaseSize(300);
            else setBaseSize(250);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const sortedBoxes = useMemo(() => currentSlice?.boxes?.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) || [], [currentSlice]);
    const isPointOfChange = useMemo(() => Math.floor(demoStep / 1) % sequences.length === POINT_OF_CHANGE_INDEX, [demoStep]);

    // Determine dominant state for aura
    const dominantState = useMemo(() => {
        if (!currentSlice?.boxes || currentSlice.boxes.length === 0) return 'neutral';
        return currentSlice.boxes[0].value > 0 ? 'green' : 'red';
    }, [currentSlice]);

    // Gradient variants for the aura
    const gradientAuraVariants = {
        neutral: { background: 'radial-gradient(circle at 50% 50%, rgba(150, 150, 150, 0.15) 0%, transparent 65%)', scale: 1.1 },
        green: { background: 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.35) 0%, transparent 65%)', scale: 1.2 },
        red: { background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.35) 0%, transparent 65%)', scale: 1.2 },
    };

    return (
        <motion.div
            className='relative h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] lg:h-[400px] lg:w-[400px]'
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ rotateX: 10, rotateY: -15, opacity: 0, scale: 0.8 }}
            whileInView={{ rotateX: 0, rotateY: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}>
            {/* Decorative Corners */}

            {/* Dynamic Gradient Aura - Enhanced */}
            <motion.div
                className='absolute inset-[-25%] -z-10 rounded-full blur-3xl' // Added z-index here
                variants={gradientAuraVariants}
                animate={dominantState}
                transition={{
                    background: { duration: 1.2, ease: 'easeInOut' },
                    scale: { duration: 5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
                }}
            />

            {/* NestedBoxes container - Apply conditional rotation here */}
            <motion.div className='relative h-full w-full' style={{ transform: 'translateZ(20px)' }}>
                {currentSlice && sortedBoxes.length > 0 && (
                    <NestedBoxes boxes={sortedBoxes} demoStep={demoStep} isPaused={isPaused} isPointOfChange={isPointOfChange} baseSize={baseSize} colorScheme='green-red' />
                )}
            </motion.div>
        </motion.div>
    );
});
BoxVisualization.displayName = 'BoxVisualization';

// Memoize the static content - Added Corner Framing
const StaticContent = memo(() => (
    <motion.div
        className='flex flex-col justify-center'
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateX: -8, rotateY: 10, opacity: 0, y: 30 }}
        whileInView={{ rotateX: 0, rotateY: 0, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
        {/* Inner container for positioning corners relative to content */}
        <div className='relative p-4 lg:p-0'>
            {/* Decorative Corners */}
            <CornerElement position='top-left' />
            <CornerElement position='top-right' delay={0.1} />
            <CornerElement position='bottom-left' delay={0.2} />
            <CornerElement position='bottom-right' delay={0.3} />

            {/* Holographic text style */}
            <h2 className='font-outfit text-neutral-gradient text-2xl leading-tight font-bold tracking-tight sm:text-2xl lg:text-3xl'>Multi-Dimensional</h2>
            <h2 className='font-outfit text-neutral-gradient text-5xl leading-tight font-bold tracking-tight sm:text-6xl lg:text-7xl'>Trend Analysis</h2>

            <p className='font-outfit text-neutral-gradient mb-10 text-base leading-relaxed sm:text-lg' style={{ textShadow: '0 0 8px rgba(200, 200, 255, 0.1)' }}>
                Rthmn takes the market high and lows, and compresses time into mesurable unites of price structure.
            </p>
            <FeatureTags />
        </div>
    </motion.div>
));
StaticContent.displayName = 'StaticContent';

// Main component
export const SectionBoxes = memo(() => {
    const [demoStep, setDemoStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const currentSlice = useMemo(() => {
        const currentValues = createDemoStep(demoStep, sequences, BASE_VALUES);
        const mockBoxData = createMockBoxData(currentValues);
        return { timestamp: new Date().toISOString(), boxes: mockBoxData };
    }, [demoStep]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentPatternIndex = Math.floor(demoStep / 1) % sequences.length;
            if (currentPatternIndex === POINT_OF_CHANGE_INDEX && !isPaused) {
                setIsPaused(true);
                setTimeout(() => {
                    setIsPaused(false);
                    setDemoStep((prev) => (prev + 1) % sequences.length);
                }, PAUSE_DURATION);
                return;
            }
            if (!isPaused) {
                setDemoStep((prev) => (prev + 1) % sequences.length);
            }
        }, 150);
        return () => clearInterval(interval);
    }, [demoStep, isPaused]);

    return (
        <section className='relative h-full w-full overflow-hidden bg-black px-4 py-24 sm:px-8 lg:px-[10vw] lg:py-40' style={{ perspective: '1500px' }}>
            {/* Render Starfield in the background (-z-20) */}
            {/* <AuroraBackground /> */}
            <StarField />

            <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-8'>
                <div className='grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-32'>
                    <StaticContent />
                    <div className='order-first flex items-center justify-center lg:order-none'>
                        <BoxVisualization currentSlice={currentSlice} demoStep={demoStep} isPaused={isPaused} />
                    </div>
                </div>
            </div>
        </section>
    );
});
SectionBoxes.displayName = 'SectionBoxes';
