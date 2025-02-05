'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { StartButton } from '@/app/_components/Sections/StartNowButton';
import { MarketWall } from './MarketWall';

interface MarketData {
    pair: string;
    lastUpdated: string;
    candleData: string;
}

interface BoxComponentProps {
    marketData: MarketData[];
}

export const SectionHero: React.FC<BoxComponentProps> = ({ marketData }) => {
    return (
        <section className='relative overflow-hidden pt-60'>
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]' />
                <div className='absolute top-1/4 right-1/4 h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] blur-3xl' />
            </div>

            <MarketWall marketData={marketData} />
            <div className='relative flex w-full flex-col gap-8'>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
                    <div className='relative flex flex-col items-center text-center'>
                        <h2 className={`text-gray-gradient font-outfit relative z-10 text-[3em] leading-[1em] font-bold tracking-tight lg:text-[8em] lg:leading-[1em]`}>
                            The Future of
                            <br />
                            Market Analysis
                        </h2>
                        <p className={`text-dark-gray font-kodemono mb-6 w-11/12 pt-6 text-lg lg:text-xl`}>The universal pattern recognition toolkit designed for trading.</p>
                        <div className='mt-6 flex gap-6'>
                            <StartButton href='#pricing' custom={0} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
