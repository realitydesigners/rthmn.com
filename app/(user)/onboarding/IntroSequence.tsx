import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LogoIcon } from '@/components/Icons/icons';

interface Props {
    onComplete: () => void;
}

const AuroraBackground = ({ isExiting }: { isExiting: boolean }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{
            opacity: isExiting ? 0 : 0.3,
            backgroundPosition: ['0% 50%, 0% 50%', '100% 50%, 100% 50%'],
            filter: isExiting ? 'blur(50px)' : 'blur(30px)',
        }}
        transition={{
            opacity: { duration: 2.5 },
            filter: { duration: 2.5 },
            backgroundPosition: {
                duration: 25,
                repeat: Infinity,
                ease: 'linear',
            },
        }}
        className={`after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:200%,_200%] [background-position:0%_50%,0%_50%] will-change-transform [--aurora:repeating-linear-gradient(100deg,rgba(59,130,246,0.5)_10%,rgba(99,102,241,0.5)_15%,rgba(147,197,253,0.5)_20%,rgba(167,139,250,0.5)_25%,rgba(96,165,250,0.5)_30%)] [--white-gradient:repeating-linear-gradient(100deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.1)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.1)_16%)] [mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)] after:absolute after:inset-0 after:animate-[aurora_15s_linear_infinite] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_200%] after:[background-attachment:fixed] after:mix-blend-plus-lighter after:content-[""]`}
    />
);

const LightShadows = ({ isExiting }: { isExiting: boolean }) =>
    [...Array(1)].map((_, i) => (
        <motion.div
            key={`light-${i}`}
            initial={{ opacity: 0 }}
            animate={{
                opacity: isExiting ? 0 : [0, 0.3, 0],
                filter: isExiting ? 'blur(50px)' : 'blur(30px)',
                x: ['0%', '100%'],
                y: [i * 30 + '%', i * 30 + 10 + '%'],
            }}
            transition={{
                duration: 10 + i * 5,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 1,
                opacity: { duration: 2.5 },
                filter: { duration: 2.5 },
            }}
            className={`bg-gradient-radial absolute h-[300px] w-[300px] rounded-full from-blue-500/20 via-violet-500/10 to-transparent blur-3xl`}
        />
    ));

const StarField = ({ isExiting }: { isExiting: boolean }) => (
    <div className='absolute inset-0 overflow-hidden'>
        {[...Array(100)].map((_, i) => (
            <StarParticle key={i} isExiting={isExiting} index={i} />
        ))}
    </div>
);

const StarParticle = ({ isExiting, index }: { isExiting: boolean; index: number }) => {
    const size = 1 + Math.random() * 2;
    const startY = Math.random() * window.innerHeight;
    const duration = 15 + Math.random() * 20; // Much longer duration
    const startDelay = Math.random() * -15; // Negative delay for immediate start at random positions

    return (
        <motion.div
            initial={{
                opacity: 0.1,
                x: Math.random() * window.innerWidth,
                y: startY,
            }}
            animate={{
                opacity: isExiting ? 0 : [0.1, 0.5, 0.1],
                y: [startY, startY - window.innerHeight],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: startDelay,
                opacity: {
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3,
                    ease: 'easeInOut',
                },
                y: {
                    duration: duration,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: startDelay,
                },
            }}
            className='absolute'>
            <div
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                }}
                className='rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
            />
            <motion.div
                animate={{
                    opacity: isExiting ? 0 : [0.1, 0.3, 0.1],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 1.5 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * -2,
                    ease: 'easeInOut',
                }}
                className='absolute inset-0 rounded-full bg-white/30 blur-[1px]'
            />
        </motion.div>
    );
};

// Content Step Components
const WelcomeStep = () => (
    <motion.div key='title' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -30, scale: 0.95 }} transition={{ duration: 1 }} className='space-y-4'>
        <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, rotate: 5 }}
            transition={{
                type: 'spring',
                stiffness: 150,
                damping: 20,
            }}
            className='relative mx-auto mb-6 h-24 w-24'>
            {/* Logo glow effect */}
            <motion.div
                animate={{
                    boxShadow: ['0 0 20px rgba(255,255,255,0.1)', '0 0 60px rgba(255,255,255,0.2)', '0 0 20px rgba(255,255,255,0.1)'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5'
            />
            <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-4'>
                <div className='h-full w-full drop-shadow-2xl'>
                    <LogoIcon />
                </div>
            </div>
        </motion.div>
        <motion.h1
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{
                duration: 1,
                scale: { type: 'spring', stiffness: 100, damping: 15 },
            }}
            className='font-outfit bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-7xl font-bold text-transparent'>
            Welcome to Rthmn
        </motion.h1>
        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className='font-mono text-lg text-white/60'>
            Redefining Market Intelligence
        </motion.p>
    </motion.div>
);

const PatternRecognitionStep = () => (
    <motion.div
        key='description1'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.8 }}
        className='max-w-2xl space-y-6'>
        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className='font-outfit text-2xl font-medium text-white/90'>
            Universal Pattern Recognition
        </motion.p>
        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='font-mono text-lg text-white/60'>
            Discover hidden market patterns with our advanced algorithms
        </motion.p>
    </motion.div>
);

const MultiMarketStep = () => (
    <motion.div
        key='description2'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.8 }}
        className='max-w-2xl space-y-6'>
        <div className='space-y-4'>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className='font-outfit text-2xl text-white/90'>
                Multi-Market Analysis
            </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className='flex justify-center gap-8 font-mono text-white/60'>
                {['Forex', '•', 'Stocks', '•', 'Crypto'].map((text, i) => (
                    <motion.span
                        key={text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: 0.1 * i }}>
                        {text}
                    </motion.span>
                ))}
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className='font-mono text-white/50'>
                Unified analysis across all major markets
            </motion.p>
        </div>
    </motion.div>
);

const IntelligenceStep = () => (
    <motion.div
        key='description3'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.8 }}
        className='max-w-2xl space-y-6'>
        <div className='space-y-4'>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className='font-outfit text-2xl text-white/90'>
                Real-Time Intelligence
            </motion.p>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className='font-mono text-lg text-white/60'>
                83% accuracy in major market moves
            </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className='flex justify-center gap-6 font-mono text-white/50'>
                {['Pattern Detection', '•', 'Price Action', '•', 'Momentum'].map((text, i) => (
                    <motion.span
                        key={text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: 0.1 * i }}>
                        {text}
                    </motion.span>
                ))}
            </motion.div>
        </div>
    </motion.div>
);

export default function IntroSequence({ onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(
            () => {
                if (step < 4) {
                    setStep(step + 1);
                } else {
                    setIsExiting(true);
                    setTimeout(() => {
                        onComplete();
                    }, 2500);
                }
            },
            step === 4 ? 3500 : 3000
        );

        return () => clearTimeout(timer);
    }, [step, onComplete]);

    const renderStep = () => {
        switch (step) {
            case 1:
                return <WelcomeStep />;
            case 2:
                return <PatternRecognitionStep />;
            case 3:
                return <MultiMarketStep />;
            case 4:
                return <IntelligenceStep />;
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                animate={{
                    opacity: isExiting ? 0 : 1,
                    filter: isExiting ? 'blur(20px)' : 'blur(0px)',
                }}
                transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                className='fixed inset-0 z-[1000] bg-black'>
                {/* Background Effects */}
                <div className='absolute inset-0 overflow-hidden'>
                    <AuroraBackground isExiting={isExiting} />
                    <LightShadows isExiting={isExiting} />
                    <StarField isExiting={isExiting} />
                </div>

                {/* Content container */}
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{
                        opacity: isExiting ? 0 : 1,
                        filter: isExiting ? 'blur(20px)' : 'blur(0px)',
                    }}
                    transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
                    className='relative flex h-full items-center justify-center'>
                    {/* Main content */}
                    <div className='relative z-10 flex items-center justify-center'>
                        <motion.div
                            className='relative space-y-8 text-center'
                            animate={
                                isExiting
                                    ? {
                                          scale: 0.98,
                                          opacity: 0,
                                          filter: 'blur(10px)',
                                      }
                                    : {
                                          scale: 1,
                                          opacity: 1,
                                          filter: 'blur(0px)',
                                      }
                            }
                            transition={{ duration: 2.5 }}>
                            <AnimatePresence mode='wait'>{renderStep()}</AnimatePresence>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
