"use client";

import { InstrumentsContent } from "@/app/(user)/onboarding/_components/FeatureTour/InstrumentsContent";
import { VisualizerContent } from "@/app/(user)/onboarding/_components/FeatureTour/VisualizerContent";
import { InstrumentsPanel } from "@/components/Panels/InstrumentsPanel";
import { Sidebar } from "@/components/Sidebars/Sidebar";
import { LuLayoutGrid, LuLineChart } from "react-icons/lu";
import { ChartStyleOptions } from "@/components/Charts/ChartStyleOptions";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";

export const SidebarLeft = () => {
	const buttons = [
		{
			id: "instruments",
			icon: LuLineChart,
			tourContent: <InstrumentsContent />,
			panelContent: <InstrumentsPanel />,
		},
		{
			id: "visualizer",
			icon: LuLayoutGrid,
			tourContent: <VisualizerContent />,
			panelContent: (
				<>
					<ChartStyleOptions />
					<TimeFrameSlider global />
				</>
			),
		},
	];

	return (
		<Sidebar position="left" buttons={buttons} defaultPanel="instruments" />
	);
};
