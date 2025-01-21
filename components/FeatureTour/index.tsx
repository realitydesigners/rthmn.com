'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TooltipPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface TourState {
    isActive: boolean;
    hasCompleted: boolean;
}

interface FeatureTourProps {
    featureId: string;
    children: React.ReactNode | ((state: TourState) => React.ReactNode);
    tooltipContent: React.ReactNode;
    isActive?: boolean;
    onComplete?: () => void;
    className?: string;
    tooltipClassName?: string;
}

export function FeatureTour({ featureId, children, tooltipContent, isActive = false, onComplete, className, tooltipClassName }: FeatureTourProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
    const [hasCompleted, setHasCompleted] = useState(false);

    useEffect(() => {
        if (!isActive || hasCompleted) return;

        const timer = setTimeout(() => {
            setShowTooltip(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [isActive, hasCompleted]);

    useEffect(() => {
        if (!showTooltip) return;

        const updatePosition = () => {
            const element = document.querySelector(`[data-feature="${featureId}"]`);
            if (!element) return;

            const rect = element.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [showTooltip, featureId]);

    const handleComplete = () => {
        setShowTooltip(false);
        setHasCompleted(true);
        onComplete?.();
    };

    const renderChildren = () => {
        if (typeof children === 'function') {
            return children({ isActive, hasCompleted });
        }
        return children;
    };

    return (
        <>
            <div data-feature={featureId} className={cn(`relative ${isActive && !hasCompleted ? 'z-50' : ''}`, className)}>
                {renderChildren()}
                {isActive && !hasCompleted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='absolute inset-0 rounded-lg ring-1 shadow-[inset_0_0_30px_rgba(59,130,246,0.3),0_0_20px_rgba(59,130,246,0.2)] ring-blue-500/50 ring-offset-1 ring-offset-black/10 transition-all duration-300'
                    />
                )}
            </div>

            {typeof window !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {showTooltip && tooltipPosition && !hasCompleted && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={cn('fixed z-50 w-64 rounded-lg border border-[#181818] bg-[#0a0a0a] p-4 shadow-xl', tooltipClassName)}>
                                <div className='mb-4 text-gray-300'>{tooltipContent}</div>
                                <button onClick={handleComplete} className='w-full rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400'>
                                    Got it
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
}
