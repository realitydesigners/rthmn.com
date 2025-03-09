'use client';
import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import type { Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { createClient } from '@/lib/supabase/client';

function useSignInWithOAuth() {
    const supabase = createClient();

    return async (e: React.FormEvent<HTMLFormElement>, provider: Provider) => {
        e.preventDefault();
        const redirectURL = getURL('/auth/callback');

        if (provider === 'discord') {
            await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectURL,
                    scopes: 'identify',
                },
            });
        } else {
            await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectURL,
                },
            });
        }
    };
}

const AuroraBackground = () => (
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

const StarField = () => {
    const [mounted, setMounted] = useState(false);
    const [stars, setStars] = useState<
        Array<{
            id: number;
            x: number;
            y: number;
            size: number;
            duration: number;
            delay: number;
        }>
    >([]);

    useEffect(() => {
        const generateStars = () => {
            const newStars = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: 1 + Math.random() * 2,
                duration: 15 + Math.random() * 20,
                delay: Math.random() * -15,
            }));
            setStars(newStars);
        };

        generateStars();
        setMounted(true);

        const handleResize = () => {
            generateStars();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) return null;

    return (
        <div className='absolute inset-0 overflow-hidden'>
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    initial={{
                        opacity: 0.1,
                        x: star.x,
                        y: star.y,
                    }}
                    animate={{
                        opacity: [0.1, 0.5, 0.1],
                        y: [star.y, -100],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                    }}
                    className='absolute'>
                    <div
                        style={{
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                        }}
                        className='rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default function SignIn() {
    const signInWithOAuth = useSignInWithOAuth();

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signInWithOAuth(e, 'google');
        } catch (error) {
            console.error('OAuth sign-in error:', error);
        }
    };

    return (
        <div className='relative min-h-screen w-full overflow-hidden bg-black'>
            {/* Gradient Background */}
            <div className='absolute inset-0 bg-gradient-to-b from-black via-black/10 via-black/20 via-black/40 via-black/60 via-black/80 to-transparent' />
            <AuroraBackground />
            <StarField />

            {/* Content Overlay */}
            <div className='relative flex min-h-screen flex-col items-center justify-center px-6 py-16'>
                <div className='w-full max-w-[320px] space-y-12 sm:max-w-[380px] lg:w-[420px] lg:max-w-lg'>
                    <div className='space-y-4'>
                        <div className='space-y-3'>
                            <h1 className='font-outfit bg-gradient-to-br from-white via-white to-gray-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-5xl'>
                                Trading from another dimension
                            </h1>
                            <p className='font-kodemono max-w-[90%] text-base text-gray-400/90 sm:text-lg'>Take your trading to a new level.</p>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <form onSubmit={handleSignIn}>
                            <button
                                className='group relative w-full overflow-hidden rounded-lg bg-white/10 p-[1px] transition-all duration-300 hover:scale-[1.01] focus:ring-2 focus:ring-blue-500/20 focus:outline-none active:scale-[0.99]'
                                type='submit'>
                                <span className='relative flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 font-mono text-base font-medium text-gray-900 shadow-[inset_0_1px_1px_rgba(0,0,0,0.075),inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:bg-gray-100 lg:py-2.5'>
                                    <div className='absolute inset-0 -translate-x-full animate-[shine-loop_5s_ease-in-out_infinite] bg-[linear-gradient(-60deg,transparent_0%,transparent_25%,rgba(229,231,235,0.9)_35%,rgba(229,231,235,0.9)_45%,transparent_75%,transparent_100%)] group-hover:animate-[shine-loop_5s_ease-in-out_infinite]' />
                                    <FcGoogle className='relative mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5' />
                                    <span className='relative text-base sm:text-base'>Continue with Google</span>
                                </span>
                            </button>
                        </form>
                        <p className='text-center font-mono text-xs text-gray-500/90'>
                            Currently in beta. By signing in, you agree to our{' '}
                            <a href='/terms' className='text-gray-400 transition-colors hover:text-gray-300'>
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href='/privacy' className='text-gray-400 transition-colors hover:text-gray-300'>
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shine-loop {
                    0% {
                        transform: translateX(-200%);
                    }
                    100% {
                        transform: translateX(200%);
                    }
                }
            `}</style>
        </div>
    );
}
