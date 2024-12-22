'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LuLayoutGrid, LuLayoutDashboard, LuOrbit, LuLineChart } from 'react-icons/lu';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { SidebarContent } from '../SidebarContent';
import { SelectedPairs } from './SelectedPairs';
import { AvailablePairs } from './AvailablePairs';
import { getSidebarState, setSidebarState } from '@/utils/localStorage';

export const LeftSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [activePanel, setActivePanel] = useState<string | undefined>();
    const [mounted, setMounted] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        // Load initial state only if it was locked
        const state = getSidebarState();
        if (state.left.isOpen && state.left.locked) {
            setIsOpen(true);
            setIsLocked(true);
            setActivePanel(state.left.activePanel);
        }
    }, []);

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

    const handlePanelToggle = (panel: string) => {
        if (activePanel === panel) {
            setIsOpen(false);
            setActivePanel(undefined);
            // Only save state if locked
            if (isLocked) {
                const state = getSidebarState();
                setSidebarState({
                    ...state,
                    left: {
                        isOpen: false,
                        activePanel: undefined,
                        locked: isLocked,
                    },
                });
            }
        } else {
            setIsOpen(true);
            setActivePanel(panel);
            // Only save state if locked
            if (isLocked) {
                const state = getSidebarState();
                setSidebarState({
                    ...state,
                    left: {
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
            left: {
                isOpen: isOpen,
                activePanel: activePanel,
                locked: newLockedState,
            },
        });

        // If unlocking, close the panel
        if (!newLockedState) {
            setIsOpen(false);
            setActivePanel(undefined);
        }
    };

    const renderPanelContent = () => {
        switch (activePanel) {
            case 'menu':
            case 'chart':
            case 'instruments':
                return (
                    <div className='space-y-4'>
                        <SelectedPairs />
                        <AvailablePairs />
                    </div>
                );
            default:
                return null;
        }
    };

    if (!mounted) return null;

    return (
        <div className='sidebar-content' ref={sidebarRef}>
            {/* Fixed Sidebar */}
            <div className='fixed-sidebar top-14 bottom-0 left-0 z-[120] w-16 flex-col items-center justify-center py-4 pb-14 lg:fixed lg:flex'>
                {/* Navigation Buttons */}
                <div className='flex flex-col gap-2'>
                    <Link href='/dashboard'>
                        <button className='group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all duration-200 hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:shadow-lg hover:shadow-black/20'>
                            <LuLayoutDashboard size={20} className='text-[#818181] transition-colors group-hover:text-white' />
                        </button>
                    </Link>
                    <Link href='/test'>
                        <button className='group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] transition-all duration-200 hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:shadow-lg hover:shadow-black/20'>
                            <LuOrbit size={20} className='text-[#818181] transition-colors group-hover:text-white' />
                        </button>
                    </Link>
                    <button
                        onClick={() => handlePanelToggle('instruments')}
                        className={cn(
                            'group relative z-[120] flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-b transition-all duration-200',
                            activePanel === 'chart'
                                ? 'border-[#333] from-[#181818] to-[#0F0F0F] text-white hover:scale-105 hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414] hover:shadow-lg hover:shadow-black/20'
                                : 'border-[#222] from-[#141414] to-[#0A0A0A] text-[#818181] hover:scale-105 hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20'
                        )}>
                        <LuLineChart size={20} className='transition-colors' />
                    </button>
                </div>
            </div>

            {/* Pairs Panel */}
            <SidebarContent
                isOpen={isOpen && (activePanel === 'instruments' || activePanel === 'chart')}
                onClose={handleClose}
                title='Instruments'
                isLocked={isLocked}
                onLockToggle={handleLockToggle}
                position='left'>
                {renderPanelContent()}
            </SidebarContent>
        </div>
    );
};
