'use client';
import React, { useState } from 'react';
import { LuCheckCircle2, LuCircle, LuChevronRight } from 'react-icons/lu';
import { cn } from '@/utils/cn';

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    isCompleted?: boolean;
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 'navigation',
        title: 'Navigation',
        description: 'Use the left sidebar to navigate between Dashboard and Test pages. The menu button at the bottom reveals additional options.',
    },
    {
        id: 'settings',
        title: 'Settings',
        description: 'Customize your experience using the settings panel. Adjust colors, box styles, and choose from various presets.',
    },
    {
        id: 'search',
        title: 'Search',
        description: 'Use the search bar in the top navigation to quickly find and add currency pairs to your dashboard.',
    },
    {
        id: 'layout',
        title: 'Layout',
        description: 'The interface adapts to your needs. Sidebars can be resized by dragging their borders, and panels can be toggled with their respective icons.',
    },
    {
        id: 'profile',
        title: 'Profile',
        description: 'Access your account settings and sign out options through the profile button in the top-right corner.',
    },
];

export const Tutorial = () => {
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    const toggleStep = (stepId: string) => {
        setCompletedSteps((prev) => (prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]));
    };

    return (
        <div className='flex h-full flex-col'>
            <div className='flex h-12 items-center justify-between border-b border-[#222] px-3'>
                <div className='flex items-center gap-2'>
                    <h2 className='text-sm font-medium'>Tutorial</h2>
                    <div className='h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' />
                </div>
                <div className='text-[11px] font-medium text-gray-400'>
                    {completedSteps.length}/{tutorialSteps.length} completed
                </div>
            </div>

            <div className='scrollbar-none flex-1 touch-pan-y overflow-y-scroll scroll-smooth p-3'>
                <div className='space-y-2'>
                    {tutorialSteps.map((step) => (
                        <div
                            key={step.id}
                            className={cn(
                                'group rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all',
                                expandedStep === step.id && 'border-[#333] from-[#181818] to-[#0F0F0F]'
                            )}>
                            <div className='flex cursor-pointer items-center gap-3 p-3' onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleStep(step.id);
                                    }}
                                    className='flex h-5 w-5 shrink-0 items-center justify-center'>
                                    {completedSteps.includes(step.id) ? <LuCheckCircle2 className='h-5 w-5 text-blue-400' /> : <LuCircle className='h-5 w-5 text-[#444]' />}
                                </button>
                                <div className='flex flex-1 items-center justify-between'>
                                    <span className={cn('font-mono text-xs font-medium tracking-wide', completedSteps.includes(step.id) ? 'text-gray-300' : 'text-gray-400')}>
                                        {step.title}
                                    </span>
                                    <LuChevronRight className={cn('h-4 w-4 text-gray-600 transition-transform', expandedStep === step.id && 'rotate-90')} />
                                </div>
                            </div>
                            {expandedStep === step.id && (
                                <div className='border-t border-[#222] px-4 py-3'>
                                    <p className='text-xs leading-relaxed text-gray-400'>{step.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
