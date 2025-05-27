"use client";

import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { LuLock, LuUnlock, LuX } from "react-icons/lu";

const LockButton = ({
	isLocked,
	onClick,
}: {
	isLocked: boolean;
	onClick: () => void;
}) => (
	<button
		type="button"
		onClick={onClick}
		className={cn(
			"group relative z-[120] flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200",
			isLocked
				? "border-[#32353C] bg-gradient-to-b from-[#1C1E23] to-[#0F0F0F] text-white shadow-lg shadow-black/20"
				: "border-transparent bg-transparent text-[#32353C] hover:border-[#32353C] hover:bg-gradient-to-b hover:from-[#1C1E23] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20",
		)}
	>
		<div className="relative flex items-center justify-center">
			{isLocked ? (
				<LuLock
					size={11}
					className="transition-transform duration-200 group-hover:scale-110"
				/>
			) : (
				<LuUnlock
					size={11}
					className="transition-transform duration-200 group-hover:scale-110"
				/>
			)}
		</div>
	</button>
);

const CloseButton = ({ onClick }: { onClick: () => void }) => (
	<button
		type="button"
		onClick={onClick}
		className="group relative z-[120] flex h-7 w-7 items-center justify-center rounded-lg border border-transparent bg-transparent text-[#32353C] transition-all duration-200 hover:border-[#32353C] hover:bg-gradient-to-b hover:from-[#1C1E23] hover:to-[#0F0F0F] hover:text-white hover:shadow-lg hover:shadow-black/20"
	>
		<div className="relative flex items-center justify-center">
			<LuX
				size={11}
				className="transition-transform duration-200 group-hover:scale-110"
			/>
		</div>
	</button>
);

export const DemoSidebarWrapper = ({
	isOpen,
	children,
	title,
	position,
	initialWidth = 350,
	onClose,
}: {
	isOpen: boolean;
	children: React.ReactNode;
	title: string;
	position: "left" | "right";
	initialWidth?: number;
	onClose: () => void;
}) => {
	const [width, setWidth] = useState(initialWidth);
	const [isLocked, setIsLocked] = useState(false);

	const handleLockToggle = useCallback(() => {
		setIsLocked(!isLocked);
	}, [isLocked]);

	return (
		<motion.div
			initial={false}
			animate={{
				x: isOpen ? 0 : position === "left" ? -width : width,
			}}
			transition={{
				duration: 0.15,
				ease: "easeInOut",
			}}
			className={cn(
				"fixed top-14 z-[100] bottom-0 transform bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
				position === "left" ? "left-16" : "right-16", // Account for demo sidebar width
				isOpen ? "pointer-events-auto" : "pointer-events-none",
			)}
			style={{
				width: `${width}px`,
				boxShadow: isOpen
					? position === "left"
						? "4px 0 16px rgba(0,0,0,0.3)"
						: "-4px 0 16px rgba(0,0,0,0.3)"
					: "none",
			}}
		>
			<div className="relative flex h-full w-full">
				<div
					className={cn(
						"relative flex h-full w-full flex-col",
						position === "left"
							? "border-r border-[#1C1E23]"
							: "border-l border-[#1C1E23]",
					)}
				>
					{/* Header */}
					<div className="relative z-10 flex h-12 items-center justify-between px-3 bg-gradient-to-b from-[#0A0B0D] to-[#070809] border-b border-[#1C1E23]">
						{position === "right" && (
							<div className="flex items-center gap-2">
								<LockButton isLocked={isLocked} onClick={handleLockToggle} />
								<CloseButton onClick={onClose} />
							</div>
						)}
						<div
							className={cn(
								"flex items-center justify-center",
								position === "right" && "flex-1 justify-end",
							)}
						>
							<h2 className="font-outfit text-[10px] font-medium tracking-wide text-[#32353C] uppercase">
								{title}
							</h2>
						</div>
						{position === "left" && (
							<div className="flex items-center gap-2">
								<CloseButton onClick={onClose} />
								<LockButton isLocked={isLocked} onClick={handleLockToggle} />
							</div>
						)}
					</div>

					{/* Content */}
					<div className="relative flex-1 overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						{children}
					</div>

					{/* Demo Glow Effect */}
					<div className="pointer-events-none absolute inset-0 z-[90]">
						<div className="absolute inset-0 overflow-hidden">
							<div className="absolute -bottom-32 -left-16 h-32 w-32 bg-[#24FF66]/[0.15] blur-[24px]" />
							<div className="absolute -right-16 -bottom-32 h-32 w-32 bg-[#24FF66]/[0.15] blur-[24px]" />

							<div className="absolute -top-16 -left-16 h-64 w-64 bg-[radial-gradient(circle_at_0%_0%,rgba(36,255,102,0.1),transparent_70%)]" />
							<div className="absolute -top-16 -right-16 h-64 w-64 bg-[radial-gradient(circle_at_100%_0%,rgba(36,255,102,0.1),transparent_70%)]" />
						</div>

						{/* Soft edge gradients */}
						<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(36,255,102,0.05),transparent_20%,transparent_90%,rgba(36,255,102,0.05))]" />
						<div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(36,255,102,0.05),transparent_20%,transparent_90%,rgba(36,255,102,0.05))]" />
					</div>
				</div>
			</div>
		</motion.div>
	);
};
