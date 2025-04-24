import { motion } from 'framer-motion';
import Link from 'next/link';
import type { FC } from 'react';
import { FaArrowRight } from 'react-icons/fa';

interface StartButtonProps {
    href?: string;
    children?: React.ReactNode;
    custom?: number;
    variant?: 'default' | 'shimmer' | 'shimmer-sm';
    onClick?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
}

export const StartButton: FC<StartButtonProps> = ({
    href,
    children = 'Start Now',
    custom = 0,
    variant = 'default',
    onClick,
    disabled = false,
    isLoading = false,
}) => {
    const combinedVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                opacity: { delay: custom * 0.1, duration: 0.3 },
                y: { delay: custom * 0.1, duration: 0.3 },
            },
        },
    };

    const buttonStyles = {
        default: {
            wrapper:
                'relative bg-gradient-to-r from-white/90 via-white/95 to-white/90 text-zinc-800 hover:from-white hover:via-white hover:to-white before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0)_20%,rgba(255,255,255,0.2)_35%,rgba(255,255,255,0.1)_45%,rgba(255,255,255,0.2)_55%,rgba(255,255,255,0)_80%,transparent_100%)] before:bg-[length:300%_100%] before:animate-[shimmer_6s_linear_infinite]',
            inner: 'bg-gradient-to-b from-white/5 to-black/5',
            shimmer: '',
            size: 'px-8 py-4 text-[15px]',
        },
        shimmer: {
            wrapper:
                'relative bg-gradient-to-r from-white/95 via-white to-white/95 text-zinc-800 backdrop-blur-sm hover:from-white hover:via-white hover:to-white before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0)_10%,rgba(255,255,255,0.4)_45%,rgba(255,255,255,0.2)_55%,rgba(255,255,255,0.4)_80%,rgba(255,255,255,0)_90%,transparent_100%)] before:bg-[length:400%_100%] before:animate-[shimmer_4s_linear_infinite] before:backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,1),inset_0_-1px_0px_rgba(0,0,0,0.1)] after:absolute after:inset-0 after:rounded-full after:shadow-[0_0_15px_rgba(255,255,255,0.2),inset_0_2px_2px_rgba(0,0,0,0.1)]',
            inner: 'bg-gradient-to-b from-transparent via-black/10 to-black/40',
            shimmer: '',
            size: 'px-8 py-4 text-[15px]',
        },
        'shimmer-sm': {
            wrapper:
                'relative bg-gradient-to-r from-white/95 via-white to-white/95 text-zinc-800 backdrop-blur-sm hover:from-white hover:via-white hover:to-white before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0)_10%,rgba(255,255,255,0.4)_45%,rgba(255,255,255,0.2)_55%,rgba(255,255,255,0.4)_80%,rgba(255,255,255,0)_90%,transparent_100%)] before:bg-[length:400%_100%] before:animate-[shimmer_4s_linear_infinite] before:backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,1),inset_0_-1px_0px_rgba(0,0,0,0.1)] after:absolute after:inset-0 after:rounded-full after:shadow-[0_0_15px_rgba(255,255,255,0.2),inset_0_2px_2px_rgba(0,0,0,0.1)]',
            inner: 'bg-gradient-to-b from-transparent via-black/10 to-black/40',
            shimmer: '',
            size: 'px-4 py-2 text-sm',
        },
    };

    const styles = buttonStyles[variant];

    const ButtonContent = () => (
        <span
            className={`relative flex w-full items-center justify-center space-x-3 rounded-full ${styles.size} font-semibold tracking-wide transition-all duration-300 group-hover:tracking-wider text-zinc-800 drop-shadow-sm`}
        >
            {isLoading ? (
                <div className='flex items-center gap-3'>
                    <svg
                        className={`${variant === 'shimmer-sm' ? 'h-4 w-4' : 'h-5 w-5'} animate-[spin_1.5s_linear_infinite]`}
                        viewBox='0 0 24 24'
                        aria-labelledby='loadingSpinnerTitle'
                    >
                        <title id='loadingSpinnerTitle'>Loading spinner animation</title>
                        <circle
                            className='opacity-20'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='3'
                            fill='none'
                        />
                        <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                    </svg>
                    <span className='inline-flex items-center animate-pulse'>
                        Redirecting to Checkout
                        <span className='ml-1 inline-flex tracking-wider'>
                            <span className='animate-[bounce_1.4s_infinite]' style={{ animationDelay: '0.0s' }}>
                                .
                            </span>
                            <span className='animate-[bounce_1.4s_infinite]' style={{ animationDelay: '0.2s' }}>
                                .
                            </span>
                            <span className='animate-[bounce_1.4s_infinite]' style={{ animationDelay: '0.4s' }}>
                                .
                            </span>
                        </span>
                    </span>
                </div>
            ) : (
                <div className='flex items-center gap-2'>
                    {children}
                    <FaArrowRight
                        className={`${variant === 'shimmer-sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} transition-transform duration-300 group-hover:translate-x-1`}
                    />
                </div>
            )}
        </span>
    );

    const buttonClasses = `group relative flex items-center overflow-hidden rounded-full ${
        styles.wrapper
    } p-[2px] transition-all duration-300 font-outfit ${
        disabled
            ? 'cursor-not-allowed opacity-50'
            : isLoading
              ? 'cursor-wait'
              : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_30px_rgba(16,185,129,0.3),inset_0_1px_0px_rgba(255,255,255,1),inset_0_-1px_0px_rgba(0,0,0,0.1)] hover:after:opacity-100'
    }`;

    return (
        <>
            <style jsx global>{`
                @keyframes shimmer {
                    0% {
                        background-position: 200% 50%;
                    }
                    100% {
                        background-position: -100% 50%;
                    }
                }
            `}</style>
            <motion.div
                variants={combinedVariants}
                initial='hidden'
                animate='visible'
                custom={custom}
                whileTap={!disabled ? { scale: 0.985 } : undefined}
                className='inline-block rounded-full'
            >
                {onClick ? (
                    <button type='button' onClick={onClick} disabled={disabled || isLoading} className={buttonClasses}>
                        <span
                            className={`relative flex w-full items-center rounded-full ${styles.inner} backdrop-blur-[2px]`}
                        >
                            <ButtonContent />
                        </span>
                    </button>
                ) : (
                    <Link href={href} className={buttonClasses}>
                        <span
                            className={`relative flex w-full items-center rounded-full ${styles.inner} backdrop-blur-[2px]`}
                        >
                            <ButtonContent />
                        </span>
                    </Link>
                )}
            </motion.div>
        </>
    );
};
