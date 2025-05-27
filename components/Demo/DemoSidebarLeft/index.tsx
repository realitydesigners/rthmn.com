"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import {
	LuLineChart,
	LuLayoutGrid,
	LuTrendingUp,
	LuBarChart3,
} from "react-icons/lu";
import { DemoSidebarWrapper } from "@/components/Demo/DemoSidebarPanelWrapper";
import {
	DemoInstrumentsPanel,
	DemoVisualizerPanel,
	DemoAnalyticsPanel,
} from "@/components/Demo/DemoPanelContent";

interface DemoSidebarLeftProps {
	x?: MotionValue<number>;
	opacity?: MotionValue<number>;
}

// Mock Demo Sidebar Left Component
export const DemoSidebarLeft = memo(({ x, opacity }: DemoSidebarLeftProps) => {
	const [activePanel, setActivePanel] = useState<string | null>(null);
	const [sidebarLoaded, setSidebarLoaded] = useState(false);

	// Simulate sidebar loading completion after animation
	useEffect(() => {
		setSidebarLoaded(true);
	}, []);

	const mockButtons = [
		{
			id: "instruments",
			icon: LuLineChart,
			label: "Instruments",
			panelContent: <DemoInstrumentsPanel />,
		},
		{
			id: "visualizer",
			icon: LuLayoutGrid,
			label: "Visualizer",
			panelContent: <DemoVisualizerPanel />,
		},
		{
			id: "analytics",
			icon: LuTrendingUp,
			label: "Analytics",
			panelContent: <DemoAnalyticsPanel />,
		},
		{
			id: "charts",
			icon: LuBarChart3,
			label: "Charts",
			panelContent: <DemoInstrumentsPanel />, // Reuse for demo
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
				className="absolute left-0 top-14 bottom-0 z-[90] flex w-16 flex-col items-center justify-between border-r border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] py-4"
			>
				{/* Top buttons */}
				<div className="relative flex flex-col gap-2">
					{mockButtons.map((button, index) => {
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
								<div className="absolute left-full ml-2 hidden group-hover:block">
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
					position="left"
					onClose={() => setActivePanel(null)}
				>
					{activePanelData.panelContent}
				</DemoSidebarWrapper>
			)}
		</>
	);
});

DemoSidebarLeft.displayName = "DemoSidebarLeft";
