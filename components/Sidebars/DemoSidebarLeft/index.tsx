"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import {
	LuLineChart,
	LuLayoutGrid,
	LuTrendingUp,
	LuBarChart3,
} from "react-icons/lu";

interface DemoSidebarLeftProps {
	x?: MotionValue<number>;
	opacity?: MotionValue<number>;
}

// Mock Demo Sidebar Left Component
export const DemoSidebarLeft = memo(({ x, opacity }: DemoSidebarLeftProps) => {
	const mockButtons = [
		{
			id: "instruments",
			icon: LuLineChart,
			label: "Instruments",
		},
		{
			id: "visualizer",
			icon: LuLayoutGrid,
			label: "Visualizer",
		},
		{
			id: "analytics",
			icon: LuTrendingUp,
			label: "Analytics",
		},
		{
			id: "charts",
			icon: LuBarChart3,
			label: "Charts",
		},
	];

	return (
		<motion.div
			style={{ x, opacity }}
			className="absolute left-0 top-14 bottom-0 z-[90] flex w-16 flex-col items-center justify-between border-r border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] py-4"
		>
			{/* Top buttons */}
			<div className="relative flex flex-col gap-2">
				{mockButtons.map((button, index) => {
					const IconComponent = button.icon;
					const isActive = index === 0; // Make first button active for demo

					return (
						<div
							key={button.id}
							className={`
								group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg 
								transition-all duration-200 hover:bg-[#1C1E23]/60
								${
									isActive
										? "bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 shadow-[0_0_15px_rgba(36,255,102,0.2)]"
										: "bg-gradient-to-b from-[#1C1E23]/40 to-[#0F1012]/20 border border-[#1C1E23]/60"
								}
							`}
						>
							<IconComponent
								size={18}
								className={`transition-colors duration-200 ${
									isActive
										? "text-[#24FF66]"
										: "text-[#818181] group-hover:text-white"
								}`}
							/>

							{/* Tooltip */}
							<div className="absolute left-full ml-2 hidden group-hover:block">
								<div className="whitespace-nowrap rounded-md bg-[#1C1E23] px-2 py-1 text-xs text-white shadow-lg border border-[#32353C]">
									{button.label}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Bottom section - empty for demo */}
			<div className="flex flex-col gap-2">
				{/* Could add settings or account buttons here */}
			</div>
		</motion.div>
	);
});

DemoSidebarLeft.displayName = "DemoSidebarLeft";
