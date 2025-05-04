"use client";
import { useTimeframeStore } from "@/stores/timeframeStore";
import React, { useCallback, useState } from "react";
import {
	LuChevronDown,
	LuChevronUp,
	LuLayoutGrid,
	LuLineChart,
	LuRuler,
} from "react-icons/lu";
import {
	CHART_STYLES,
	ChartStyleOptions,
} from "../../Charts/ChartStyleOptions";
import { TimeFrameSlider } from "../PanelComponents/TimeFrameSlider";
import { Toggle } from "../PanelComponents/Toggle/Toggle";

const VISUALIZER_TABS = {
	chartStyle: {
		id: "chartStyle",
		title: "Chart Style",
		icon: LuLineChart,
		content: (props: { showChartStyle: boolean; onToggle: () => void }) => (
			<>
				<button
					type="button"
					onClick={props.onToggle}
					className="group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]"
				>
					<div className="flex items-center gap-3">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl">
							<LuLineChart
								size={14}
								className="text-[#666] transition-colors group-hover:text-white"
							/>
						</div>
						<span className="font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white">
							Chart Style
						</span>
					</div>
					{props.showChartStyle ? (
						<LuChevronUp
							size={14}
							className="text-[#666] transition-colors group-hover:text-white"
						/>
					) : (
						<LuChevronDown
							size={14}
							className="text-[#666] transition-colors group-hover:text-white"
						/>
					)}
				</button>
				{props.showChartStyle && (
					<div className="mt-2">
						<ChartStyleOptions noContainer className="w-full" />
					</div>
				)}
			</>
		),
	},
	timeframe: {
		id: "timeframe",
		title: "Timeframe",
		icon: LuLayoutGrid,
		content: (props: {
			showTimeframe: boolean;
			onToggle: () => void;
			globalSettings: any;
			handleTimeframeChange: (
				property: string,
				value: number | boolean,
			) => void;
			startGlobalDrag: (dragType: string) => void;
			endGlobalDrag: () => void;
		}) => (
			<>
				<button
					type="button"
					onClick={props.onToggle}
					className="group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]"
				>
					<div className="flex items-center gap-3">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl">
							<LuLayoutGrid
								size={14}
								className="text-[#666] transition-colors group-hover:text-white"
							/>
						</div>
						<span className="font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white">
							Timeframe
						</span>
					</div>
					{props.showTimeframe ? (
						<LuChevronUp
							size={14}
							className="text-[#666] transition-colors group-hover:text-white"
						/>
					) : (
						<LuChevronDown
							size={14}
							className="text-[#666] transition-colors group-hover:text-white"
						/>
					)}
				</button>
				{props.showTimeframe && (
					<div className="relative h-full w-full py-2">
						<TimeFrameSlider
							startIndex={props.globalSettings.startIndex}
							maxBoxCount={props.globalSettings.maxBoxCount}
							boxes={[]}
							onStyleChange={props.handleTimeframeChange}
							onDragStart={props.startGlobalDrag}
							onDragEnd={props.endGlobalDrag}
						/>
					</div>
				)}
			</>
		),
	},
	priceLines: {
		id: "priceLines",
		title: "Price Lines",
		icon: LuRuler,
		content: (props: {
			showPriceLines: boolean;
			onToggle: () => void;
			globalSettings: any;
			handleTimeframeChange: (
				property: string,
				value: number | boolean,
			) => void;
		}) => (
			<>
				<button
					type="button"
					onClick={props.onToggle}
					className="group flex h-10 items-center justify-between rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0A0A0A] px-3 transition-all hover:border-[#333] hover:from-[#181818] hover:to-[#0F0F0F]"
				>
					<div className="flex items-center gap-3">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#181818] to-[#0F0F0F] shadow-xl">
							<LuRuler
								size={14}
								className="text-[#666] transition-colors group-hover:text-white"
							/>
						</div>
						<span className="font-kodemono text-[10px] font-medium tracking-widest text-[#818181] uppercase transition-colors group-hover:text-white">
							Price Lines
						</span>
					</div>
					{props.showPriceLines ? (
						<LuChevronUp
							size={14}
							className="text-[#666] transition-colors group-hover:text-white"
						/>
					) : (
						<LuChevronDown
							size={14}
							className="text-[#666] transition-colors group-hover:text-white"
						/>
					)}
				</button>
				{props.showPriceLines && (
					<div className="px-3 py-2">
						<Toggle
							isEnabled={props.globalSettings.showPriceLines}
							onToggle={props.handleTimeframeChange.bind(
								null,
								"showPriceLines",
								!props.globalSettings.showPriceLines,
							)}
							size="sm"
							title="Show Price Lines"
						/>
					</div>
				)}
			</>
		),
	},
} as const;

export const VisualizersView = () => {
	const [showTimeframe, setShowTimeframe] = useState(true);
	const [showChartStyle, setShowChartStyle] = useState(true);
	const [showPriceLines, setShowPriceLines] = useState(true);

	// Get state from stores
	const globalSettings = useTimeframeStore((state) => state.global.settings);
	const updateGlobalSettings = useTimeframeStore(
		(state) => state.updateGlobalSettings,
	);
	const togglePriceLines = useTimeframeStore((state) => state.togglePriceLines);
	const startGlobalDrag = useTimeframeStore((state) => state.startGlobalDrag);
	const endGlobalDrag = useTimeframeStore((state) => state.endGlobalDrag);

	const handleTimeframeChange = useCallback(
		(property: string, value: number | boolean) => {
			if (property === "showPriceLines") {
				togglePriceLines();
			} else {
				updateGlobalSettings({ [property]: value });
			}
		},
		[updateGlobalSettings, togglePriceLines],
	);

	return (
		<div className="no-select flex h-full flex-col">
			<div className="flex-1 overflow-y-visible">
				<div className="flex flex-col gap-2">
					{/* Chart Style Section */}
					<div className="flex flex-col gap-2">
						{VISUALIZER_TABS.chartStyle.content({
							showChartStyle,
							onToggle: () => setShowChartStyle(!showChartStyle),
						})}
					</div>

					{/* Timeframe Section */}
					<div className="flex flex-col gap-2">
						{VISUALIZER_TABS.timeframe.content({
							showTimeframe,
							onToggle: () => setShowTimeframe(!showTimeframe),
							globalSettings,
							handleTimeframeChange,
							startGlobalDrag,
							endGlobalDrag,
						})}
					</div>

					{/* Price Lines Section */}
					<div className="flex flex-col gap-2">
						{VISUALIZER_TABS.priceLines.content({
							showPriceLines,
							onToggle: () => setShowPriceLines(!showPriceLines),
							globalSettings,
							handleTimeframeChange,
						})}
					</div>
				</div>
			</div>
		</div>
	);
};
