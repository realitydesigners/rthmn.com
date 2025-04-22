'use client';

import { motion } from 'framer-motion';
import { LuBrain, LuGraduationCap, LuLineChart } from 'react-icons/lu';

interface Props {
    experience: string;
    setExperience: (experience: string) => void;
}

const experiences = [
    {
        id: 'beginner',
        icon: LuBrain,
        title: 'Beginner',
        description: "I'm new to trading or have less than a year of experience",
    },
    {
        id: 'intermediate',
        icon: LuGraduationCap,
        title: 'Intermediate',
        description: 'I have 1-3 years of trading experience',
    },
    {
        id: 'advanced',
        icon: LuLineChart,
        title: 'Advanced',
        description: 'I have more than 3 years of trading experience',
    },
];

export default function ExperienceStep({ experience, setExperience }: Props) {
    return (
        <div className='space-y-8'>
            <div className='space-y-2'>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent'>
                    Trading Experience
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='text-base text-neutral-400'>
                    Help us personalize your experience by telling us about your trading background.
                </motion.p>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className='grid gap-4'>
                {experiences.map((level, index) => {
                    const Icon = level.icon;
                    const isSelected = experience === level.id;

                    return (
                        <motion.button
                            key={level.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            onClick={() => setExperience(level.id)}
                            className={`group relative w-full overflow-hidden rounded-xl border bg-gradient-to-b p-0.5 transition-all duration-300 ${
                                isSelected
                                    ? 'border-[#3FFFA2]/50 from-[#3FFFA2]/20 to-[#3FFFA2]/0'
                                    : 'border-[#333] from-[#1A1A1A] to-[#0D0D0D] hover:border-[#3FFFA2]/30 hover:from-[#1A1A1A] hover:to-[#111]'
                            }`}>
                            {/* Highlight Effect */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-300 ${
                                    isSelected ? 'from-[#3FFFA2]/10 to-transparent opacity-100' : 'from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                                }`}
                            />

                            {/* Content Container */}
                            <div className='relative flex items-center gap-4 rounded-xl p-4'>
                                {/* Icon Container */}
                                <div
                                    className={`rounded-lg bg-gradient-to-b p-3 transition-colors duration-300 ${
                                        isSelected
                                            ? 'from-[#3FFFA2]/30 via-[#3FFFA2]/10 to-[#3FFFA2]/5 text-[#3FFFA2]'
                                            : 'from-white/10 via-white/5 to-transparent text-neutral-400 group-hover:text-neutral-300'
                                    }`}>
                                    <Icon className='h-6 w-6' />
                                </div>

                                {/* Text Content */}
                                <div className='flex-1 text-left'>
                                    <div className={`font-medium transition-colors duration-300 ${isSelected ? 'text-white' : 'text-neutral-300'}`}>{level.title}</div>
                                    <div className={`text-sm transition-colors duration-300 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>{level.description}</div>
                                </div>

                                {/* Selection Indicator */}
                                <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${isSelected ? 'bg-[#3FFFA2]' : 'bg-[#333] group-hover:bg-[#444]'}`} />
                            </div>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
