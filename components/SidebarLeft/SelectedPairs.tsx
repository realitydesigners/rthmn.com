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
                <div className='ml-auto flex items-center gap-1.5'>
                    <div className='h-1.5 w-1.5 rounded-full bg-emerald-400/50'></div>
                    <span className='text-[#444]'>{selectedPairs.length}</span>
                </div>
            </div>
            <div className='space-y-1'>
                {selectedPairs.map((item) => (
                    <div
                        key={item}
                        className={cn(
                            'group/item relative flex h-10 items-center justify-between overflow-hidden rounded-lg border border-transparent bg-gradient-to-b from-[#141414] to-[#0F0F0F] px-3 transition-all select-none',
                            'hover:border-[#222] hover:from-[#161616] hover:to-[#111]',
                            isOnboardingActive && [
                                'shadow-[inset_0_0_50px_rgba(59,130,246,0.5)]',
                                'shadow-[inset_0_0_30px_rgba(59,130,246,0.4)]',
                                'shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]',
                                'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
                                'hover:shadow-[inset_0_0_60px_rgba(59,130,246,0.6)]',
                                'hover:shadow-[inset_0_0_40px_rgba(59,130,246,0.5)]',
                                'hover:shadow-[inset_0_0_25px_rgba(59,130,246,0.4)]',
                                'hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]',
                                'hover:border-blue-500/40',
                                'transition-all duration-300',
                                'before:absolute before:inset-0 before:-z-10 before:animate-pulse before:bg-gradient-to-r before:from-blue-500/[0.15] before:via-transparent before:to-blue-500/[0.15] before:transition-opacity hover:before:from-blue-500/[0.25] hover:before:to-blue-500/[0.25]',
                            ]
                        )}>
                        <div className='absolute inset-y-0 left-0 w-[2px] bg-emerald-400/20'></div>
                        <div className='relative z-10 flex items-center gap-3'>
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-sm'>
                                <div className='h-1.5 w-1.5 rounded-full bg-emerald-400/50'></div>
                            </div>
                            <div className='flex flex-col gap-0.5'>
                                <span className='font-outfit truncate text-[13px] font-bold tracking-wider text-white'>{item}</span>
                                <span className='font-kodemono text-[11px] font-medium tracking-wider text-[#666] transition-all group-hover/item:text-[#818181]'>
                                    {priceData[item]?.price ? formatPrice(priceData[item].price) : <LoadingSpinner key={`${item}-loading`} itemId={item} color='#3b82f6' />}
                                </span>
                            </div>
                        </div>
                        <div className='relative z-10 flex items-center'>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePair(item);
                                }}
                                className='flex h-5 w-5 items-center justify-center rounded-full border border-[#333] bg-gradient-to-b from-[#181818] to-[#0F0F0F] opacity-0 transition-all group-hover/item:opacity-100 hover:border-red-500/30 hover:from-red-500/10 hover:to-red-600/10'>
                                <FaTimes size={8} className='text-[#666] transition-all hover:text-red-400' />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
