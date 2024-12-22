'use client';
import { useState, useEffect, useMemo, memo, useRef } from 'react';
import { motion } from 'framer-motion';
import { StartButton } from '@/app/_components/StartNowButton';
import { CandleData } from '@/types/types';
import { useInView } from 'react-intersection-observer';
import { FaPlay } from 'react-icons/fa';

// Types
interface MarketData {
    pair: string;
    lastUpdated: string;
    candleData: string;
}

interface ProcessedMarketData {
    price: number;
    change: number;
    volume: number;
    points: number[];
}

interface CardPosition {
    x: number;
    y: number;
    z: number;
}

// Constants
const CARD_POSITIONS: CardPosition[] = [
    { x: -900, y: -450, z: 25 },
    { x: -700, y: -350, z: 30 },
    { x: -500, y: -450, z: 35 },
    { x: 900, y: -450, z: 20 },
    { x: 700, y: -350, z: 35 },
    { x: 500, y: -450, z: 30 },
    { x: -900, y: 350, z: 40 },
    { x: -700, y: 450, z: 30 },
    { x: -500, y: 350, z: 25 },
    { x: 900, y: 350, z: 25 },
    { x: 700, y: 450, z: 35 },
    { x: 500, y: 350, z: 30 },
];

const ANIMATION_DURATION = 10000;
const POSITION_SCALE = {
    MOBILE: 0.25,
    DESKTOP: 0.7,
};

// Add default position
const DEFAULT_POSITION: CardPosition = { x: 0, y: 0, z: 0 };

// Add these new constants at the top
const HOVER_TRANSITION = { duration: 0.3, ease: 'easeOut' };
const FLOAT_ANIMATION = {
    duration: { min: 3, max: 4 },
    delay: { min: 0.2, max: 0.3 },
};

// Add new types for better type safety
interface AnimationConfig {
    duration: number;
    delay: number;
}

interface FloatAnimation {
    y: AnimationConfig;
    x: AnimationConfig;
}

// Add new animation constants
const CARD_ANIMATION = {
    INITIAL_SCALE: 0.85,
    HOVER_SCALE: 0.95,
    FLOAT_RANGE: { x: 5, y: 10 },
    ROTATION: { x: 5, y: -5 },
};

// Memoize the MarketHeading component
const MarketHeading = memo(() => (
    <div className='relative z-20 text-center'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className='mb-8'>
                <h2 className='font-outfit text-gray-gradient relative text-[4em] leading-[1em] font-bold tracking-tight sm:text-[5em] lg:text-[7em]'>
                    Trading
                    <br />
                    Simplified
                </h2>
                <p className='font-kodemono mx-auto mt-6 max-w-2xl px-4 text-base text-gray-400 sm:text-lg'>
                    Experience real-time market data visualization with our advanced pattern recognition system.
                </p>
            </div>

            {/* Updated CTA buttons */}
            <div className='mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center'>
                <StartButton href='#pricing' custom={0}>
                    Get Started
                </StartButton>

                <button className='g flex h-[60px] items-center rounded-full bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]'>
                    <div className='flex h-[56px] w-full items-center space-x-6 rounded-full bg-linear-to-b from-[#0A0A0A] to-[#181818] px-6 py-2 text-sm'>
                        <span className='text-md mr-4'>Watch Demo</span>
                        <FaPlay />
                    </div>
                </button>
            </div>
        </motion.div>
    </div>
));

MarketHeading.displayName = 'MarketHeading';

// Memoize SparklineChart
const SparklineChart = memo(({ data, change }: { data: number[]; change: number }) => {
    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: true,
        delay: 100,
    });

    const pathData = useMemo(() => {
        if (!data?.length) return null;

        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        const range = maxValue - minValue;

        return data.map((p, i) => `${(i / (data.length - 1)) * 200} ${60 - ((p - minValue) / range) * 60}`).join(' L ');
    }, [data]);

    if (!pathData) return null;

    return (
        <div ref={ref} className='h-full w-full'>
            <svg width='100%' height='100%' viewBox='0 0 200 60' preserveAspectRatio='none' className='overflow-visible'>
                <defs>
                    <linearGradient id={`gradient-${change}`} x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={change >= 0 ? '#4ade80' : '#f87171'} stopOpacity='0.8' />
                        <stop offset='100%' stopColor={change >= 0 ? '#4ade80' : '#f87171'} stopOpacity='0.2' />
                    </linearGradient>
                </defs>

                <path
                    d={`M ${pathData}`}
                    fill='none'
                    stroke={`url(#gradient-${change})`}
                    strokeWidth='2'
                    vectorEffect='non-scaling-stroke'
                    className={inView ? 'animate-fadeIn' : 'opacity-0'}
                />

                <path
                    d={`M ${pathData}`}
                    fill='none'
                    stroke={`url(#gradient-${change})`}
                    strokeWidth='2'
                    vectorEffect='non-scaling-stroke'
                    className={inView ? 'animate-drawLine' : 'opacity-0'}
                    style={{
                        strokeDasharray: '1000',
                        strokeDashoffset: '1000',
                    }}
                />

                {data.length > 0 && (
                    <circle
                        cx={200}
                        cy={60 - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * 60}
                        r='3'
                        fill={change >= 0 ? '#4ade80' : '#f87171'}
                        className={inView ? 'animate-dotAppear' : 'opacity-0'}
                    />
                )}
            </svg>
        </div>
    );
});

SparklineChart.displayName = 'SparklineChart';

// Memoize CardContent
const CardContent = memo(({ item, data }: { item: MarketData; data: ProcessedMarketData }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 0);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className='flex h-full items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent' />
            </div>
        );
    }

    return (
        <div className='relative z-10'>
            <div className='mb-2 flex items-start justify-between'>
                <h4 className='text-sm font-medium text-white'>{item.pair.replace('_', '/')}</h4>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-full px-2 py-0.5 text-xs ${data.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {data.change.toFixed(2)}%
                </motion.div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className='mb-3 text-xl font-bold text-white tabular-nums'>
                {data.price.toFixed(item.pair.includes('JPY') ? 3 : 5)}
            </motion.div>
            <div className='h-12 w-full'>
                <SparklineChart data={data.points} change={data.change} />
            </div>
        </div>
    );
});

CardContent.displayName = 'CardContent';

// 1. First, let's create a custom hook to handle the animation frame
const useAnimationProgress = (duration: number) => {
    const [progress, setProgress] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        setIsClient(true);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const currentProgress = Math.min(elapsed / duration, 1);
            setProgress(currentProgress);

            if (currentProgress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [isClient, duration]);

    return progress;
};

// 2. Create a memoized transform component to handle card positioning
const CardTransform = memo(({ children, position, index }: { children: React.ReactNode; position: CardPosition; index: number }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const adjustedPosition = useMemo(() => {
        return isMobile
            ? {
                  x: position.x / 2,
                  y: position.y / 2,
                  z: position.z,
              }
            : position;
    }, [position, isMobile]);

    const floatAnimation: FloatAnimation = useMemo(
        () => ({
            y: {
                duration: FLOAT_ANIMATION.duration.min + (index % 3),
                delay: index * FLOAT_ANIMATION.delay.min,
            },
            x: {
                duration: FLOAT_ANIMATION.duration.max + (index % 2),
                delay: index * FLOAT_ANIMATION.delay.max,
            },
        }),
        [index]
    );

    return (
        <motion.div
            className='absolute top-1/2 left-1/2 h-[130px] w-[160px] -translate-x-1/2 -translate-y-1/2 cursor-pointer will-change-transform sm:h-[160px] sm:w-[180px]'
            initial={{
                x: adjustedPosition.x * (isMobile ? POSITION_SCALE.MOBILE : POSITION_SCALE.DESKTOP),
                y: adjustedPosition.y * (isMobile ? POSITION_SCALE.MOBILE : POSITION_SCALE.DESKTOP),
                z: adjustedPosition.z,
                scale: CARD_ANIMATION.INITIAL_SCALE,
                rotateX: (index % 3) * CARD_ANIMATION.ROTATION.x,
                rotateY: (index % 2) * CARD_ANIMATION.ROTATION.y,
                opacity: 0,
            }}
            animate={{
                y: adjustedPosition.y * (isMobile ? POSITION_SCALE.MOBILE : POSITION_SCALE.DESKTOP) + Math.sin(index * 0.8) * CARD_ANIMATION.FLOAT_RANGE.y,
                x: adjustedPosition.x * (isMobile ? POSITION_SCALE.MOBILE : POSITION_SCALE.DESKTOP) + Math.cos(index * 0.5) * CARD_ANIMATION.FLOAT_RANGE.x,
                opacity: 1,
                transition: {
                    y: {
                        duration: floatAnimation.y.duration,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                        delay: floatAnimation.y.delay,
                    },
                    x: {
                        duration: floatAnimation.x.duration,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                        delay: floatAnimation.x.delay,
                    },
                    opacity: {
                        duration: 0.5,
                        delay: index * 0.1,
                    },
                },
            }}
            whileHover={{
                scale: CARD_ANIMATION.HOVER_SCALE,
                z: adjustedPosition.z + 100,
                rotateX: 0,
                rotateY: 0,
                transition: HOVER_TRANSITION,
            }}
            style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
            }}>
            {children}
        </motion.div>
    );
});

CardTransform.displayName = 'CardTransform';

// 3. Optimize the market card data processing
const useProcessedMarketData = (marketData: MarketData[], progress: number) => {
    return useMemo(() => {
        const cache = new Map<string, ProcessedMarketData>();

        return marketData
            .map((item) => {
                const cacheKey = `${item.pair}-${progress}`;
                if (!cache.has(cacheKey)) {
                    try {
                        const data = JSON.parse(item.candleData) as CandleData[];
                        if (!data?.length) return null;

                        const dataPoints = Math.floor(data.length * progress);
                        const animatedData = data.slice(0, Math.max(2, dataPoints + 1));

                        const latest = animatedData[animatedData.length - 1];
                        const first = data[0];
                        const change = ((parseFloat(latest.mid.c) - parseFloat(first.mid.o)) / parseFloat(first.mid.o)) * 100;

                        const processed = {
                            price: parseFloat(latest.mid.c),
                            change,
                            volume: latest.volume,
                            points: animatedData.map((d) => parseFloat(d.mid.c)),
                        };

                        cache.set(cacheKey, processed);
                    } catch {
                        return null;
                    }
                }

                return {
                    item,
                    data: cache.get(cacheKey)!,
                };
            })
            .filter((item): item is { item: MarketData; data: ProcessedMarketData } => item !== null);
    }, [marketData, progress]);
};

// 4. Update the main component to use these optimizations
export const SectionMarketDisplay = memo(({ marketData }: { marketData: MarketData[] }) => {
    const { ref, inView } = useInView({
        threshold: 0.1, // Trigger when 10% of the section is visible
        triggerOnce: false, // Keep monitoring visibility
    });

    const progress = useAnimationProgress(ANIMATION_DURATION);
    const processedData = useProcessedMarketData(marketData, progress);

    return (
        <section ref={ref} className='relative min-h-screen overflow-hidden'>
            {/* Center content */}
            <div className='relative z-10 flex min-h-screen flex-col items-center justify-center px-4'>
                {/* Centered heading */}
                <div className='absolute top-1/2 left-1/2 z-20 w-full -translate-x-1/2 -translate-y-1/2 transform'>
                    <MarketHeading />
                </div>
                {/* 3D Cards Container */}
                <div className='absolute inset-0 z-10'>
                    <div className='relative h-full [perspective:4000px]'>
                        {inView &&
                            processedData.map(({ item, data }, index) => (
                                <CardTransform key={item.pair} position={CARD_POSITIONS[index] || DEFAULT_POSITION} index={index}>
                                    <div className='group relative h-full w-full rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-md transition-all duration-300 hover:bg-black/80'>
                                        <CardContent item={item} data={data} />
                                    </div>
                                </CardTransform>
                            ))}
                    </div>
                </div>
            </div>
        </section>
    );
});

SectionMarketDisplay.displayName = 'SectionMarketDisplay';
