"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { LuGraduationCap, LuSettings, LuUser } from "react-icons/lu";

interface DemoSidebarRightProps {
	x?: MotionValue<number>;
	opacity?: MotionValue<number>;
}

// Mock Demo Sidebar Right Component
export const DemoSidebarRight = memo(
	({ x, opacity }: DemoSidebarRightProps) => {
		const mockButtons = [
			{
				id: "onboarding",
				icon: LuGraduationCap,
				label: "Tutorial",
			},
			{
				id: "settings",
				icon: LuSettings,
				label: "Settings",
			},
			{
				id: "account",
				icon: LuUser,
				label: "Account",
			},
		];

		return (
			<motion.div
				style={{ x, opacity }}
				className="absolute right-0 top-14 bottom-0 z-[90] flex w-16 flex-col items-center justify-between border-l border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] py-4"
			>
				{/* Top buttons */}
				<div className="relative flex flex-col gap-2">
					{mockButtons.slice(0, 1).map((button, index) => {
						const IconComponent = button.icon;

						return (
							<div
								key={button.id}
								className={`
								group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg 
								transition-all duration-200 hover:bg-[#1C1E23]/60
							
							`}
							>
								<IconComponent
									size={18}
									className={`transition-colors duration-200`}
								/>

								{/* Tooltip */}
								<div className="absolute right-full mr-2 hidden group-hover:block">
									<div className="whitespace-nowrap rounded-md bg-[#1C1E23] px-2 py-1 text-xs text-white shadow-lg border border-[#32353C]">
										{button.label}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Bottom buttons - Settings and Account */}
				<div className="mb-2 flex flex-col gap-2">
					{mockButtons.slice(1).map((button) => {
						const IconComponent = button.icon;

						return (
							<div
								key={button.id}
								className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-b from-[#1C1E23]/40 to-[#0F1012]/20 border border-[#1C1E23]/60 transition-all duration-200 hover:bg-[#1C1E23]/60"
							>
								<IconComponent
									size={18}
									className="text-[#818181] transition-colors duration-200 group-hover:text-white"
								/>

								{/* Tooltip */}
								<div className="absolute right-full mr-2 hidden group-hover:block">
									<div className="whitespace-nowrap rounded-md bg-[#1C1E23] px-2 py-1 text-xs text-white shadow-lg border border-[#32353C]">
										{button.label}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</motion.div>
		);
	},
);

DemoSidebarRight.displayName = "DemoSidebarRight";
