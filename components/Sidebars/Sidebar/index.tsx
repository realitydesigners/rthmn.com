"use client";

import { FeatureTour } from "@/components/Buttons/FeatureTour";
import { SidebarWrapper } from "@/components/Panels/SidebarPanelWrapper";
import { ONBOARDING_STEPS, useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import { getSidebarState, setSidebarState } from "@/utils/localStorage";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import type { IconType } from "react-icons";

interface SidebarButton {
	id: string;
	icon: IconType;
	tourContent: React.ReactNode;
	panelContent: React.ReactNode;
}

interface SidebarProps {
	position: "left" | "right";
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
	const {
		currentStepId,
		setCurrentStep,
		hasCompletedInitialOnboarding,
		hasCompletedAllSteps,
		isStepCompleted,
	} = useOnboardingStore();

	const isSidebarStep = useCallback(
		(stepId: string) => buttons.some((button) => button.id === stepId),
		[buttons],
	);

	const updateSidebarState = useCallback(
		(isOpen: boolean, panel: string | undefined, locked: boolean) => {
			const state = getSidebarState();
			setSidebarState({
				...state,
				[position]: {
					isOpen,
					activePanel: panel,
					locked,
				},
			});
		},
		[position],
	);

	const handleLockToggle = useCallback(() => {
		setIsLocked((prevLocked) => {
			const newLockedState = !prevLocked;
			
			// When unlocking, keep the panel open but update state
			updateSidebarState(isOpen, activePanel, newLockedState);
			
			return newLockedState;
		});
	}, [isOpen, activePanel, updateSidebarState]);

	const handlePanelToggle = useCallback(
		(panel: string) => {
			if (isMobile) return;

			const newIsOpen = activePanel !== panel || !isOpen;
			const newActivePanel = newIsOpen ? panel : undefined;

			setIsOpen(newIsOpen);
			setActivePanel(newActivePanel);
			updateSidebarState(newIsOpen, newActivePanel, isLocked);
		},
		[isMobile, activePanel, isOpen, isLocked, updateSidebarState],
	);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 1024);
		const handleClickOutside = (event: MouseEvent) => {
			if (
				!isLocked &&
				sidebarRef.current &&
				!sidebarRef.current.contains(event.target as Node)
			) {
				const isClickInAnySidebar = (event.target as Element).closest(
					".sidebar-content, .fixed-sidebar",
				);
				if (!isClickInAnySidebar) {
					setIsOpen(false);
					setActivePanel(undefined);
					updateSidebarState(false, undefined, false);
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

		window.addEventListener("resize", handleResize);
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("resize", handleResize);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isLocked, isMobile, position, defaultPanel, updateSidebarState]);

	useEffect(() => {
		if (hasCompletedInitialOnboarding() && !hasCompletedAllSteps()) {
			const nextIncompleteStep = ONBOARDING_STEPS.filter(
				(step) => step.type === "feature-tour",
			)
				.sort((a, b) => a.order - b.order)
				.find((step) => !isStepCompleted(step.id));

			if (
				nextIncompleteStep &&
				(!currentStepId || isStepCompleted(currentStepId)) &&
				isSidebarStep(nextIncompleteStep.id)
			) {
				setCurrentStep(nextIncompleteStep.id);
				setIsOpen(true);
				setActivePanel(nextIncompleteStep.id);
			}
		}
	}, [
		hasCompletedInitialOnboarding,
		hasCompletedAllSteps,
		currentStepId,
		setCurrentStep,
		isStepCompleted,
		isSidebarStep,
	]);

	if (
		!mounted ||
		isMobile ||
		pathname === "/account" ||
		pathname === "/pricing"
	)
		return null;

	const renderPanelContent = () => {
		const activeButton = buttons.find((button) => button.id === activePanel);
		return activeButton?.panelContent || null;
	};

	return (
		<div className="sidebar-content" ref={sidebarRef}>
			<div
				className={cn(
					"fixed top-14 bottom-0 z-[100] flex w-16 flex-col items-center justify-between border-l bg-gradient-to-b from-[#0A0B0D] to-[#070809] py-4",
					position === "left"
						? "left-0 border-r border-[#1C1E23]"
						: "right-0 border-l border-[#1C1E23]",
				)}
			>
				{/* Top buttons */}
				<div className="relative flex flex-col gap-2">
					{buttons
						.filter((button) => !["settings", "account"].includes(button.id))
						.map((button) => (
							<FeatureTour
								key={button.id}
								icon={button.icon}
								onClick={() => handlePanelToggle(button.id)}
								isActive={activePanel === button.id}
								isOpen={isOpen}
								tourId={button.id}
								position={position}
							>
								{button.tourContent}
							</FeatureTour>
						))}
				</div>

				{/* Bottom buttons */}
				<div className="mb-2 flex flex-col gap-2">
					{buttons
						.filter((button) => ["settings", "account"].includes(button.id))
						.map((button) => (
							<FeatureTour
								key={button.id}
								icon={button.icon}
								onClick={() => handlePanelToggle(button.id)}
								isActive={activePanel === button.id}
								isOpen={isOpen}
								tourId={button.id}
								position={position}
							>
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
				isCompleted={isStepCompleted(activePanel)}
			>
				{renderPanelContent()}
			</SidebarWrapper>
		</div>
	);
};
