import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';

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
            backgroundPosition: {
                duration: 60,
                repeat: Infinity,
                ease: 'linear',
            },
        }}
        className={`after:animate-aurora pointer-events-none absolute inset-0 overflow-hidden [background-image:var(--white-gradient),var(--aurora)] [background-size:200%,_200%] [background-position:0%_50%,0%_50%] will-change-transform [--aurora:repeating-linear-gradient(100deg,rgba(59,130,246,0.5)_10%,rgba(99,102,241,0.5)_15%,rgba(147,197,253,0.5)_20%,rgba(167,139,250,0.5)_25%,rgba(96,165,250,0.5)_30%)] [--white-gradient:repeating-linear-gradient(100deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.1)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.1)_16%)] [mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)] after:absolute after:inset-0 after:animate-[aurora_15s_linear_infinite] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_200%] after:[background-attachment:fixed] after:mix-blend-plus-lighter after:content-[""]`}
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
            }}
            className={`bg-gradient-radial absolute inset-0 h-[300px] w-[300px] overflow-hidden rounded-full from-cyan-500/20 via-violet-500/10 to-transparent blur-3xl`}
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
        </motion.div>
    );
};

const BASE_ANIMATIONS = {
    transition: {
        duration: 1.2,
        ease: [0.19, 1, 0.22, 1],
    },
    fade: {
        initial: {
            opacity: 0,
            scale: 0.95,
            filter: 'blur(10px)',
            y: 20,
        },
        animate: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            y: 0,
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            filter: 'blur(10px)',
            y: -20,
            transition: {
                duration: 0.8,
                ease: [0.19, 1, 0.22, 1],
            },
        },
    },
};

type StepProps = {
    delay: number;
    onComplete: () => void;
    duration?: number;
    isInteractive?: boolean;
};

const WelcomeStep = ({ duration = 4000, delay, onComplete }: StepProps) => (
    <motion.div
        key='welcome'
        {...BASE_ANIMATIONS.fade}
        transition={{
            ...BASE_ANIMATIONS.transition,
            delay,
        }}
        className='flex flex-col items-center justify-center space-y-8'>
        {/* Logo */}
        <motion.div {...BASE_ANIMATIONS.fade} transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }} className='relative mx-auto mb-6 flex h-24 w-24'>
            {/* Holographic glow effect */}
            <motion.div
                animate={{
                    boxShadow: ['0 0 20px rgba(255,255,255,0.1)', '0 0 60px rgba(255,255,255,0.2)', '0 0 20px rgba(255,255,255,0.1)'],
                    filter: ['brightness(1) blur(8px)', 'brightness(1.2) blur(12px)', 'brightness(1) blur(8px)'],
                }}
                exit={{
                    boxShadow: '0 0 0px rgba(255,255,255,0)',
                    filter: 'brightness(0.5) blur(20px)',
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5'
            />
            <svg className='relative' width='80' height='80' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby='logoTitle'>
                <title id='logoTitle'>Logo</title>
                <g clipPath='url(#clip0_1208_27417)'>
                    <path
                        d='M27.512 73.5372L27.512 28.512C27.512 27.9597 27.9597 27.512 28.512 27.512L70.4597 27.512C71.0229 27.512 71.475 27.9769 71.4593 28.54L70.8613 49.9176C70.8462 50.4588 70.4031 50.8896 69.8617 50.8896L50.7968 50.8896C49.891 50.8896 49.4519 51.9975 50.1117 52.618L92.25 92.25M92.25 92.25L48.2739 92.25L7.75002 92.25C7.19773 92.25 6.75002 91.8023 6.75002 91.25L6.75 7.75C6.75 7.19771 7.19772 6.75 7.75 6.75L91.25 6.75003C91.8023 6.75003 92.25 7.19775 92.25 7.75003L92.25 92.25Z'
                        stroke='white'
                        strokeWidth='8'
                    />
                </g>
                <defs>
                    <clipPath id='clip0_1208_27417'>
                        <rect width='100' height='100' fill='white' />
                    </clipPath>
                </defs>
            </svg>
        </motion.div>
        {/* Title */}
        <motion.h1
            {...BASE_ANIMATIONS.fade}
            transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 }}
            className='font-outfit bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-7xl font-bold text-transparent'>
            Welcome to Rthmn
        </motion.h1>
        {/* Subtitle */}
        <motion.p {...BASE_ANIMATIONS.fade} transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.6 }} className='font-outfit text-lg text-white/60'>
            The future of trading and first gamified trading platform.
        </motion.p>
        {/* Begin Button */}
        <motion.button
            {...BASE_ANIMATIONS.fade}
            transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.6 }}
            onClick={onComplete}
            className='group relative mt-4 overflow-hidden rounded-xl bg-white/10 px-6 py-3 font-mono text-sm text-white/90 hover:bg-white/20'>
            <div className='absolute inset-0 bg-gradient-to-r from-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100' />
            <span className='relative'>Begin</span>
        </motion.button>
    </motion.div>
);

const PatternRecognitionStep = ({ duration = 8000, delay, onComplete }: StepProps) => (
    <motion.div
        key='pattern'
        {...BASE_ANIMATIONS.fade}
        transition={{
            ...BASE_ANIMATIONS.transition,
            delay,
        }}
        onAnimationComplete={() => {
            setTimeout(onComplete, duration);
        }}
        className='flex max-w-3xl flex-col items-center justify-center space-y-12'>
        <motion.div {...BASE_ANIMATIONS.fade} transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }} className='relative space-y-6'>
            <div className='space-y-2'>
                <motion.div
                    {...BASE_ANIMATIONS.fade}
                    transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.5 }}
                    className='font-outfit text-center text-4xl leading-tight font-bold tracking-tight text-balance'>
                    <span className='bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent'>
                        Rthmn is a tool designed to compress time allowing you to see the position of the market in a way that is not possible with traditional tools
                    </span>
                </motion.div>
            </div>
        </motion.div>
        <motion.div {...BASE_ANIMATIONS.fade} transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.8 }} className='relative space-y-6'>
            <p className='font-outfit w-full max-w-xl text-center text-xl font-normal text-white/70'>
                We are still in the early stages of development, and we are excited to share our vision with you.
            </p>
        </motion.div>
    </motion.div>
);

const VisionStep = ({ duration, delay, onComplete }: StepProps) => (
    <motion.div
        key='vision'
        {...BASE_ANIMATIONS.fade}
        transition={{
            ...BASE_ANIMATIONS.transition,
            delay,
        }}
        onAnimationComplete={() => {
            setTimeout(onComplete, duration);
        }}
        className='max-w-3xl space-y-16 text-center'>
        <motion.div {...BASE_ANIMATIONS.fade} transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }} className='relative space-y-8'>
            {/* Main heading with gradient */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='relative'>
                <h2 className='font-outfit relative bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-6xl leading-tight font-bold tracking-tight text-transparent'>
                    Trading from another dimension
                </h2>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ duration: 1.5, delay: delay + 0.4 }}
                    className='mx-auto mt-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent'
                />
            </motion.div>

            {/* Subtitle with gradient background */}
            <motion.div {...BASE_ANIMATIONS.fade} transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.5 }} className='relative mx-auto max-w-xl'>
                <p className='font-outfit text-2xl leading-relaxed tracking-wide text-white/70'>Multi-dimensional wave analysis across any timeframe</p>
            </motion.div>
        </motion.div>

        {/* Markets list */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.8 }}
            className='relative mx-auto flex max-w-lg flex-col items-center gap-10'>
            <div className='flex items-center gap-10 font-mono text-sm tracking-wider'>
                {['Forex', 'Stocks', 'Crypto', 'Metals', 'Indices'].map((market, i) => (
                    <motion.div
                        key={market}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: delay + 0.8 + i * 0.1 }}
                        className='group relative'>
                        <motion.div className='absolute -inset-4 rounded-lg bg-white/0 transition-all duration-300 group-hover:bg-white/5' whileHover={{ scale: 1.1 }} />
                        <span className='relative text-white/40 transition-all duration-300 group-hover:text-white/90'>{market}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    </motion.div>
);

const IntelligenceStep = ({ duration, delay, onComplete }: StepProps) => (
    <motion.div
        key='intelligence'
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transitionEnd: { opacity: 0, scale: 0.95, y: -20, filter: 'blur(15px)' },
        }}
        transition={{
            ...BASE_ANIMATIONS.transition,
            delay,
            duration: duration / 1000,
        }}
        onAnimationComplete={onComplete}
        className='max-w-2xl space-y-6'>
        <div className='space-y-4'>
            <motion.p
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }}
                className='font-outfit text-2xl text-white/90 [text-shadow:_0_0_30px_rgba(255,255,255,0.2)]'>
                Our high-performance algorithms process large amounts of data and perform complex calculations in real time.
            </motion.p>
            <motion.p
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 }}
                className='font-mono text-lg text-white/60'>
                With Rthmn, the past and present are guides to the future.
            </motion.p>
        </div>
    </motion.div>
);

const LegalStep = ({ delay, onComplete }: Omit<StepProps, 'duration'>) => {
    const [accepted, setAccepted] = useState(false);

    return (
        <motion.div
            key='legal'
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
            }}
            transition={{
                ...BASE_ANIMATIONS.transition,
                delay,
            }}
            className='max-w-xl space-y-6'>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='font-outfit mb-8 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-center text-3xl font-bold text-transparent'>
                Terms of Service
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='space-y-6 rounded-xl border border-white/10 bg-white/5 p-6'>
                <p className='font-mono text-sm leading-relaxed text-white/60'>
                    By checking this box, I acknowledge that I have read and agree to Rthmn's{' '}
                    <a href='/terms' target='_blank' rel='noopener noreferrer' className='font-bold text-white underline'>
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href='/privacy' target='_blank' rel='noopener noreferrer' className='font-bold text-white underline'>
                        Privacy Policy
                    </a>
                    . I understand that my use of the platform is subject to these agreements.
                </p>

                <div className='flex items-center gap-3'>
                    <button
                        onClick={() => setAccepted(!accepted)}
                        className={`group relative h-6 w-6 overflow-hidden rounded-md border transition-all ${
                            accepted ? 'border-white-500 bg-white-500/20' : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}>
                        <motion.div
                            initial={false}
                            animate={{
                                opacity: accepted ? 1 : 0,
                                scale: accepted ? 1 : 0.8,
                            }}
                            transition={{ duration: 0.2 }}
                            className='text-white-400 absolute inset-0 flex items-center justify-center'>
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M20 6L9 17L4 12' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
                            </svg>
                        </motion.div>
                    </button>
                    <label className='cursor-pointer font-mono text-sm text-white/70 select-none'>I agree to the terms and conditions</label>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.4 }} className='flex justify-center'>
                <button
                    onClick={() => {
                        if (accepted) {
                            setAccepted(true);
                            onComplete();
                        }
                    }}
                    disabled={!accepted}
                    className={`group relative overflow-hidden rounded-xl px-8 py-3 transition-all ${
                        accepted ? 'bg-white/10 hover:bg-white/20' : 'cursor-not-allowed bg-white/5 text-white/30'
                    }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r from-white/10 to-white/0 opacity-0 transition-opacity ${accepted ? '' : ''}`} />
                    <span className='relative font-mono text-sm text-white/90'>Continue</span>
                </button>
            </motion.div>
        </motion.div>
    );
};

const AudioButton = ({ audioRef, isMuted, onToggleMute }: { audioRef: React.RefObject<HTMLAudioElement>; isMuted: boolean; onToggleMute: () => void }) => {
    if (!audioRef.current) return null;

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMute}
            className='group absolute right-8 bottom-2 z-50 flex h-8 items-center'>
            <div className='flex items-center gap-[2px]'>
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            height: isMuted ? 10 : [10, 18, 10],
                            opacity: isMuted ? 0.3 : 1,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                        className='w-[1px] rounded-full bg-gradient-to-b from-white/60 to-white/20'
                    />
                ))}
            </div>

            <motion.div
                className='absolute inset-0 rounded-full bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100'
                initial={false}
                animate={{
                    opacity: isMuted ? 0 : [0, 0.1, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </motion.button>
    );
};

export default function IntroSequence({ onComplete }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return <WelcomeStep key='welcome' duration={5000} delay={1} onComplete={handleStepComplete} />;
            case 1:
                return <PatternRecognitionStep key='pattern' duration={10000} delay={0} onComplete={handleStepComplete} />;
            case 2:
                return <IntelligenceStep key='intelligence' duration={8000} delay={0} onComplete={handleStepComplete} />;
            case 3:
                return <VisionStep key='vision' duration={6000} delay={0} onComplete={handleStepComplete} />;
            case 4:
                return <LegalStep key='legal' delay={0} onComplete={handleStepComplete} />;
            default:
                return null;
        }
    };

    const totalSteps = Object.keys(Object.fromEntries(Object.entries(renderCurrentStep.toString().match(/case \d+:/g) || []))).length;

    const playAudio = useCallback(() => {
        if (!audioRef.current) {
            const audio = new Audio('/onboarding.mp3');
            audio.loop = true;
            audio.volume = 0;
            audioRef.current = audio;
        }

        audioRef.current
            .play()
            .then(() => {
                // Fade in
                let volume = 0;
                const fadeIn = setInterval(() => {
                    if (volume < 0.3) {
                        volume += 0.01;
                        if (audioRef.current) {
                            audioRef.current.volume = volume;
                        }
                    } else {
                        clearInterval(fadeIn);
                    }
                }, 50);
            })
            .catch((e) => console.log('Audio playback failed:', e));
    }, []);

    const toggleMute = useCallback(() => {
        if (!audioRef.current) return;
        setIsMuted((prev) => {
            const newMuted = !prev;
            audioRef.current!.volume = newMuted ? 0 : 0.3;
            return newMuted;
        });
    }, []);

    const handleStepComplete = useCallback(() => {
        // Start audio on first step completion
        if (currentStep === 0) {
            playAudio();
        }

        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsExiting(true);
            setTimeout(onComplete, 1000);
        }
    }, [currentStep, onComplete, totalSteps, playAudio]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return (
        <AnimatePresence mode='wait'>
            <motion.div
                initial={{ opacity: 1 }}
                animate={{
                    opacity: isExiting ? 0 : 1,
                    filter: isExiting ? 'blur(20px)' : 'blur(0px)',
                }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className='fixed inset-0 z-[1000] overflow-hidden bg-black'>
                <AuroraBackground isExiting={isExiting} />
                <LightShadows isExiting={isExiting} />
                <StarField isExiting={isExiting} />
                <AudioButton audioRef={audioRef} isMuted={isMuted} onToggleMute={toggleMute} />
                <motion.div className='no-select relative z-10 flex h-full items-center justify-center'>{renderCurrentStep()}</motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
