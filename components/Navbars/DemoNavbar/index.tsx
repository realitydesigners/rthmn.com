"use client";

import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import Image from "next/image";
import { memo, useState } from "react";
import { LuChevronRight, LuLayoutDashboard, LuOrbit } from "react-icons/lu";
import { ConnectionBadge } from "../../Badges/ConnectionBadge";

interface DemoNavbarProps {
	y?: MotionValue<number>;
	opacity?: MotionValue<number>;
}

// Enhanced breadcrumb button component matching the exact design system
const BreadcrumbButton = ({
	segment,
	icon,
	isLast,
}: {
	segment: string;
	icon?: React.ReactNode;
	isLast?: boolean;
}) => (
	<div className="group relative">
		<div
			className="relative flex items-center gap-1.5 px-2 py-1.5 transition-all duration-300 overflow-hidden cursor-pointer"
			style={{ borderRadius: "4px" }}
		>
			{/* Transparent by default, gradient on hover */}
			<div
				className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				style={{
					borderRadius: "4px",
					background: "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
					boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
				}}
			/>

			{icon && (
				<span className="relative z-10 text-[#32353C] transition-colors duration-300 group-hover:text-[#B0B0B0]">
					{icon}
				</span>
			)}
			<span className="relative z-10 font-russo text-[10px] font-medium tracking-wide text-[#32353C] uppercase transition-colors duration-300 group-hover:text-white">
				{segment}
			</span>
		</div>
	</div>
);

// Enhanced logo button component
const LogoButton = () => (
	<div
		className="group relative flex items-center justify-center w-14 h-14 transition-all duration-300 overflow-hidden cursor-pointer"
		style={{ borderRadius: "4px" }}
	>
		{/* Transparent by default, subtle gradient on hover */}
		<div
			className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
			style={{
				borderRadius: "4px",
				background: "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
				boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
			}}
		/>

		<div className="relative z-10 p-2 w-full h-full">
			<Image
				src="/rthmn-onboarding-logo.png"
				alt="Rthmn Logo"
				width={96}
				height={96}
				className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
				priority
			/>
		</div>
	</div>
);

// Mock GridControl component for demo
const MockGridControl = () => {
	const [activeLayout, setActiveLayout] = useState<"compact" | "balanced">(
		"balanced",
	);

	const layouts = [
		{ id: "compact" as const, label: "Compact" },
		{ id: "balanced" as const, label: "Balanced" },
	];

	return (
		<div
			className="flex items-center gap-1 p-1 bg-black rounded-xl transition-all duration-300 overflow-hidden"
			style={{
				borderRadius: "4px",
				border: "1px solid rgba(28, 30, 35, 0.4)",
			}}
		>
			<div className="flex gap-1">
				{layouts.map((layout) => (
					<button
						key={layout.id}
						onClick={() => setActiveLayout(layout.id)}
						className="group/gridcontrol font-russo relative flex h-7 items-center px-2 text-[10px] font-medium transition-all duration-300 overflow-hidden"
						style={{ borderRadius: "4px" }}
					>
						{/* Compact balanced indicator - shows when active */}
						{activeLayout === layout.id && (
							<div
								className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
								style={{
									width: "20px",
									height: "3px",
									transform: "translateY(-50%) rotate(-90deg)",
									filter: "blur(6px)",
									transformOrigin: "center",
								}}
							/>
						)}

						{/* Active background - only when this specific button is active */}
						{activeLayout === layout.id && (
							<div
								className="absolute inset-0"
								style={{
									borderRadius: "4px",
									background:
										"linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
									boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
								}}
							/>
						)}

						{/* Hover background - only for inactive buttons and only on hover */}
						{activeLayout !== layout.id && (
							<div
								className="absolute inset-0 opacity-0 group-hover/gridcontrol:opacity-100 transition-opacity duration-300"
								style={{
									borderRadius: "4px",
									background:
										"linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
									boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
								}}
							/>
						)}

						<span
							className={`relative z-10 transition-colors duration-300 ${
								activeLayout === layout.id
									? "text-[#B0B0B0]"
									: "text-[#818181] group-hover/gridcontrol:text-white"
							}`}
						>
							{layout.label}
						</span>
					</button>
				))}
			</div>
		</div>
	);
};

// Mock Zen Mode Toggle component for demo
const MockZenModeToggle = () => {
	const [isZenMode, setIsZenMode] = useState(false);
	const [hasBeenAccessed] = useState(true); // For demo, assume it's been accessed

	return (
		<div className="group relative flex items-center gap-3">
			{/* Compact balanced indicator - shows when zen mode is active */}
			{isZenMode && (
				<div
					className="absolute -left-3 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
					style={{
						width: "18px",
						height: "2px",
						transform: "translateY(-50%) rotate(-90deg)",
						filter: "blur(5px)",
						transformOrigin: "center",
						opacity: 0.6,
					}}
				/>
			)}

			<span className="font-russo text-[9px] font-medium text-[#818181] uppercase tracking-wide">
				ZEN
			</span>
			<div
				className="relative px-1 py-0.5 transition-all duration-300 overflow-hidden"
				style={{
					borderRadius: "6px",
					background: "rgba(0, 0, 0, 0.6)",
					border: "1px solid rgba(28, 30, 35, 0.4)",
				}}
			>
				<button
					onClick={() => setIsZenMode(!isZenMode)}
					className={`relative flex h-5 w-9 items-center rounded-full border transition-all duration-300 overflow-hidden ${
						isZenMode ? "border-[#32353C]/80" : "border-[#1C1E23]/60"
					}`}
					title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
					style={{
						background: isZenMode
							? "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)"
							: "#000000",
						boxShadow: isZenMode
							? "0px 2px 4px 0px rgba(0, 0, 0, 0.25)"
							: "none",
					}}
				>
					{/* Toggle handle */}
					<div
						className={`relative h-3 w-3 rounded-full border transition-all duration-300 transform shadow-sm ${
							isZenMode
								? "translate-x-5 border-[#32353C]/60 bg-[#B0B0B0]"
								: "translate-x-1 border-[#32353C]/60 bg-white"
						}`}
					/>
				</button>
			</div>
		</div>
	);
};

// Demo Navbar Component - matching NavbarSignedIn design system
export const DemoNavbar = memo(({ y, opacity }: DemoNavbarProps) => {
	// Mock data for demo
	const mockPathSegments = ["Dashboard", "Trading"];

	const getSegmentIcon = (segment: string) => {
		switch (segment.toLowerCase()) {
			case "dashboard":
				return <LuLayoutDashboard size={14} />;
			case "trading":
				return <LuOrbit size={14} />;
			default:
				return null;
		}
	};

	return (
		<motion.nav
			style={{ y, opacity }}
			className="absolute top-0 right-0 left-0 z-[100] h-14 lg:flex"
		>
			<div className="group relative h-full w-full">
				<div className="relative flex h-full w-full items-center justify-between rounded-lg pr-2">
					{/* Left section */}
					<div className="relative flex items-center lg:gap-2">
						<div className="flex items-center justify-center lg:w-16">
							<LogoButton />
						</div>

						{/* Breadcrumb */}
						<div className="flex hidden items-center text-[#818181] lg:flex">
							{mockPathSegments.map((segment, index, array) => (
								<div key={segment} className="flex items-center gap-1.5">
									<BreadcrumbButton
										segment={segment}
										icon={getSegmentIcon(segment)}
										isLast={index === array.length - 1}
									/>
									{index < array.length - 1 && (
										<LuChevronRight size={14} className="text-[#32353C]" />
									)}
								</div>
							))}
						</div>
					</div>

					{/* Center section - GridControl and Zen Mode */}
					<div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex items-center gap-3">
						<MockGridControl />
						<MockZenModeToggle />
					</div>

					{/* Right section - Connection Status */}
					<div className="relative flex items-center gap-4">
						<div className="relative">
							<ConnectionBadge isConnected={true} />
						</div>
					</div>
				</div>
			</div>
		</motion.nav>
	);
});

DemoNavbar.displayName = "DemoNavbar";
