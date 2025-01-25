import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

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
                opacity: { duration: 2.5 },
                filter: { duration: 2.5 },
            }}
            className={`bg-gradient-radial absolute inset-0 h-[300px] w-[300px] overflow-hidden rounded-full from-blue-500/20 via-violet-500/10 to-transparent blur-3xl`}
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
        initial: { opacity: 0, filter: 'blur(10px)' },
        animate: { opacity: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(15px)', y: -20 },
    },
};

type StepProps = {
    duration: number;
    delay: number;
    onComplete: () => void;
};

const WelcomeStep = ({ duration, delay, onComplete }: StepProps) => (
    <motion.div
        key='welcome'
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{
            opacity: 1,
            filter: 'blur(0px)',
            transitionEnd: { opacity: 0, y: -20, filter: 'blur(15px)' },
        }}
        transition={{
            ...BASE_ANIMATIONS.transition,
            delay,
            duration: duration / 1000,
        }}
        onAnimationComplete={onComplete}
        className='space-y-4'>
        {/* Logo */}
        <motion.div
            initial={{ scale: 0.8, opacity: 0, filter: 'brightness(0.5) blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'brightness(1) blur(0px)' }}
            exit={{ scale: 0.9, opacity: 0, filter: 'brightness(1.2) blur(15px)' }}
            transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }}
            className='relative mx-auto mb-6 h-24 w-24'>
            {/* Holographic glow effect */}
            <motion.div
                animate={{
                    boxShadow: ['0 0 20px rgba(255,255,255,0.1)', '0 0 60px rgba(255,255,255,0.2)', '0 0 20px rgba(255,255,255,0.1)'],
                    filter: ['brightness(1) blur(8px)', 'brightness(1.2) blur(12px)', 'brightness(1) blur(8px)'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-white/5'
            />
            <div className='absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-transparent p-2'>
                <svg width='80' height='80' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby='logoTitle'>
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
            </div>
        </motion.div>
        {/* Title */}
        <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 }}
            className='font-outfit bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-7xl font-bold text-transparent'>
            Welcome to Rthmn
        </motion.h1>
        {/* Subtitle */}
    </motion.div>
);

const PatternRecognitionStep = ({ duration, delay, onComplete }: StepProps) => (
    <motion.div
        key='description1'
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
        <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
            transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }}
            className='font-outfit text-2xl font-medium text-white/90 [text-shadow:_0_0_30px_rgba(255,255,255,0.2)]'>
            Universal Pattern Recognition
        </motion.p>
        <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
            transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 }}
            className='font-mono text-lg text-white/60'>
            Discover hidden market patterns with our advanced algorithms
        </motion.p>
    </motion.div>
);

const MultiMarketStep = ({ duration, delay, onComplete }: StepProps) => (
    <motion.div
        key='description2'
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
                Multi-Market Analysis
            </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 }}
                className='flex justify-center gap-8 font-mono text-white/60'>
                {['Forex', '•', 'Stocks', '•', 'Crypto'].map((text, i) => (
                    <motion.span
                        key={text}
                        initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                        transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 + i * 0.1 }}>
                        {text}
                    </motion.span>
                ))}
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.8 }}
                className='font-mono text-white/50'>
                Unified analysis across all major markets
            </motion.p>
        </div>
    </motion.div>
);

const IntelligenceStep = ({ duration, delay, onComplete }: StepProps) => (
    <motion.div
        key='description3'
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
                Real-Time Intelligence
            </motion.p>
            <motion.p
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 }}
                className='font-mono text-lg text-white/60'>
                83% accuracy in major market moves
            </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.6 }}
                className='flex justify-center gap-6 font-mono text-white/50'>
                {['Pattern Detection', '•', 'Price Action', '•', 'Momentum'].map((text, i) => (
                    <motion.span
                        key={text}
                        initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                        transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.6 + i * 0.1 }}>
                        {text}
                    </motion.span>
                ))}
            </motion.div>
        </div>
    </motion.div>
);

export default function IntroSequence({ onComplete }: Props) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return <WelcomeStep duration={4000} delay={1} onComplete={handleStepComplete} />;
            case 1:
                return <PatternRecognitionStep duration={4000} delay={0} onComplete={handleStepComplete} />;
            case 2:
                return <MultiMarketStep duration={4000} delay={0} onComplete={handleStepComplete} />;
            case 3:
                return <IntelligenceStep duration={4000} delay={0} onComplete={handleStepComplete} />;
            default:
                return null;
        }
    };

    const totalSteps = Object.keys(Object.fromEntries(Object.entries(renderCurrentStep.toString().match(/case \d+:/g) || []))).length;

    const handleStepComplete = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsExiting(true);
            setTimeout(onComplete, 1000);
        }
    }, [currentStep, onComplete, totalSteps]);

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
                <motion.div className='no-select relative z-10 flex h-full items-center justify-center'>{renderCurrentStep()}</motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
