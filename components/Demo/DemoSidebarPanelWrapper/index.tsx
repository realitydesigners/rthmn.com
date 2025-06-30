"use client";

import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

export const DemoSidebarWrapper = ({
	isOpen,
	children,
	title,
	position,
	initialWidth = 280,
	onClose,
	opacity,
}: {
	isOpen: boolean;
	children: React.ReactNode;
	title: string;
	position: "left" | "right";
	initialWidth?: number;
	onClose: () => void;
	opacity?: MotionValue<number>;
}) => {
	const [width, setWidth] = useState(initialWidth);
	const [mounted, setMounted] = useState(false);
	const [isLocked, setIsLocked] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleResize = useCallback((newWidth: number) => {
		setWidth(Math.max(280, Math.min(600, newWidth)));
	}, []);

	if (!mounted) return null;

	return (
		<motion.div
			initial={false}
			animate={{
				x: 0,
				opacity: isOpen ? 1 : 0,
				scale: isOpen ? 1 : 0.98,
			}}
			transition={{
				duration: 0.4,
				ease: [0.23, 1, 0.32, 1],
				opacity: { duration: 0.25 },
				scale: { duration: 0.4 },
			}}
			className={cn(
				"sidebar-content fixed top-0 z-[25] bottom-0 hidden transform lg:flex",
				position === "left" ? "left-0" : "right-0",
				isOpen ? "pointer-events-auto" : "pointer-events-none",
			)}
			data-position={position}
			data-locked={isLocked}
			data-open={isOpen}
			data-width={width}
			style={{
				width: `${width}px`,
				// Simple dark background with barely visible content behind
				background: "rgba(0, 0, 0, 0.96)",
				backdropFilter: "blur(24px) saturate(140%) brightness(1.1)",
				// Remove hard border
				border: "none",
				borderRadius: "0",
				// Softer, more organic shadow
				boxShadow: isOpen
					? `
            ${position === "left" ? "4px" : "-4px"} 0 24px rgba(0, 0, 0, 0.2),
            ${position === "left" ? "8px" : "-8px"} 0 48px rgba(0, 0, 0, 0.1),
            ${position === "left" ? "1px" : "-12px"} 0 72px rgba(0, 0, 0, 0.05)
          `
					: "none",
				// Very subtle glow for locked panels
				...(isLocked &&
					isOpen && {
						filter: "drop-shadow(0 0 16px rgba(36, 255, 102, 0.04))",
					}),
				// Apply opacity from motion value if provided
				opacity: opacity ? undefined : 1,
			}}
		>
			<div className="relative flex h-full w-full">
				<div className={cn("relative flex h-full w-full flex-col")}>
					{/* Minimal header - just spacing for navbar */}
					<div className="relative z-10 h-4 mt-12" />
					<div className="relative flex-1 overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						{children}
					</div>
				</div>
			</div>
		</motion.div>
	);
};
