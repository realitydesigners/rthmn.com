'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const AuroraBackground = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{
            opacity: 0.3,
            backgroundPosition: ['0% 50%, 0% 50%', '100% 50%, 100% 50%'],
            filter: 'blur(30px)',
        }}
        transition={{
            backgroundPosition: {
                duration: 60,
                repeat: Infinity,
                ease: 'linear',
            },
        }}
        className={`pointer-events-none absolute inset-0 overflow-hidden [background-image:var(--white-gradient),var(--aurora)] [background-size:200%,_200%] [background-position:0%_50%,0%_50%] backdrop-blur-[100px] will-change-transform [--aurora:repeating-linear-gradient(100deg,rgba(59,130,246,0.3)_10%,rgba(99,102,241,0.2)_15%,rgba(147,197,253,0.3)_20%,rgba(167,139,250,0.2)_25%,rgba(96,165,250,0.3)_30%)] [--white-gradient:repeating-linear-gradient(100deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.05)_16%)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] after:absolute after:inset-0 after:animate-[aurora_15s_linear_infinite] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_200%] after:[background-attachment:fixed]`}
    />
);

export const StarField = () => {
    const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 }); // Default fallback dimensions

    useEffect(() => {
        // Update dimensions on mount and window resize
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    return (
        <div className='absolute inset-0 overflow-hidden'>
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        opacity: 0.1,
                        x: Math.random() * dimensions.width,
                        y: Math.random() * dimensions.height,
                    }}
                    animate={{
                        opacity: [0.1, 0.5, 0.1],
                        y: [Math.random() * dimensions.height, -100],
                    }}
                    transition={{
                        duration: 15 + Math.random() * 20,
                        repeat: Infinity,
                        delay: Math.random() * -15,
                    }}
                    className='absolute'>
                    <div
                        style={{
                            width: `${1 + Math.random() * 2}px`,
                            height: `${1 + Math.random() * 2}px`,
                        }}
                        className='rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    />
                </motion.div>
            ))}
        </div>
    );
};

export const Background = () => (
    <>
        <div className='absolute inset-0 bg-gradient-to-b from-black via-black/10 via-black/20 via-black/40 via-black/60 via-black/80 to-transparent' />
        <AuroraBackground />
        <StarField />
    </>
);
