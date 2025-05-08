"use client";

import { cn } from "@/utils/cn";
import {
	getSidebarLocks,
	getSidebarState,
	setSidebarLocks,
	setSidebarState,
} from "@/utils/localStorage";
import { motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useState, useRef } from "react";
import { LuLock, LuUnlock } from "react-icons/lu";

const LockButton = ({
	isLocked,
	onClick,
}: { isLocked: boolean; onClick: () => void }) => (
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

export const SidebarWrapper = ({
	isOpen,
	children,
	title,
	isLocked,
	onLockToggle,
	position,
	initialWidth = 350,
	isCurrentTourStep,
	isCompleted,
}: {
	isOpen: boolean;
	children: React.ReactNode;
	title: string;
	isLocked: boolean;
	onLockToggle: () => void;
	position: "left" | "right";
	initialWidth?: number;
	isCurrentTourStep?: boolean;
	isCompleted?: boolean;
}) => {
	const [width, setWidth] = useState(initialWidth);
	const [mounted, setMounted] = useState(false);
	const initialLoadRef = useRef(true);

	useEffect(() => {
		setMounted(true);

		// Only run this effect once on initial mount
		if (initialLoadRef.current) {
			initialLoadRef.current = false;
			const state = getSidebarState();
			const locks = getSidebarLocks();

			if (locks[position] && !state[position].isOpen) {
				setSidebarState({
					...state,
					[position]: {
						...state[position],
						isOpen: true,
						locked: true,
					},
				});
				onLockToggle();
			}
		}
	}, [position, onLockToggle]);

	const handleResize = useCallback((newWidth: number) => {
		setWidth(Math.max(350, Math.min(600, newWidth)));
	}, []);

	const handleLockToggle = useCallback(() => {
		const locks = getSidebarLocks();
		const state = getSidebarState();

		setSidebarLocks({
			...locks,
			[position]: !isLocked,
		});

		setSidebarState({
			...state,
			[position]: {
				...state[position],
				isOpen,
				locked: !isLocked,
			},
		});

		onLockToggle();
	}, [isLocked, onLockToggle, position, isOpen]);

	useEffect(() => {
		if (!mounted) return;

		const main = document.querySelector("main");
		const container = document.getElementById("app-container");
		if (!main || !container) return;

		const leftSidebar = document.querySelector(
			'.sidebar-content [data-position="left"]',
		);
		const rightSidebar = document.querySelector(
			'.sidebar-content [data-position="right"]',
		);

		const leftWidth =
			leftSidebar?.getAttribute("data-locked") === "true"
				? Number.parseInt(leftSidebar?.getAttribute("data-width") || "0")
				: 0;
		const rightWidth =
			rightSidebar?.getAttribute("data-locked") === "true"
				? Number.parseInt(rightSidebar?.getAttribute("data-width") || "0")
				: 0;

		if (isOpen && isLocked) {
			if (position === "left") {
				main.style.marginLeft = `${width}px`;
				main.style.width = `calc(100% - ${width + rightWidth}px)`;
				main.style.paddingLeft = "0";
			} else {
				main.style.marginRight = `${width}px`;
				main.style.width = `calc(100% - ${width + leftWidth}px)`;
				main.style.paddingRight = "0";
			}
		} else {
			if (position === "left") {
				main.style.marginLeft = "0";
				main.style.width =
					rightWidth > 0 ? `calc(100% - ${rightWidth}px)` : "100%";
				main.style.paddingLeft = "64px";
			} else {
				main.style.marginRight = "0";
				main.style.width =
					leftWidth > 0 ? `calc(100% - ${leftWidth}px)` : "100%";
				main.style.paddingRight = "64px";
			}
		}
		container.style.overflowX = "hidden";
	}, [isOpen, width, position, isLocked, mounted]);

	if (!mounted) return null;

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
				"sidebar-content fixed top-14 bottom-0 hidden transform lg:flex bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
				position === "left" ? "left-0" : "right-0",
				isOpen ? "pointer-events-auto" : "pointer-events-none",
				isLocked ? "z-[90]" : "z-[110]",
			)}
			data-position={position}
			data-locked={isLocked}
			data-width={width}
			style={{ width: `${width}px` }}
		>
			<div
				className={cn(
					"relative flex h-full w-full",
					position === "left" ? "ml-16" : "mr-16",
				)}
			>
				<div
					className={cn(
						"relative flex h-full w-full flex-col  p-1",
						position === "left" ? "border-r" : "border-l",
						"border-[#111215]",
					)}
				>
					{/* Header */}
					<div className="relative z-10 flex h-12 items-center justify-between px-3">
						{position === "right" && (
							<LockButton isLocked={isLocked} onClick={handleLockToggle} />
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
							<LockButton isLocked={isLocked} onClick={handleLockToggle} />
						)}
					</div>

					{/* Content */}
					<div className="relative flex-1 overflow-y-auto px-2 pb-4">
						{children}
					</div>

					{/* Onboarding Overlay */}
					{/* Onboarding Overlay */}
					{isCurrentTourStep && !isCompleted && (
						<div className="pointer-events-none absolute inset-0 z-[1000]">
							{/* Inner edge glows */}
							<div className="absolute inset-0 overflow-hidden">
								{/* Enhanced corner shadows */}

								{/* Intense corner glows */}
							</div>

							{/* Additional corner radials for depth */}
							<div className="absolute inset-0 overflow-hidden">
								<div className="absolute -bottom-32 -left-16 h-32 w-32 bg-[#447DFC]/[0.35] blur-[24px]" />
								<div className="absolute -right-16 -bottom-32 h-32 w-32 bg-[#447DFC]/[0.35] blur-[24px]" />

								<div className="absolute -top-16 -left-16 h-64 w-64 bg-[radial-gradient(circle_at_0%_0%,rgba(68,125,252,0.2),transparent_70%)]" />
								<div className="absolute -top-16 -right-16 h-64 w-64 bg-[radial-gradient(circle_at_100%_0%,rgba(68,125,252,0.2),transparent_70%)]" />
							</div>

							{/* Soft edge gradients */}
							<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(68,125,252,0.15),transparent_20%,transparent_90%,rgba(68,125,252,0.15))]" />
							<div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(68,125,252,0.15),transparent_20%,transparent_90%,rgba(68,125,252,0.15))]" />
						</div>
					)}
				</div>

				{/* Resize handle */}
				<div
					className={cn(
						"absolute top-0 bottom-0 w-4 cursor-ew-resize opacity-0 hover:opacity-100",
						position === "left" ? "-right-4" : "-left-4",
					)}
					onMouseDown={(e) => {
						e.preventDefault();
						const startX = e.clientX;
						const startWidth = width;

						const handleMouseMove = (e: MouseEvent) => {
							const delta = e.clientX - startX;
							handleResize(startWidth + (position === "left" ? delta : -delta));
						};

						const handleMouseUp = () => {
							window.removeEventListener("mousemove", handleMouseMove);
							window.removeEventListener("mouseup", handleMouseUp);
						};

						window.addEventListener("mousemove", handleMouseMove);
						window.addEventListener("mouseup", handleMouseUp);
					}}
				/>
			</div>
		</motion.div>
	);
};
