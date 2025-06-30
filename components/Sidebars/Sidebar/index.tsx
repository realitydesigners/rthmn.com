"use client";

import { FeatureTour } from "@/components/Buttons/FeatureTour";
import { SidebarWrapper } from "@/components/Panels/SidebarPanelWrapper";
import { ONBOARDING_STEPS, useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import { getSidebarState, setSidebarState } from "@/utils/localStorage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";

interface SidebarButton {
	id: string;
	icon: IconType;
	tourContent: React.ReactNode;
	panelContent: React.ReactNode;
}

interface SidebarLinkButton {
	id: string;
	icon: IconType;
	href: string;
	title: string;
}

interface SidebarProps {
	position: "left" | "right";
	buttons: SidebarButton[];
	linkButtons?: SidebarLinkButton[];
	defaultPanel?: string;
}

export const Sidebar = ({
	position,
	buttons,
	linkButtons = [],
	defaultPanel,
}: SidebarProps) => {
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

	// Auto-open panel when current tour step matches this sidebar
	useEffect(() => {
		if (
			currentStepId &&
			isSidebarStep(currentStepId) &&
			!isStepCompleted(currentStepId)
		) {
			setIsOpen(true);
			setActivePanel(currentStepId);
			updateSidebarState(true, currentStepId, isLocked);
		}
	}, [
		currentStepId,
		isSidebarStep,
		isStepCompleted,
		isLocked,
		updateSidebarState,
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
			{/* IMPORTANT Dark overlay during onboarding tours */}
			{currentStepId &&
				isSidebarStep(currentStepId) &&
				!isStepCompleted(currentStepId) && (
					<div className="fixed inset-0 bg-black/60 z-[1] pointer-events-none" />
				)}
			<div
				className={cn(
					"fixed top-14 bottom-0 z-[150] flex w-16 flex-col items-center justify-between py-4 transition-all duration-200",
					position === "left" ? "left-0" : "right-0",
				)}
				style={{
					// Move the icon bar to the right when left panel is active with spring-like easing
					transform:
						position === "left" && isOpen && activePanel
							? `translateX(${280}px)` // Default panel width
							: position === "right" && isOpen && activePanel
								? `translateX(-${280}px)` // Move left when right panel is active
								: "translateX(0)",
					transition: "transform 0.4s cubic-bezier(0.23, 1, 0.280, 1)", // Spring-like easing
					// Add subtle backdrop filter when panel is active for depth

					// Subtle overall glow effect when no panels are active
					filter:
						!isOpen || !activePanel
							? "drop-shadow(0 0 10px rgba(255, 255, 255, 0.02))"
							: "none",
				}}
			>
				{/* Top buttons */}
				<div className="relative flex flex-col gap-2">
					{buttons
						.filter((button) => !["settings", "account"].includes(button.id))
						.map((button, index) => (
							<div
								key={button.id}
								className="relative"
								style={{
									// Removed floating animation to prevent icons moving up and down
									animationName: "none",
								}}
							>
								<FeatureTour
									icon={button.icon}
									onClick={() => handlePanelToggle(button.id)}
									isActive={activePanel === button.id}
									isOpen={isOpen}
									tourId={button.id}
									position={position}
									isLocked={isLocked && activePanel === button.id}
									onLockToggle={
										activePanel === button.id ? handleLockToggle : undefined
									}
								>
									{button.tourContent}
								</FeatureTour>
							</div>
						))}
				</div>

				{/* Bottom buttons */}
				<div className="mb-2 flex flex-col gap-4">
					{/* Link buttons (like Help) */}
					{linkButtons.map((linkButton) => (
						<Link
							key={linkButton.id}
							href={linkButton.href}
							className="group relative z-[120] flex h-10 w-10 items-center justify-center transition-all duration-200 overflow-hidden"
							style={{
								borderRadius: "4px",
							}}
							title={linkButton.title}
						>
							{/* Hover background */}
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-280"
								style={{
									borderRadius: "4px",
									background:
										"linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
								}}
							/>

							<linkButton.icon
								size={20}
								className="relative z-10 text-[#818181] transition-colors group-hover:text-white"
							/>
						</Link>
					))}

					{/* Regular panel buttons */}
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
								isLocked={isLocked && activePanel === button.id}
								onLockToggle={handleLockToggle}
								title={button.id.charAt(0).toUpperCase() + button.id.slice(1)}
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
