"use client";

import { TourInstruments } from "@/app/(user)/onboarding/_components/Tours/TourInstruments";
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
	];

	return (
		<Sidebar position="left" buttons={buttons} defaultPanel="instruments" />
	);
};
