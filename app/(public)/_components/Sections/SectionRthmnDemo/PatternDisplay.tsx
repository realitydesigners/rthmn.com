'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BASE_VALUES, createMockBoxData, sequences } from '@/app/(public)/_components/constants/constants';
import { NestedBoxes } from '@/app/(public)/_components/NestedBoxes';
import type { CandleData } from '@/types/types';

interface MarketData {
    pair: string;
    lastUpdated: string;
    candleData: string;
}

interface PatternDisplayProps {
    marketData: MarketData[];
}

const BoxVisualization = memo(({ pair, candleData }: { pair: string; candleData: string }) => {
    const [baseSize, setBaseSize] = useState(150);
    const randomSequence = useMemo(() => {
        const pairHash = pair.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        const randomIndex = Math.abs(pairHash) % sequences.length;
        const sequence = sequences[randomIndex];
        const values = BASE_VALUES.map((value, i) => value * (sequence[i] || 1));
        return createMockBoxData(values);
    }, [pair]);

    useEffect(() => {
        const handleResize = () => {
            setBaseSize(window.innerWidth >= 1024 ? 250 : 150);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className='relative flex items-center justify-center rounded-lg border border-white/10 backdrop-blur-sm' style={{ height: `${baseSize}px`, width: `${baseSize}px` }}>
            <motion.div
                className='absolute inset-0'
                animate={{
                    background: [
                        'radial-gradient(circle at 0% 0%, #34d39915 0%, transparent 50%)',
                        'radial-gradient(circle at 100% 100%, #34d39915 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 0%, #34d39915 0%, transparent 50%)',
                    ],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />

            {randomSequence.length > 0 && (
                <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='relative' style={{ width: baseSize, height: baseSize }}>
                        <NestedBoxes
                            boxes={randomSequence.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))}
                            demoStep={0}
                            isPaused={false}
                            baseSize={baseSize}
                            colorScheme='green-red'
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

BoxVisualization.displayName = 'BoxVisualization';

export const PatternDisplay = memo(({ marketData }: PatternDisplayProps) => {
    const getLatestPrice = useMemo(
        () => (candleData: string) => {
            try {
                const data = JSON.parse(candleData) as CandleData[];
                return parseFloat(data[data.length - 1].mid.c);
            } catch (e) {
                return null;
            }
        },
        []
    );

    const getPriceChange = useMemo(
        () => (candleData: string) => {
            try {
                const data = JSON.parse(candleData) as CandleData[];
                const firstPrice = parseFloat(data[0].mid.o);
                const lastPrice = parseFloat(data[data.length - 1].mid.c);
                return ((lastPrice - firstPrice) / firstPrice) * 100;
            } catch (e) {
                return null;
            }
        },
        []
    );

    return (
        <section className='relative z-100 h-full'>
            <div className='scrollbar-thin scrollbar-track-white/5 h-[calc(100vh-20rem)] overflow-y-auto pr-2 2xl:h-[calc(75vh)]'>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {marketData.map((item) => {
                        const latestPrice = getLatestPrice(item.candleData);
                        const priceChange = getPriceChange(item.candleData);

                        return (
                            <motion.div
                                key={item.pair}
                                className='relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-black/40 p-4 transition-all duration-300 hover:border-white/10'>
                                <div className='mb-4 flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div>
                                            <h3 className='font-outfit text-xl font-semibold text-white/90'>{item.pair.replace('_', '/')}</h3>
                                            <div className='flex items-center gap-3'>
                                                <span className='font-kodemono text-sm text-white/70'>{latestPrice?.toFixed(item.pair.includes('JPY') ? 3 : 5)}</span>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        priceChange && priceChange >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {priceChange ? `${priceChange.toFixed(2)}%` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <BoxVisualization pair={item.pair} candleData={item.candleData} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
});

PatternDisplay.displayName = 'PatternDisplay';
