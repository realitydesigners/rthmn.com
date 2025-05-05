"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";

export function FeatureTour({
	icon: Icon,
	onClick,
	isActive,
	isOpen,
	tourId,
	className,
	children,
	position,
}: {
	icon: IconType;
	onClick: () => void;
	isActive: boolean;
	isOpen: boolean;
	tourId: string;
	className?: string;
	children: any;
	position?: "left" | "right";
}) {
	const { currentStepId, completeStep, goToNextStep, isStepCompleted } =
		useOnboardingStore();
	const [showTooltip, setShowTooltip] = useState(false);
	const [sidebarWidth, setSidebarWidth] = useState(0);
	const isCurrentTour = currentStepId === tourId;
	const isCompleted = isStepCompleted(tourId);
	const observerRef = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		if (!isCurrentTour || isCompleted) return;

		const timer = setTimeout(() => {
			setShowTooltip(true);
		}, 500);

		return () => clearTimeout(timer);
	}, [isCurrentTour, isCompleted]);

	// Track sidebar width changes
	useEffect(() => {
		if (!showTooltip) return;

		const updateTooltipPosition = () => {
			const sidebarElement = document.querySelector(
				`[data-position="${position}"]`,
			);
			if (sidebarElement) {
				const width = Number.parseInt(
					sidebarElement.getAttribute("data-width") || "0",
				);
				setSidebarWidth(width);
			}
		};

		updateTooltipPosition();

		// Create a mutation observer to watch for attribute changes
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "data-width"
				) {
					updateTooltipPosition();
				}
			});
		});

		const sidebarElement = document.querySelector(
			`[data-position="${position}"]`,
		);
		if (sidebarElement) {
			observer.observe(sidebarElement, {
				attributes: true,
				attributeFilter: ["data-width"],
			});
		}

		// Also use ResizeObserver as a backup
		observerRef.current = new ResizeObserver(updateTooltipPosition);
		if (sidebarElement) {
			observerRef.current.observe(sidebarElement);
		}

		return () => {
			observer.disconnect();
			observerRef.current?.disconnect();
		};
	}, [showTooltip, position]);

	const handleComplete = () => {
		completeStep(tourId);
		goToNextStep();
		setShowTooltip(false);
	};

	return (
		<>
			<button
				onClick={
					!isCompleted && currentStepId && currentStepId !== tourId
						? undefined
						: onClick
				}
				className={cn(
					"group relative z-[120] flex h-10 w-10 items-center justify-center transition-all duration-200",
					tourId === "account" ? "rounded-full" : "rounded-lg",
					"border border-transparent bg-transparent",
					"hover:border-[#333] hover:bg-gradient-to-b hover:from-[#181818] hover:to-[#0F0F0F] hover:shadow-lg hover:shadow-black/20",
					isActive &&
						"text-white hover:border-[#444] hover:from-[#1c1c1c] hover:to-[#141414]",
					isCurrentTour &&
						!isCompleted &&
						[
							"border-[#3FFFA2]/40",
							"shadow-[inset_0_0_35px_rgba(63,255,162,0.4)]",
							"shadow-[inset_0_0_15px_rgba(63,255,162,0.5)]",
							"inset-shadow-sm inset-shadow-[#3FFFA2]/40",
							"inset-shadow-xs inset-shadow-[#3FFFA2]/30",
							"bg-linear-45/oklch from-[#3FFFA2]/25 via-[#3FFFA2]/15 to-transparent",
							"shadow-lg shadow-[#3FFFA2]/30",
							"shadow-md shadow-[#3FFFA2]/20",
							"inset-ring inset-ring-[#3FFFA2]/25",
							"ring-1 ring-[#3FFFA2]/40",
							"hover:shadow-[inset_0_0_50px_rgba(63,255,162,0.6)]",
							"hover:shadow-[inset_0_0_25px_rgba(63,255,162,0.5)]",
							"hover:inset-shadow-sm hover:inset-shadow-[#3FFFA2]/50",
							"hover:inset-shadow-xs hover:inset-shadow-[#3FFFA2]/40",
							"hover:bg-linear-45/oklch hover:from-[#3FFFA2]/35 hover:via-[#3FFFA2]/20 hover:to-transparent",
							"hover:border-[#3FFFA2]/50",
							"hover:shadow-lg hover:shadow-[#3FFFA2]/40",
							"hover:shadow-md hover:shadow-[#3FFFA2]/30",
							"hover:inset-ring hover:inset-ring-[#3FFFA2]/35",
							"hover:ring-1 hover:ring-[#3FFFA2]/50",
						].join(" "),
					!isCompleted &&
						currentStepId &&
						currentStepId !== tourId &&
						"pointer-events-none cursor-not-allowed opacity-50 hover:border-transparent hover:bg-transparent hover:shadow-none",
					className,
				)}
			>
				<Icon
					size={20}
					className={cn("transition-colors", {
						"text-[#3FFFA2] group-hover:text-[#3FFFA2]/80":
							isCurrentTour && !isCompleted,
						"text-[#818181] group-hover:text-white":
							!isCurrentTour || isCompleted,
					})}
				/>
			</button>
			{typeof window !== "undefined" && (
				<AnimatePresence>
					{showTooltip && !isCompleted && (
						<motion.div
							initial={{ opacity: 0, scale: 0.98, x: 0 }}
							animate={{
								opacity: 1,
								scale: 1,
								x: isOpen
									? position === "left"
										? sidebarWidth
										: -sidebarWidth
									: 0,
							}}
							exit={{ opacity: 0, scale: 0.98, x: 0 }}
							transition={{
								duration: 0.2,
								ease: [0.2, 1, 0.2, 1],
							}}
							className={cn(
								"fixed top-18 z-50",
								position === "left"
									? isOpen
										? "left-4"
										: "left-20"
									: isOpen
										? "right-4"
										: "right-20",
							)}
						>
							{React.cloneElement(children, {
								onComplete: handleComplete,
								isCompleted: isCompleted,
								isCurrentTourStep: isCurrentTour,
							})}
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</>
	);
}
