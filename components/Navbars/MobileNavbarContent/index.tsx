"use client";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";

interface NavButton {
	id: string;
	icon: IconType;
	tourContent: React.ReactNode;
	panelContent: React.ReactNode;
}

interface MobileNavbarContentProps {
	buttons: NavButton[];
}

interface MobilePanelWrapperProps {
	isOpen: boolean;
	title?: string;
	children: React.ReactNode;
	isCurrentTourStep?: boolean;
	isCompleted?: boolean;
}

const MobilePanelWrapper = ({
	isOpen,
	title,
	children,
}: MobilePanelWrapperProps) => {
	const isPairsPanel = title === "pairs";

	return (
		<motion.div
			initial={false}
			animate={{
				y: isOpen ? 0 : "100%",
			}}
			transition={{
				duration: 0.3,
				ease: "easeInOut",
			}}
			className={cn(
				"fixed inset-x-0 bottom-0 z-[2040] transform border-t border-[#1C1E23]",
				isOpen ? "pointer-events-auto" : "pointer-events-none",
				isPairsPanel
					? "bg-transparent"
					: "rounded-t-[36px] bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
			)}
			style={{
				height: isPairsPanel ? "calc(100vh - 80px)" : "calc(50vh)",
				boxShadow:
					isOpen && !isPairsPanel ? "0 -4px 16px rgba(0,0,0,0.2)" : "none",
			}}
		>
			<div
				className={cn(
					"h-full p-2 overflow-y-auto overflow-x-hidden overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ",
					!isPairsPanel && "custom-scrollbar pb-36  pb-safe",
				)}
			>
				{children}
			</div>

			{/* Bottom gradient fade */}
			{!isPairsPanel && (
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#070809] to-transparent" />
			)}
		</motion.div>
	);
};

export const MobileNavbarContent = ({ buttons }: MobileNavbarContentProps) => {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [activePanel, setActivePanel] = useState<string | undefined>();
	const navRef = useRef<HTMLDivElement>(null);
	const { currentStepId, isStepCompleted } = useOnboardingStore();

	// Lock body scroll when panel is open
	useEffect(() => {
		if (isOpen) {
			// Get current page width
			const scrollbarWidth =
				window.innerWidth - document.documentElement.clientWidth;
			// Add padding to prevent layout shift
			document.body.style.paddingRight = `${scrollbarWidth}px`;
			document.body.style.overflow = "hidden";
			document.body.style.touchAction = "none";
		} else {
			document.body.style.paddingRight = "";
			document.body.style.overflow = "";
			document.body.style.touchAction = "";
		}
		return () => {
			document.body.style.paddingRight = "";
			document.body.style.overflow = "";
			document.body.style.touchAction = "";
		};
	}, [isOpen]);

	const handlePanelToggle = (panel: string) => {
		const newIsOpen = activePanel !== panel || !isOpen;
		const newActivePanel = newIsOpen ? panel : undefined;

		setIsOpen(newIsOpen);
		setActivePanel(newActivePanel);
	};

	const handleClose = () => {
		setIsOpen(false);
		setActivePanel(undefined);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node)) {
				handleClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (pathname === "/account" || pathname === "/pricing") return null;

	const renderPanelContent = () => {
		const activeButton = buttons.find((button) => button.id === activePanel);
		return activeButton?.panelContent || null;
	};

	return (
		<div className="lg:hidden" ref={navRef}>
			<div className="fixed bottom-4 left-1/2 z-[2060] flex -translate-x-1/2 transform">
				<div className="flex h-full gap-2 rounded-full border border-[#0A0B0D] bg-black/80 backdrop-blur-md px-2 py-2">
					{buttons.map((button) => {
						const Icon = button.icon;
						return (
							<button
								key={button.id}
								onClick={() => handlePanelToggle(button.id)}
								className="group relative flex items-center"
							>
								<div
									className={cn(
										"group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b p-[1px] transition-all duration-200",
										activePanel === button.id
											? "from-[#32353C] to-[#282828]"
											: "from-[#32353C] to-[#1C1E23] hover:from-[#32353C] hover:to-[#282828]",
									)}
								>
									<div
										className={cn(
											"flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#1C1E23]",
											activePanel === button.id
												? "text-white"
												: "text-[#818181]",
										)}
									>
										<Icon size={24} />
									</div>
								</div>
							</button>
						);
					})}
				</div>
			</div>
			<MobilePanelWrapper
				isOpen={isOpen && !!activePanel}
				title={activePanel}
				isCurrentTourStep={currentStepId === activePanel}
				isCompleted={isStepCompleted(activePanel)}
			>
				{renderPanelContent()}
			</MobilePanelWrapper>
		</div>
	);
};
