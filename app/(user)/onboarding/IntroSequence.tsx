import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LogoIcon } from '@/components/Icons/icons';

interface Props {
    onComplete: () => void;
}

export default function IntroSequence({ onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(
            () => {
                if (step < 5) {
                    setStep(step + 1);
                } else {
                    setIsExiting(true);
                    setTimeout(() => {
                        onComplete();
                    }, 2500);
                }
            },
            step === 5 ? 3000 : 2200
        );

        return () => clearTimeout(timer);
    }, [step, onComplete]);

    return (
        <AnimatePresence>
            {/* Background container */}
            <motion.div
                initial={{ opacity: 1, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(0px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(20px)' }}
                transition={{
                    duration: 2.5,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 2.5 },
                    backdropFilter: { duration: 1.8 },
                }}
                className='fixed inset-0 z-[1000]'>
                {/* Background overlay */}
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
                    className='absolute inset-0 bg-black'
                />

                {/* Content container */}
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                    className='relative flex h-full items-center justify-center'>
                    {/* Background elements */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 2 }}
                        className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]'
                    />

                    {/* Subtle gradient overlay */}
                    <motion.div
                        animate={{
                            opacity: [0.03, 0.06, 0.03],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                        className='absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-white/5'
                    />

                    {/* Animated rings */}
                    <div className='absolute inset-0 overflow-hidden'>
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: [0, 0.05, 0],
                                    scale: [0.8 + i * 0.2, 1.2 + i * 0.2],
                                    rotate: 360,
                                }}
                                transition={{
                                    duration: 8 + i * 2,
                                    repeat: Infinity,
                                    ease: 'linear',
                                    delay: i * 2,
                                }}
                                className='absolute inset-0 rounded-full border-[1px] border-white/10'
                            />
                        ))}
                    </div>

                    {/* Exit sequence overlays */}
                    {isExiting && (
                        <>
                            {/* Radial blur that expands */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                transition={{ duration: 2.5, ease: 'easeOut' }}
                                className='absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.9)_70%)] backdrop-blur-sm'
                            />

                            {/* Vertical lines that fade in */}
                            <div className='absolute inset-0 overflow-hidden'>
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, height: '0%', y: '100%' }}
                                        animate={{
                                            opacity: [0, 0.1, 0],
                                            height: ['0%', '100%'],
                                            y: ['100%', '-100%'],
                                        }}
                                        transition={{
                                            duration: 2,
                                            delay: i * 0.1,
                                            ease: 'easeOut',
                                        }}
                                        style={{
                                            left: `${(i + 1) * 5}%`,
                                            width: '1px',
                                        }}
                                        className='absolute bg-gradient-to-b from-transparent via-white/10 to-transparent'
                                    />
                                ))}
                            </div>

                            {/* Final fade overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.5, delay: 1 }}
                                className='absolute inset-0 bg-black/60 backdrop-blur-xl'
                            />

                            {/* Reveal the UI behind with a sweep */}
                            <motion.div
                                initial={{ clipPath: 'inset(50% 50%)', opacity: 0 }}
                                animate={{ clipPath: 'inset(0%)', opacity: 1 }}
                                transition={{ duration: 1.5, delay: 1.5 }}
                                className='absolute inset-0 bg-black/40 backdrop-blur-sm'
                            />
                        </>
                    )}

                    {/* Main content */}
                    <div className='relative z-10 flex items-center justify-center'>
                        <motion.div
                            className='relative space-y-6 text-center'
                            animate={
                                isExiting
                                    ? {
                                          scale: 0.98,
                                          opacity: 0,
                                          filter: 'blur(10px)',
                                      }
                                    : {}
                            }
                            transition={{ duration: 1.5 }}>
                            <AnimatePresence mode='wait'>
                                {step === 0 && (
                                    <motion.div
                                        key='welcome'
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
                                        className='space-y-4'>
                                        <motion.div
                                            initial={{ scale: 0.8, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 200,
                                                damping: 15,
                                            }}
                                            className='relative mx-auto h-24 w-24'>
                                            {/* Logo glow effect */}
                                            <motion.div
                                                animate={{
                                                    boxShadow: ['0 0 20px rgba(255,255,255,0.1)', '0 0 60px rgba(255,255,255,0.2)', '0 0 20px rgba(255,255,255,0.1)'],
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5'
                                            />
                                            <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-4'>
                                                <div className='h-full w-full drop-shadow-2xl'>
                                                    <LogoIcon />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <motion.div
                                        key='title'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className='space-y-2'>
                                        <motion.h1
                                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                                            animate={{ clipPath: 'inset(0 0% 0 0)' }}
                                            transition={{ duration: 0.7, delay: 0.2 }}
                                            className='font-outfit bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-7xl font-bold text-transparent'>
                                            Welcome to Rthmn
                                        </motion.h1>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key='description1'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className='max-w-2xl space-y-4'>
                                        <p className='font-outfit text-2xl font-medium text-white/90'>The Future of Trading</p>
                                        <p className='font-mono text-lg text-white/50'>Where precision meets innovation</p>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key='description2'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className='max-w-2xl space-y-6'>
                                        <div className='space-y-2'>
                                            <p className='font-outfit text-xl text-white/80'>Advanced Analytics</p>
                                            <p className='font-mono text-white/50'>Real-time data analysis and predictive modeling</p>
                                        </div>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1 }}
                                            className='mx-auto h-px w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent'
                                        />
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div
                                        key='description3'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className='max-w-2xl space-y-6'>
                                        <div className='space-y-4'>
                                            <p className='font-outfit text-xl text-white/80'>Intelligent Strategies</p>
                                            <div className='flex justify-center gap-8 font-mono text-white/50'>
                                                <span>Automation</span>
                                                <span>•</span>
                                                <span>Risk Control</span>
                                                <span>•</span>
                                                <span>Insights</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 5 && (
                                    <motion.div
                                        key='final'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className='relative max-w-2xl space-y-6'>
                                        <p className='font-outfit text-2xl font-medium text-white/90'>Begin Your Journey</p>
                                        <div className='relative'>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 1.5 }}
                                                className='mx-auto h-px w-40 bg-gradient-to-r from-transparent via-white/30 to-transparent'
                                            />
                                            <motion.div
                                                animate={{
                                                    x: ['-100%', '100%'],
                                                    opacity: [0, 0.5, 0],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    repeatDelay: 0.5,
                                                }}
                                                className='absolute top-0 h-px w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[1px]'
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Stars fade out differently during exit */}
                    <div className='absolute inset-0 overflow-hidden'>
                        {[...Array(70)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    x: Math.random() * window.innerWidth,
                                    y: Math.random() * window.innerHeight + 100,
                                }}
                                animate={{
                                    opacity: isExiting ? 0 : [0, 0.7, 0],
                                    y: [null, -100],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: isExiting ? 0 : Infinity,
                                    delay: Math.random() * 2,
                                }}
                                className='absolute'>
                                <div className='h-[2px] w-[2px] rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]' />
                                <motion.div
                                    animate={{
                                        opacity: isExiting ? 0 : [0, 0.5, 0],
                                        scale: [1, 2, 1],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: isExiting ? 0 : Infinity,
                                        repeatDelay: Math.random() * 2,
                                    }}
                                    className='absolute inset-0 rounded-full bg-white/40 blur-[1px]'
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
