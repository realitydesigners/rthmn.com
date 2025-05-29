"use client";

import { DemoSettingsPanel } from "@/components/Demo/DemoPanelContent";
import { DemoSidebarWrapper } from "@/components/Demo/DemoSidebarPanelWrapper";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { LuGraduationCap, LuSettings, LuUser } from "react-icons/lu";

interface DemoSidebarRightProps {
	x?: MotionValue<number>;
	opacity?: MotionValue<number>;
}

// Mock Demo Sidebar Right Component
export const DemoSidebarRight = memo(
	({ x, opacity }: DemoSidebarRightProps) => {
		const [activePanel, setActivePanel] = useState<string | null>(null);
		const [sidebarLoaded, setSidebarLoaded] = useState(false);

		// Simulate sidebar loading completion after animation
		useEffect(() => {
			const timer = setTimeout(() => {
				setSidebarLoaded(true);
			}, 1000); // Wait for sidebar animation to complete

			return () => clearTimeout(timer);
		}, []);

		const mockButtons = [
			{
				id: "onboarding",
				icon: LuGraduationCap,
				label: "Tutorial",
				panelContent: <DemoSettingsPanel />, // Reuse for demo
			},
			{
				id: "settings",
				icon: LuSettings,
				label: "Settings",
				panelContent: <DemoSettingsPanel />,
			},
			{
				id: "account",
				icon: LuUser,
				label: "Account",
				panelContent: <DemoSettingsPanel />, // Reuse for demo
			},
		];

		const handleButtonClick = (buttonId: string) => {
			if (!sidebarLoaded) return;

			if (activePanel === buttonId) {
				setActivePanel(null);
			} else {
				setActivePanel(buttonId);
			}
		};

		const activePanelData = mockButtons.find(
			(button) => button.id === activePanel,
		);

		return (
			<>
				<motion.div
					style={{ x, opacity }}
					className="absolute right-0 top-14 bottom-0 z-[90] flex w-16 flex-col items-center justify-between border-l border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] py-4"
				>
					{/* Top buttons */}
					<div className="relative flex flex-col gap-2">
						{mockButtons.slice(0, 1).map((button, index) => {
							const IconComponent = button.icon;
							const isActive = activePanel === button.id;

							return (
								<button
									key={button.id}
									type="button"
									onClick={() => handleButtonClick(button.id)}
									disabled={!sidebarLoaded}
									className={`
										group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg 
										transition-all duration-200 hover:bg-[#1C1E23]/60
										${
											isActive
												? "bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 shadow-[0_0_15px_rgba(36,255,102,0.2)]"
												: "bg-gradient-to-b from-[#1C1E23]/40 to-[#0F1012]/20 border border-[#1C1E23]/60"
										}
										${!sidebarLoaded ? "opacity-50 cursor-not-allowed" : ""}
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
									<div className="absolute right-full mr-2 hidden group-hover:block">
										<div className="whitespace-nowrap rounded-md bg-[#1C1E23] px-2 py-1 text-xs text-white shadow-lg border border-[#32353C]">
											{button.label}
										</div>
									</div>
								</button>
							);
						})}
					</div>

					{/* Bottom buttons - Settings and Account */}
					<div className="mb-2 flex flex-col gap-2">
						{mockButtons.slice(1).map((button) => {
							const IconComponent = button.icon;
							const isActive = activePanel === button.id;

							return (
								<button
									key={button.id}
									type="button"
									onClick={() => handleButtonClick(button.id)}
									disabled={!sidebarLoaded}
									className={`
										group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg 
										transition-all duration-200 hover:bg-[#1C1E23]/60
										${
											isActive
												? "bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 shadow-[0_0_15px_rgba(36,255,102,0.2)]"
												: "bg-gradient-to-b from-[#1C1E23]/40 to-[#0F1012]/20 border border-[#1C1E23]/60"
										}
										${!sidebarLoaded ? "opacity-50 cursor-not-allowed" : ""}
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
									<div className="absolute right-full mr-2 hidden group-hover:block">
										<div className="whitespace-nowrap rounded-md bg-[#1C1E23] px-2 py-1 text-xs text-white shadow-lg border border-[#32353C]">
											{button.label}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				</motion.div>

				{/* Demo Panel Wrapper */}
				{activePanelData && (
					<DemoSidebarWrapper
						isOpen={!!activePanel}
						title={activePanelData.label}
						position="right"
						onClose={() => setActivePanel(null)}
					>
						{activePanelData.panelContent}
					</DemoSidebarWrapper>
				)}
			</>
		);
	},
);

DemoSidebarRight.displayName = "DemoSidebarRight";
