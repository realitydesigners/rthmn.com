'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LuLayoutGrid, LuLineChart } from 'react-icons/lu';
import { InstrumentsContent } from '@/app/(user)/onboarding/_components/FeatureTour/InstrumentsContent';
import { VisualizerContent } from '@/app/(user)/onboarding/_components/FeatureTour/VisualizerContent';
import { ONBOARDING_STEPS, useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
import { VisualizersView } from '@/app/(user)/_components/VisualizersView';
import { getSidebarState, setSidebarState } from '@/utils/localStorage';
import { FeatureTour } from '../../onboarding/_components/FeatureTour';
import { SidebarWrapper } from '../SidebarWrapper';
import { InstrumentsView } from './InstrumentsView';

export const SidebarLeft = () => {
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [activePanel, setActivePanel] = useState<string | undefined>();
    const { currentStepId, setCurrentStep, hasCompletedInitialOnboarding, hasCompletedAllSteps, isStepCompleted } = useOnboardingStore();

    const buttons = [
        {
            id: 'instruments',
            icon: LuLineChart,
            onClick: () => handlePanelToggle('instruments'),
            tourContent: <InstrumentsContent />,
            panelContent: <InstrumentsView />,
        },
        {
            id: 'visualizer',
            icon: LuLayoutGrid,
            onClick: () => handlePanelToggle('visualizer'),
            tourContent: <VisualizerContent />,
            panelContent: <VisualizersView />,
        },
    ];

    const isLeftSidebarStep = (stepId: string) => buttons.some((button) => button.id === stepId);

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
        // Add debug logging regardless of conditions
        // console.log('Onboarding State:', {
        //     completedSteps: useOnboardingStore.getState().completedSteps,
        //     currentStepId: useOnboardingStore.getState().currentStepId,
        //     hasCompletedInitialOnboarding: hasCompletedInitialOnboarding(),
        //     hasCompletedAllSteps: hasCompletedAllSteps(),
        //     allSteps: ONBOARDING_STEPS,
        //     nextFeatureTourSteps: ONBOARDING_STEPS.filter((step) => step.type === 'feature-tour'),
        // });

        // Check for incomplete feature tour steps if page steps are completed
        if (hasCompletedInitialOnboarding() && !hasCompletedAllSteps()) {
            const nextIncompleteStep = ONBOARDING_STEPS.filter((step) => step.type === 'feature-tour')
                .sort((a, b) => a.order - b.order)
                .find((step) => !isStepCompleted(step.id));

            // Only open the next step if there's no current step or the current step is completed
            // AND the next step belongs to the left sidebar
            if (nextIncompleteStep && (!currentStepId || isStepCompleted(currentStepId)) && isLeftSidebarStep(nextIncompleteStep.id)) {
                console.log('Setting next incomplete step:', nextIncompleteStep);
                setCurrentStep(nextIncompleteStep.id);
                setIsOpen(true);
                setActivePanel(nextIncompleteStep.id);
            }
        }
    }, [hasCompletedInitialOnboarding, hasCompletedAllSteps, currentStepId, setCurrentStep, isStepCompleted]);

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
