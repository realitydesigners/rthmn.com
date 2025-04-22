import React from 'react';
import { FaLightbulb, FaInfoCircle, FaExclamationTriangle, FaExclamationCircle, FaGraduationCap } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

const styles = {
    info: {
        border: 'border-blue-400/20',
        bg: 'from-blue-900/10 to-blue-800/5',
        text: 'text-blue-400',
        shadow: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]',
        glow: 'before:bg-blue-500/20',
        accent: 'bg-gradient-to-r from-blue-500 to-blue-400',
    },
    warning: {
        border: 'border-amber-400/20',
        bg: 'from-amber-900/10 to-amber-800/5',
        text: 'text-amber-400',
        shadow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]',
        glow: 'before:bg-amber-500/20',
        accent: 'bg-gradient-to-r from-amber-500 to-amber-400',
    },
    tip: {
        border: 'border-emerald-400/20',
        bg: 'from-emerald-900/10 to-emerald-800/5',
        text: 'text-emerald-400',
        shadow: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]',
        glow: 'before:bg-emerald-500/20',
        accent: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    },
    learning: {
        border: 'border-violet-400/20',
        bg: 'from-violet-900/10 to-violet-800/5',
        text: 'text-violet-400',
        shadow: 'drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]',
        glow: 'before:bg-violet-500/20',
        accent: 'bg-gradient-to-r from-violet-500 to-violet-400',
    },
    important: {
        border: 'border-rose-400/20',
        bg: 'from-rose-900/10 to-rose-800/5',
        text: 'text-rose-400',
        shadow: 'drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]',
        glow: 'before:bg-rose-500/20',
        accent: 'bg-gradient-to-r from-rose-500 to-rose-400',
    },
};

export default function Callout({ type = 'info', title, points }: CalloutProps) {
    const Icon = icons[type];
    const style = styles[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`relative my-10 overflow-hidden rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} p-0.5 backdrop-blur-lg before:absolute before:inset-0 before:-z-10 before:translate-y-[60%] before:transform before:rounded-full before:opacity-20 before:blur-3xl before:content-[''] ${style.glow}`}>
            <div className='relative rounded-[14px] bg-black/30 p-6 backdrop-blur-sm'>
                {/* Decorative elements */}
                <div className='absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-20 blur-2xl'></div>
                <div className={`absolute -bottom-4 -left-4 h-20 w-20 rounded-full ${style.accent} opacity-10 blur-2xl`}></div>

                {/* Header */}
                <div className='mb-6 flex items-center gap-4'>
                    <div className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl ${style.accent} p-0.5`}>
                        <div className='absolute inset-0 bg-black/30 backdrop-blur-sm'></div>
                        <div className='relative z-10 flex h-full w-full items-center justify-center rounded-[10px] bg-black/60'>
                            <Icon className={`h-5 w-5 ${style.text} ${style.shadow}`} />
                        </div>
                    </div>
                    <h2 className='bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-xl font-bold tracking-tight text-transparent'>{title}</h2>
                </div>

                {/* Content */}
                <ul className='space-y-4 pl-2'>
                    {points.map((point, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                            className='flex items-start gap-3'>
                            <div className={`relative mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 p-0.5 backdrop-blur-sm`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${style.text} ${style.shadow} bg-current`}></div>
                            </div>
                            <span className='flex-1 text-neutral-300'>{point}</span>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}
