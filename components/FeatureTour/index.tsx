'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { IconType } from 'react-icons';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';

export function FeatureTour({
    icon: Icon,
    onClick,
    isActive,
    tourId,
    className,
    children,
}: {
    icon: IconType;
    onClick: () => void;
    isActive: boolean;
    tourId: string;
    className?: string;
    children: any;
}) {
    const { currentStepId, completeStep, goToNextStep, isStepCompleted } = useOnboardingStore();
    const [showTooltip, setShowTooltip] = useState(false);
    const isCurrentTour = currentStepId === tourId;
    const isCompleted = isStepCompleted(tourId);

    useEffect(() => {
        if (!isCurrentTour || isCompleted) return;

        const timer = setTimeout(() => {
            setShowTooltip(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [isCurrentTour, isCompleted]);

    const handleComplete = () => {
        completeStep(tourId);
        goToNextStep();
        setShowTooltip(false);
    };

    return (
        <>
            <button
                onClick={onClick}
                className={cn(
                    'group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                    'border border-transparent bg-transparent',
                    'hover:border-[#333] hover:bg-gradient-to-b hover:from-[#181818] hover:to-[#0F0F0F] hover:shadow-lg hover:shadow-black/20',
                    isActive && 'text-white hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414]',
                    isCurrentTour && !isCompleted && 'shadow-[inset_0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[inset_0_0_50px_rgba(96,165,250,0.5)]',
                    className
                )}>
                <Icon
                    size={20}
                    className={cn('transition-colors', {
                        'text-blue-500/70 group-hover:text-blue-400/90': isCurrentTour && !isCompleted,
                        'text-[#818181] group-hover:text-white': !isCurrentTour || isCompleted,
                    })}
                />
            </button>
            {typeof window !== 'undefined' && (
                <AnimatePresence>
                    {showTooltip && !isCompleted && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className='fixed top-18 left-20 z-50'>
                            {React.cloneElement(children, { onComplete: handleComplete })}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </>
    );
}
