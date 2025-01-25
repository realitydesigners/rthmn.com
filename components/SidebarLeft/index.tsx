'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LuOrbit, LuLineChart, LuTestTube } from 'react-icons/lu';
import { usePathname } from 'next/navigation';
import { SidebarWrapper } from '../SidebarWrapper';
import { SelectedPairs } from './SelectedPairs';
import { AvailablePairs } from './AvailablePairs';
import { getSidebarState, setSidebarState } from '@/utils/localStorage';
import { FeatureTour } from '../../app/(user)/onboarding/_components/FeatureTour';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
import { InstrumentsContent } from '../../app/(user)/onboarding/_components/FeatureTour/InstrumentsContent';
import { TestContent } from '../../app/(user)/onboarding/_components/FeatureTour/TestContent';

export const SidebarLeft = () => {
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [activePanel, setActivePanel] = useState<string | undefined>();
    const { currentStepId, setCurrentStep, hasCompletedInitialOnboarding, isStepCompleted } = useOnboardingStore();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        const handleClickOutside = (event: MouseEvent) => {
            if (!isLocked && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                const isClickInAnySidebar = (event.target as Element).closest('.sidebar-content, .fixed-sidebar');
                if (!isClickInAnySidebar) {
                    setIsOpen(false);
                    setActivePanel(undefined);
                }
            }
        };

        setMounted(true);
        handleResize();

        const state = getSidebarState();
        if (state.left.locked && !isMobile) {
            setIsOpen(true);
            setIsLocked(true);
            setActivePanel(state.left.activePanel || 'instruments');
        }

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocked, isMobile]);

    useEffect(() => {
        if (hasCompletedInitialOnboarding() && !currentStepId) {
            setCurrentStep('instruments');
        }
    }, [hasCompletedInitialOnboarding, currentStepId, setCurrentStep]);

    if (!mounted || isMobile || pathname === '/account') return null;

    const handlePanelToggle = (panel: string) => {
        if (isMobile) return;

        if (activePanel === panel) {
            setIsOpen(false);
            setActivePanel(undefined);
            if (isLocked) {
                updateSidebarState(false, undefined, isLocked);
            }
        } else {
            setIsOpen(true);
            setActivePanel(panel);
            if (isLocked) {
                updateSidebarState(true, panel, isLocked);
            }
        }
    };

    const handleClose = () => {
        if (!isLocked) {
            setIsOpen(false);
            setActivePanel(undefined);
        }
    };

    const updateSidebarState = (isOpen: boolean, panel: string | undefined, locked: boolean) => {
        const state = getSidebarState();
        setSidebarState({
            ...state,
            left: {
                isOpen,
                activePanel: panel,
                locked,
            },
        });
    };

    const handleLockToggle = () => {
        const newLockedState = !isLocked;
        setIsLocked(newLockedState);
        updateSidebarState(isOpen, activePanel, newLockedState);
    };

    const buttons = [
        {
            id: 'instruments',
            icon: LuLineChart,
            onClick: () => handlePanelToggle('instruments'),
            tourContent: <InstrumentsContent />,
            panelContent: (
                <>
                    <SelectedPairs />
                    <AvailablePairs />
                </>
            ),
        },
        {
            id: 'universe',
            icon: LuOrbit,
            onClick: () => handlePanelToggle('universe'),
            tourContent: <InstrumentsContent />,
            panelContent: null,
        },
        {
            id: 'test',
            icon: LuTestTube,
            onClick: () => handlePanelToggle('test'),
            tourContent: <TestContent />,
            panelContent: null,
        },
    ];

    const renderButtons = () =>
        buttons.map((button) => (
            <FeatureTour key={button.id} icon={button.icon} onClick={button.onClick} isActive={activePanel === button.id} isOpen={isOpen} tourId={button.id} position='left'>
                {button.tourContent}
            </FeatureTour>
        ));

    const renderPanelContent = () => {
        const activeButton = buttons.find((button) => button.id === activePanel);
        return activeButton?.panelContent || null;
    };

    return (
        <div className='sidebar-content' ref={sidebarRef}>
            <div className='fixed top-14 bottom-0 left-0 z-[120] flex w-16 flex-col items-center justify-start border-r border-[#121212] bg-[#0a0a0a] py-4'>
                <div className='flex flex-col gap-2'>{renderButtons()}</div>
            </div>
            <SidebarWrapper
                isOpen={isOpen && !!activePanel}
                onClose={handleClose}
                title={activePanel}
                isLocked={isLocked}
                onLockToggle={handleLockToggle}
                position='left'
                isCurrentTourStep={currentStepId === activePanel}
                isCompleted={isStepCompleted(activePanel)}>
                {renderPanelContent()}
            </SidebarWrapper>
        </div>
    );
};
