"use client";

import Image from "next/image";
import { memo } from "react";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import {
	LuChevronRight,
	LuHelpCircle,
	LuLayoutDashboard,
	LuOrbit,
} from "react-icons/lu";

interface DemoNavbarProps {
	y?: MotionValue<number>;
	opacity?: MotionValue<number>;
}

// Demo Navbar Component - similar to NavbarSignedIn but with mock data
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
			className="absolute top-0 right-0 left-0 z-[100] h-14 border-b border-[#1C1E23] bg-[#0A0B0D]/95 backdrop-blur-sm"
		>
			<div className="group relative h-full w-full">
				<div className="relative flex h-full w-full items-center justify-between rounded-lg pr-2">
					{/* Left section */}
					<div className="relative flex items-center lg:gap-2">
						<div className="flex items-center justify-center lg:border-r lg:w-16 lg:border-[#1C1E23]">
							<div className="group relative flex items-center rounded-lg">
								<div className="flex h-14 w-14 items-center p-2">
									<Image
										src="/rthmn-onboarding-logo.png"
										alt="Rthmn Logo"
										width={96}
										height={96}
										className="relative w-full h-full object-contain"
										priority
									/>
								</div>
							</div>
						</div>

						{/* Breadcrumb */}
						<div className="flex hidden items-center text-[#818181] lg:flex">
							{mockPathSegments.map((segment, index, array) => (
								<div key={segment} className="flex items-center gap-1.5">
									<div className="flex items-center gap-1.5 rounded-md px-1.5 py-1">
										{getSegmentIcon(segment) && (
											<span className="text-[#32353C]">
												{getSegmentIcon(segment)}
											</span>
										)}
										<span className="font-outfit text-[10px] font-medium tracking-wide text-[#32353C] uppercase">
											{segment}
										</span>
									</div>
									{index < array.length - 1 && (
										<LuChevronRight size={14} className="text-[#32353C]" />
									)}
								</div>
							))}
						</div>
					</div>

					{/* Right section - Mock Connection Status */}
					<div className="relative flex items-center gap-2">
						<div className="h-4 w-4 items-center justify-center lg:flex hidden">
							<LuHelpCircle className="h-4 w-4 text-[#818181]" />
						</div>
						{/* Mock Connection Badge */}
						<div className="flex items-center gap-2 px-2 py-1 bg-[#1C1E23]/40 border border-[#24FF66]/30 rounded-md">
							<div className="w-2 h-2 bg-[#24FF66] rounded-full" />
							<span className="font-outfit text-xs text-[#24FF66] uppercase tracking-wide">
								Connected
							</span>
						</div>
					</div>
				</div>
			</div>
		</motion.nav>
	);
});

DemoNavbar.displayName = "DemoNavbar";
