'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';
import { getSidebarState, setSidebarState } from '@/utils/localStorage';
import { FeatureTour } from '@/app/(user)/onboarding/_components/FeatureTour';
import { SidebarWrapper } from '@/app/(user)/_components/Panels/SidebarPanelWrapper';
import { useOnboardingStore, ONBOARDING_STEPS } from '@/stores/onboardingStore';
import { cn } from '@/utils/cn';

interface SidebarButton {
    id: string;
    icon: IconType;
    tourContent: React.ReactNode;
    panelContent: React.ReactNode;
}

interface SidebarProps {
    position: 'left' | 'right';
    buttons: SidebarButton[];
    defaultPanel?: string;
}

export const Sidebar = ({ position, buttons, defaultPanel }: SidebarProps) => {
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [activePanel, setActivePanel] = useState<string | undefined>();
    const { currentStepId, setCurrentStep, hasCompletedInitialOnboarding, hasCompletedAllSteps, isStepCompleted } = useOnboardingStore();

    const isSidebarStep = (stepId: string) => buttons.some((button) => button.id === stepId);

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
        if (state[position].locked && !isMobile) {
            setIsOpen(true);
            setIsLocked(true);
            setActivePanel(state[position].activePanel || defaultPanel);
        }

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocked, isMobile, position, defaultPanel]);

    useEffect(() => {
        if (hasCompletedInitialOnboarding() && !hasCompletedAllSteps()) {
            const nextIncompleteStep = ONBOARDING_STEPS.filter((step) => step.type === 'feature-tour')
                .sort((a, b) => a.order - b.order)
                .find((step) => !isStepCompleted(step.id));

            if (nextIncompleteStep && (!currentStepId || isStepCompleted(currentStepId)) && isSidebarStep(nextIncompleteStep.id)) {
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
            updateSidebarState(false, undefined, isLocked);
        } else {
            setIsOpen(true);
            setActivePanel(panel);
            updateSidebarState(true, panel, isLocked);
        }
    };

    const updateSidebarState = (isOpen: boolean, panel: string | undefined, locked: boolean) => {
        const state = getSidebarState();
        setSidebarState({
            ...state,
            [position]: {
                isOpen,
                activePanel: panel,
                locked,
            },
        });
    };

    const handleLockToggle = () => {
        const newLockedState = !isLocked;
        setIsLocked(newLockedState);

        // When unlocking, also close the panel
        if (!newLockedState) {
            setIsOpen(false);
            setActivePanel(undefined);
            updateSidebarState(false, undefined, false);
        } else {
            updateSidebarState(isOpen, activePanel, true);
        }
    };

    const renderPanelContent = () => {
        const activeButton = buttons.find((button) => button.id === activePanel);
        return activeButton?.panelContent || null;
    };

    return (
        <div className='sidebar-content' ref={sidebarRef}>
            <div
                className={cn(
                    'fixed top-14 bottom-0 z-[120] flex w-16 flex-col items-center justify-between border-l border-[#121212] bg-[#0a0a0a] py-4',
                    position === 'left' ? 'left-0 border-r' : 'right-0 border-l'
                )}>
                {/* Top buttons */}
                <div className='flex flex-col gap-2'>
                    {buttons
                        .filter((button) => !['settings', 'account'].includes(button.id))
                        .map((button) => (
                            <FeatureTour
                                key={button.id}
                                icon={button.icon}
                                onClick={() => handlePanelToggle(button.id)}
                                isActive={activePanel === button.id}
                                isOpen={isOpen}
                                tourId={button.id}
                                position={position}>
                                {button.tourContent}
                            </FeatureTour>
                        ))}
                </div>

                {/* Bottom buttons */}
                <div className='mb-2 flex flex-col gap-2'>
                    {buttons
                        .filter((button) => ['settings', 'account'].includes(button.id))
                        .map((button) => (
                            <FeatureTour
                                key={button.id}
                                icon={button.icon}
                                onClick={() => handlePanelToggle(button.id)}
                                isActive={activePanel === button.id}
                                isOpen={isOpen}
                                tourId={button.id}
                                position={position}>
                                {button.tourContent}
                            </FeatureTour>
                        ))}
                </div>
            </div>
            <SidebarWrapper
                isOpen={isOpen && !!activePanel}
                title={activePanel}
                isLocked={isLocked}
                onLockToggle={handleLockToggle}
                position={position}
                isCurrentTourStep={currentStepId === activePanel}
                isCompleted={isStepCompleted(activePanel)}>
                {renderPanelContent()}
            </SidebarWrapper>
        </div>
    );
};
