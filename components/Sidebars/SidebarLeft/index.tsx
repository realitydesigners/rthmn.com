"use client";

import { TourInstruments } from "@/app/(user)/onboarding/_components/Tours/TourInstruments";
import { TourVisualizers } from "@/app/(user)/onboarding/_components/Tours/TourVisualizers";
import { ChartStyleOptions } from "@/components/Charts/ChartStyleOptions";
import { InstrumentsPanel } from "@/components/Panels/InstrumentsPanel";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { Sidebar } from "@/components/Sidebars/Sidebar";
import { LuLayoutGrid, LuLineChart } from "react-icons/lu";

export const SidebarLeft = () => {
	const buttons = [
		{
			id: "instruments",
			icon: LuLineChart,
			tourContent: <TourInstruments />,
			panelContent: <InstrumentsPanel />,
		},
		{
			id: "visualizer",
			icon: LuLayoutGrid,
			tourContent: <TourVisualizers />,
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
