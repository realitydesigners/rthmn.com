"use client";

import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

interface MobilePanelWrapperProps {
	isOpen: boolean;
	title?: string;
	onClose: () => void;
	children: React.ReactNode;
	isCurrentTourStep?: boolean;
	isCompleted?: boolean;
}

export const MobilePanelWrapper = ({
	isOpen,
	title,
	children,
}: MobilePanelWrapperProps) => {
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
				"fixed inset-x-0  bottom-0 z-[2040] transform rounded-t-2xl border-t border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
				isOpen ? "pointer-events-auto" : "pointer-events-none",
			)}
			style={{
				height: "calc(60vh)",
				boxShadow: isOpen ? "0 -4px 16px rgba(0,0,0,0.2)" : "none",
			}}
		>
			{/* Header */}
			<div className="flex items-center  justify-between border-b border-[#1C1E23] px-4 py-3">
				<h2 className="font-outfit text-sm font-medium capitalize text-white">
					{title}
				</h2>
			</div>

			{/* Content */}
			<div className="custom-scrollbar pt-2 pb-36 h-full overflow-y-auto overscroll-contain px-4 pb-safe">
				{children}
			</div>

			{/* Bottom gradient fade */}
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#070809] to-transparent" />
		</motion.div>
	);
};
