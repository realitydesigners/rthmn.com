'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LuSettings } from 'react-icons/lu';
import { cn } from '@/utils/cn';
import { SidebarContent } from '../SidebarContent';
import { SettingsBar } from '../SettingsBar';
import { getSidebarState, setSidebarState } from '@/utils/localStorage';

export const RightSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [activePanel, setActivePanel] = useState<string | undefined>();
    const [mounted, setMounted] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        // Load initial state only if it was locked
        const state = getSidebarState();
        if (state.right.isOpen && state.right.locked) {
            setIsOpen(true);
            setIsLocked(true);
            setActivePanel(state.right.activePanel);
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
            // Only save state if locked
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

        // If unlocking, close the panel
        if (!newLockedState) {
            setIsOpen(false);
            setActivePanel(undefined);
        }
    };

    if (!mounted) return null;

    return (
        <div className='sidebar-content' ref={sidebarRef}>
            {/* Fixed Sidebar */}
            <div className='fixed-sidebar top-14 right-0 bottom-0 z-[120] w-16 flex-col items-center justify-center py-4 pb-14 lg:fixed lg:flex'>
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

            {/* Settings Panel */}
            <SidebarContent
                isOpen={isOpen && activePanel === 'settings'}
                onClose={handleClose}
                title='Settings'
                isLocked={isLocked}
                onLockToggle={handleLockToggle}
                position='right'>
                <SettingsBar />
            </SidebarContent>
        </div>
    );
};
