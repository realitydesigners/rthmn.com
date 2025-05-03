import { motion } from 'framer-motion';
import React from 'react';
import { FaExclamationCircle, FaExclamationTriangle, FaGraduationCap, FaInfoCircle, FaLightbulb } from 'react-icons/fa';

interface CalloutProps {
    type?: 'info' | 'warning' | 'tip' | 'learning' | 'important';
    title: string;
    points: string[];
}

const icons = {
    info: FaInfoCircle,
    warning: FaExclamationTriangle,
    tip: FaLightbulb,
    learning: FaGraduationCap,
    important: FaExclamationCircle,
};

export default function Callout({ type = 'info', title, points }: CalloutProps) {
    const Icon = icons[type];

    return (
        <div className='w-full flex justify-center'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className='group relative my-8 max-w-2xl flex-col flex w-full items-end gap-4 rounded-2xl bg-black p-4 transition-all duration-300 before:absolute before:inset-0 before:rounded-2xl before:bg-[linear-gradient(120deg,transparent_0%,rgba(0,115,230,0)_10%,rgba(0,115,230,0.1)_45%,rgba(0,115,230,0.05)_55%,rgba(0,115,230,0.1)_80%,rgba(0,115,230,0)_90%,transparent_100%)] before:bg-[length:400%_100%] before:animate-[shimmer_30s_linear_infinite] shadow-[0_0_30px_rgba(0,115,230,0.1)] ring-1 ring-white/5'
            >
                {/* Header */}
                <div className='flex w-full items-center gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#0073E6]/20 text-[#0073E6] shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)]  transition-all duration-300'>
                        <Icon className='h-5 w-5 drop-shadow-[0_0_8px_rgba(0,115,230,0.5)]' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h2 className='text-xl font-medium text-white transition-all duration-300'>{title}</h2>
                    </div>
                </div>

                {/* Content */}
                <ul className='mt-4 w-full space-y-4'>
                    {points.map((point, index) => (
                        <motion.li
                            key={`point-${point.substring(0, 20)}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                            className='flex items-start gap-4'
                        >
                            <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0073E6]/10 text-[#0073E6]  transition-all duration-300'>
                                <div className='h-1.5 w-1.5 rounded-full bg-current drop-shadow-[0_0_8px_rgba(0,115,230,0.5)]' />
                            </div>
                            <span className='text-sm text-neutral-300'>{point}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>
        </div>
    );
}
