import type React from 'react';
import { cn } from '@/utils/cn';

interface ToggleProps {
    isEnabled: boolean;
    onToggle: () => void;
    size?: 'sm' | 'md';
    title?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ isEnabled, onToggle, size = 'sm', title }) => {
    const sizeClasses = {
        sm: {
            container: 'h-5 w-10',
            thumb: 'h-4 w-4',
        },
    };

    return (
        <div className='group flex w-full items-center justify-between'>
            {title && (
                <span className='font-outfit text-[13px] font-medium tracking-wide text-[#666] transition-colors duration-300 group-hover:text-[#888]'>
                    {title}
                </span>
            )}
            <button
                type='button'
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onToggle();
                    }
                }}
                role='switch'
                aria-checked={isEnabled}
                tabIndex={0}
                className={cn(
                    'relative',
                    sizeClasses[size].container,
                    'cursor-pointer rounded-full border transition-all duration-300',
                    'bg-gradient-to-b from-[#0A0B0D] to-[#070809]',
                    isEnabled
                        ? [
                              'border-white/[0.05]',
                              'shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]',
                              'hover:border-white/[0.08] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]',
                          ]
                        : [
                              'border-white/[0.02]',
                              'hover:border-white/[0.05] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]',
                          ]
                )}
            >
                {/* Track background when enabled */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-full transition-opacity duration-300',
                        isEnabled ? 'bg-white/[0.05]' : 'bg-white/[0.02]'
                    )}
                />
                {/* Thumb (circle) */}
                <div
                    className={cn(
                        'absolute top-0.5 rounded-full transition-all duration-300',
                        sizeClasses[size].thumb,
                        'bg-[#666] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]',
                        isEnabled
                            ? ['translate-x-[1.375rem]', 'bg-white/80', 'hover:bg-white']
                            : ['translate-x-0.5', 'hover:bg-[#888]']
                    )}
                />
            </button>
        </div>
    );
};
