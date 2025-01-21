'use client';

import { motion } from 'framer-motion';
import { LuArrowUpDown } from 'react-icons/lu';

interface Props {
    selectedPairs: string[];
    setSelectedPairs: (pairs: string[]) => void;
}

const pairs = [
    { id: 'EUR/USD', name: 'Euro / US Dollar', flag1: '🇪🇺', flag2: '🇺🇸' },
    { id: 'GBP/USD', name: 'British Pound / US Dollar', flag1: '🇬🇧', flag2: '🇺🇸' },
    { id: 'USD/JPY', name: 'US Dollar / Japanese Yen', flag1: '🇺🇸', flag2: '🇯🇵' },
    { id: 'USD/CHF', name: 'US Dollar / Swiss Franc', flag1: '🇺🇸', flag2: '🇨🇭' },
    { id: 'USD/CAD', name: 'US Dollar / Canadian Dollar', flag1: '🇺🇸', flag2: '🇨🇦' },
    { id: 'AUD/USD', name: 'Australian Dollar / US Dollar', flag1: '🇦🇺', flag2: '🇺🇸' },
];

export default function PairsStep({ selectedPairs, setSelectedPairs }: Props) {
    return (
        <div className='space-y-8'>
            <div className='space-y-2'>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent'>
                    Select Currency Pairs
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='text-base text-gray-400'>
                    Choose the currency pairs you want to trade. You can always modify this later.
                </motion.p>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className='grid grid-cols-2 gap-4'>
                {pairs.map((pair, index) => {
                    const isSelected = selectedPairs.includes(pair.id);

                    return (
                        <motion.button
                            key={pair.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            onClick={() => {
                                setSelectedPairs(selectedPairs.includes(pair.id) ? selectedPairs.filter((p) => p !== pair.id) : [...selectedPairs, pair.id]);
                            }}
                            className={`group relative w-full overflow-hidden rounded-xl border bg-gradient-to-b p-0.5 transition-all duration-300 ${
                                isSelected
                                    ? 'border-blue-500/50 from-blue-500/20 to-blue-500/0'
                                    : 'border-[#333] from-[#1A1A1A] to-[#0D0D0D] hover:border-blue-500/30 hover:from-[#1A1A1A] hover:to-[#111]'
                            }`}>
                            {/* Highlight Effect */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-300 ${
                                    isSelected ? 'from-blue-500/10 to-transparent opacity-100' : 'from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                                }`}
                            />

                            {/* Content Container */}
                            <div className='relative flex items-center gap-4 rounded-xl p-4'>
                                {/* Text Content */}
                                <div className='flex-1 text-left'>
                                    <div className={`flex items-center gap-2 font-medium transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                        <span>{pair.id}</span>
                                        <span className='text-sm text-gray-500'>•</span>
                                        <span className='flex gap-1 text-lg'>
                                            {pair.flag1}
                                            {pair.flag2}
                                        </span>
                                    </div>
                                    <div className={`text-sm transition-colors duration-300 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>{pair.name}</div>
                                </div>

                                {/* Selection Indicator */}
                                <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${isSelected ? 'bg-blue-500' : 'bg-[#333] group-hover:bg-[#444]'}`} />
                            </div>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
