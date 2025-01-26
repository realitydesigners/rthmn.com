'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
import { cn } from '@/utils/cn';

const formatPrice = (price: number) => {
    return price.toFixed(price >= 100 ? 2 : 5);
};

interface LoadingSpinnerProps {
    color?: string;
    itemId: string;
}

export const LoadingSpinner = ({ color = '#3b82f6', itemId }: LoadingSpinnerProps) => {
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFallback(true);
        }, 10000);

        return () => clearTimeout(timer);
    }, [itemId]);

    if (showFallback) {
        return <span className='font-mono text-[11px] tracking-wider opacity-50'>N/A</span>;
    }

    return (
        <div className='relative h-3 w-3'>
            <div className='absolute inset-0 rounded-full border-2' style={{ borderColor: `${color}20` }}></div>
            <div className='absolute inset-0 animate-spin rounded-full border-t-2' style={{ borderColor: color }}></div>
        </div>
    );
};

export const SelectedPairs = () => {
    const { selectedPairs, togglePair } = useDashboard();
    const { priceData } = useWebSocket();
    const { currentStepId } = useOnboardingStore();
    const isOnboardingActive = currentStepId === 'instruments';

    if (selectedPairs.length === 0) return null;

    return (
        <div className='mb-4'>
            <div className='font-kodemono mb-2 flex h-8 items-center text-xs font-medium tracking-wider text-[#818181]'>
                <span className='uppercase'>Selected Pairs</span>
                <span className='ml-auto text-[#444]'>{selectedPairs.length}</span>
            </div>
            <div className='space-y-1'>
                {selectedPairs.map((item) => (
                    <div
                        key={item}
                        className={cn(
                            'group relative flex h-9 cursor-default items-center justify-between overflow-hidden rounded-lg border border-transparent bg-[#111] px-3 transition-all select-none hover:border-[#333]',
                            isOnboardingActive && [
                                // Intense inner glow layers
                                'shadow-[inset_0_0_50px_rgba(59,130,246,0.5)]',
                                'shadow-[inset_0_0_30px_rgba(59,130,246,0.4)]',
                                'shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]',
                                // Strong outer glow
                                'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
                                // Hover effects with increased intensity
                                'hover:shadow-[inset_0_0_60px_rgba(59,130,246,0.6)]',
                                'hover:shadow-[inset_0_0_40px_rgba(59,130,246,0.5)]',
                                'hover:shadow-[inset_0_0_25px_rgba(59,130,246,0.4)]',
                                'hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]',
                                'hover:border-blue-500/40',
                                // Smooth transitions
                                'transition-all duration-300',
                                // Animated gradient background using pseudo-element
                                'before:absolute before:inset-0 before:-z-10 before:animate-pulse before:bg-gradient-to-r before:from-blue-500/[0.15] before:via-transparent before:to-blue-500/[0.15] before:transition-opacity hover:before:from-blue-500/[0.25] hover:before:to-blue-500/[0.25]',
                            ]
                        )}>
                        <div className='relative z-10 flex items-center overflow-hidden'>
                            <span className='font-outfit truncate text-[13px] font-bold tracking-wider text-white'>{item}</span>
                        </div>
                        <div className='relative z-10 flex shrink-0 items-center gap-3'>
                            <span className='font-kodemono text-[13px] font-medium tracking-wider text-[#666] transition-all'>
                                {priceData[item]?.price ? formatPrice(priceData[item].price) : <LoadingSpinner key={`${item}-loading`} itemId={item} color='#3b82f6' />}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePair(item);
                                }}
                                className='flex h-5 w-5 items-center justify-center rounded-md border border-red-400 bg-red-400/80 opacity-0 transition-all group-hover:opacity-100 hover:text-white'>
                                <FaTimes size={10} className='text-black' />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
