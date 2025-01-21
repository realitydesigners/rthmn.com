'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LuSettings, LuRotateCcw, LuChevronDown, LuChevronUp, LuBox, LuLayoutGrid, LuLineChart, LuGraduationCap } from 'react-icons/lu';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { SidebarWrapper } from '../SidebarWrapper';
import { SettingsBar } from '../SettingsBar';
import { getSidebarState, setSidebarState } from '@/utils/localStorage';
import { useOnboardingStore, ONBOARDING_STEPS } from '@/utils/tourStore';

export const SidebarRight = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [activePanel, setActivePanel] = useState<string | undefined>();
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { currentStepId, completedSteps } = useOnboardingStore();

    // Handle screen size changes
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };

        // Initial check
        checkMobile();

        // Add resize listener
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setMounted(true);
        // Load initial state only if it was locked and not mobile
        const state = getSidebarState();
        if (state.right.isOpen && state.right.locked && !isMobile) {
            setIsOpen(true);
            setIsLocked(true);
            setActivePanel(state.right.activePanel);
        }
    }, [isMobile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!isLocked && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                // Check if the click was inside any sidebar or sidebar toggle
                const isClickInAnySidebar = (event.target as Element).closest('.sidebar-content, .fixed-sidebar');
                if (!isClickInAnySidebar) {
                    setIsOpen(false);
                    setActivePanel(undefined);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocked]);

    if (!mounted) return null;
    if (isMobile) return null; // Don't render anything on mobile
    if (pathname === '/account') return null; // Don't show on account page

    // Prevent sidebar from opening on mobile
    const handlePanelToggle = (panel: string) => {
        if (isMobile) return;

        if (activePanel === panel) {
            setIsOpen(false);
            setActivePanel(undefined);
            if (isLocked) {
                const state = getSidebarState();
                setSidebarState({
                    ...state,
                    right: {
                        isOpen: false,
                        activePanel: undefined,
                        locked: isLocked,
                    },
                });
            }
        } else {
            setIsOpen(true);
            setActivePanel(panel);
            if (isLocked) {
                const state = getSidebarState();
                setSidebarState({
                    ...state,
                    right: {
                        isOpen: true,
                        activePanel: panel,
                        locked: isLocked,
                    },
                });
            }
        }
    };

    const handleClose = () => {
        if (!isLocked) {
            setIsOpen(false);
            setActivePanel(undefined);
        }
    };

    const handleLockToggle = () => {
        const newLockedState = !isLocked;
        setIsLocked(newLockedState);

        // Save state only when locking/unlocking
        const state = getSidebarState();
        setSidebarState({
            ...state,
            right: {
                isOpen: isOpen,
                activePanel: activePanel,
                locked: newLockedState,
            },
        });
    };

    const handleClearOnboarding = () => {
        localStorage.removeItem('avatar_url');
        useOnboardingStore.getState().reset();
    };

    const renderPanelContent = () => {
        switch (activePanel) {
            case 'settings':
                return <SettingsBar />;
            case 'onboarding':
                return (
                    <div className='space-y-6 p-4'>
                        <div className='mb-6 flex items-center justify-between'>
                            <h2 className='bg-gradient-to-r from-white to-white/60 bg-clip-text text-xl font-bold text-transparent'>Onboarding Progress</h2>
                            <button
                                onClick={handleClearOnboarding}
                                className='group relative rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/20'>
                                <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.07] to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                                Clear Progress
                            </button>
                        </div>
                        <div className='space-y-3'>
                            {ONBOARDING_STEPS.map((step) => {
                                const isCompleted = completedSteps.includes(step.id);
                                const isCurrent = currentStepId === step.id;

                                return (
                                    <div
                                        key={step.id}
                                        className={`relative w-full overflow-hidden rounded-xl border bg-gradient-to-b p-0.5 transition-all duration-300 hover:scale-[1.02] ${
                                            isCompleted
                                                ? 'border-emerald-500/50 from-emerald-500/20 to-emerald-500/0'
                                                : isCurrent
                                                  ? 'border-blue-500/50 from-blue-500/20 to-blue-500/0'
                                                  : 'border-[#333] from-[#1A1A1A] to-[#0D0D0D] hover:border-blue-500/30 hover:from-[#1A1A1A] hover:to-[#111]'
                                        }`}>
                                        {/* Highlight Effect */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-300 ${
                                                isCompleted
                                                    ? 'from-emerald-500/10 to-transparent opacity-100'
                                                    : isCurrent
                                                      ? 'from-blue-500/10 to-transparent opacity-100'
                                                      : 'from-white/5 to-transparent opacity-0 group-hover:opacity-100'
                                            }`}
                                        />

                                        {/* Content */}
                                        <div className='relative flex items-center justify-between rounded-xl bg-black/40 p-4'>
                                            <div className='space-y-1'>
                                                <h3 className='text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-white'>{step.title}</h3>
                                                <p className='text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>{step.description}</p>
                                            </div>
                                            <div className='ml-4 shrink-0'>
                                                {isCompleted ? (
                                                    <span className='flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400'>
                                                        Completed
                                                    </span>
                                                ) : isCurrent ? (
                                                    <span className='flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400'>
                                                        In Progress
                                                    </span>
                                                ) : (
                                                    <span className='flex items-center gap-1.5 rounded-full border border-[#333] bg-[#111] px-3 py-1 text-xs font-medium text-gray-500'>
                                                        Not Started
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className='sidebar-content' ref={sidebarRef}>
            {/* Fixed Sidebar */}
            <div className='border-r=l fixed top-14 right-0 bottom-0 z-[120] flex w-16 flex-col items-center justify-end border-l border-[#121212] bg-[#0a0a0a] py-4'>
                {/* Onboarding Progress button */}
                <button
                    onClick={() => handlePanelToggle('onboarding')}
                    className={cn(
                        'group relative z-[120] mb-2 flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all duration-200',
                        activePanel === 'onboarding'
                            ? 'border-[#333] from-[#181818] to-[#0F0F0F] text-white hover:scale-105 hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414] hover:shadow-lg hover:shadow-black/20'
                            : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20'
                    )}>
                    <LuGraduationCap size={20} className='transition-colors' />
                </button>

                {/* Settings button */}
                <button
                    onClick={() => handlePanelToggle('settings')}
                    className={cn(
                        'group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all duration-200',
                        activePanel === 'settings'
                            ? 'border-[#333] from-[#181818] to-[#0F0F0F] text-white hover:scale-105 hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414] hover:shadow-lg hover:shadow-black/20'
                            : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20'
                    )}>
                    <LuSettings size={20} className='transition-colors' />
                </button>
            </div>

            {/* Panels */}
            <SidebarWrapper
                isOpen={isOpen}
                onClose={handleClose}
                title={activePanel === 'settings' ? 'Settings' : 'Onboarding Progress'}
                isLocked={isLocked}
                onLockToggle={handleLockToggle}
                position='right'
                initialWidth={activePanel === 'onboarding' ? 500 : 300}>
                {renderPanelContent()}
            </SidebarWrapper>
        </div>
    );
};
