'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LuLayoutGrid, LuLayoutDashboard, LuOrbit, LuLineChart, LuTestTube } from 'react-icons/lu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { SidebarWrapper } from '../SidebarWrapper';
import { SelectedPairs } from './SelectedPairs';
import { AvailablePairs } from './AvailablePairs';
import { getSidebarState, setSidebarState } from '@/utils/localStorage';
import { FeatureTour } from '@/components/FeatureTour';
import { SidebarButton } from './SidebarButton';
import { useTourStore } from '@/utils/tourStore';

export const SidebarLeft = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [activePanel, setActivePanel] = useState<string | undefined>();
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { setCurrentTour, currentTourId, completedTours } = useTourStore();

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
        if (state.left.locked && !isMobile) {
            setIsOpen(true);
            setIsLocked(true);
            setActivePanel(state.left.activePanel || 'instruments'); // Set a default panel if none is stored
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

    // Initialize the first tour if no tour is active and none are completed
    useEffect(() => {
        if (!currentTourId && completedTours.length === 0) {
            setCurrentTour('instruments');
        }
    }, [currentTourId, completedTours.length, setCurrentTour]);

    // Don't render on mobile or account page
    if (!mounted || isMobile || pathname === '/account') {
        return null;
    }

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

    const buttons = [
        {
            id: 'instruments',
            icon: LuLineChart,
            onClick: () => handlePanelToggle('instruments'),
            tourContent: {
                title: 'Welcome to Your Dashboard',
                description: 'This is where you can manage your currency pairs and view their performance.',
                items: ['View your selected pairs', 'Add new currency pairs', "Remove pairs you don't want"],
            },
        },
        {
            id: 'test',
            icon: LuTestTube,
            onClick: () => handlePanelToggle('test'),
            tourContent: {
                title: 'Test Your Strategies',
                description: 'Use our testing environment to practice and refine your trading strategies.',
                items: ['Practice trading strategies', 'Test with historical data', 'Analyze performance metrics'],
            },
        },
    ];

    return (
        <div className='sidebar-content' ref={sidebarRef}>
            {/* Fixed Sidebar */}
            <div className='fixed top-14 bottom-0 left-0 z-[120] flex w-16 flex-col items-center justify-start border-r border-[#121212] bg-[#0a0a0a] py-4'>
                {/* Navigation Buttons */}
                <div className='flex flex-col gap-2'>
                    {buttons.map((button) => (
                        <SidebarButton
                            key={button.id}
                            icon={button.icon}
                            onClick={button.onClick}
                            isActive={activePanel === button.id}
                            tourId={button.id}
                            tourContent={button.tourContent}
                        />
                    ))}
                </div>
            </div>

            {/* Pairs Panel */}
            <SidebarWrapper
                isOpen={isOpen && (activePanel === 'instruments' || activePanel === 'test')}
                onClose={handleClose}
                title={activePanel === 'test' ? 'Test Environment' : 'Instruments'}
                isLocked={isLocked}
                onLockToggle={handleLockToggle}
                position='left'>
                {renderPanelContent()}
            </SidebarWrapper>
        </div>
    );
};
