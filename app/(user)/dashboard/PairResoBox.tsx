"use client";

import { ResoBox } from "@/components/Charts/ResoBox";
import { ResoBox3D } from "@/components/Charts/ResoBox/ResoBox3D";
import { TimeFrameSlider } from "@/components/Panels/PanelComponents/TimeFrameSlider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import type { BoxColors } from "@/stores/colorStore";
import { useTimeframeStore } from "@/stores/timeframeStore";
import type { BoxSlice } from "@/types/types";
import { formatPrice } from "@/utils/instruments";
import React, { useCallback, useMemo } from "react";

interface PairResoBoxProps {
	pair?: string;
	boxSlice?: BoxSlice;
	boxColors?: BoxColors;
	isLoading?: boolean;
}

// Simple inline skeleton components
const TextSkeleton = ({ className }: { className?: string }) => (
	<div className={`animate-pulse rounded bg-[#0F1012] ${className}`} />
);

const ChartSkeleton = () => (
	<div className="aspect-square h-full w-full animate-pulse rounded bg-[#0F1012]" />
);

export const PairResoBox = ({
	pair,
	boxSlice,
	boxColors,
	isLoading,
}: PairResoBoxProps) => {
	const { priceData } = useWebSocket();
	const settings = useTimeframeStore(
		useCallback(
			(state) =>
				pair ? state.getSettingsForPair(pair) : state.global.settings,
			[pair],
		),
	);


	console.log("boxSlice", boxSlice);

	const currentPrice = pair ? priceData[pair]?.price : null;

	// Memoize the filtered boxes based on timeframe settings
	const filteredBoxSlice = useMemo(() => {
		if (!boxSlice?.boxes) return undefined;
		return {
			...boxSlice,
			boxes:
				boxSlice.boxes.slice(
					settings.startIndex,
					settings.startIndex + settings.maxBoxCount,
				) || [],
		};
	}, [boxSlice, settings.startIndex, settings.maxBoxCount]);

	const showChart = !isLoading && filteredBoxSlice;

	return (
		<div className="no-select group relative flex w-full flex-col overflow-hidden bg-[#0A0B0D]">
			<div className="relative flex min-h-[250px] flex-col border-[0.5px] border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#040505]">
				<div className="relative flex flex-grow flex-col items-center justify-start gap-2 p-3 sm:gap-3 sm:p-4 lg:gap-4 lg:p-6">
					{/* Header section with enhanced depth */}
					<div className="flex w-full flex-col items-center gap-2">
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="font-outfit text-lg font-bold tracking-wider text-white/90 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
									{pair?.toUpperCase()}
								</div>
								{isLoading || !currentPrice ? (
									<TextSkeleton className="h-4 w-16" />
								) : (
									<div className="font-dmmono  text-sm font-medium text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
										{formatPrice(currentPrice, pair)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Chart Section with enhanced container */}
					<div
						className={`relative flex h-full min-h-[100px] w-full flex-grow  ${
							boxColors?.styles?.viewMode !== "3d" && settings.showPriceLines
								? "pr-12"
								: "p-0"
						}`}
					>
						<div className="absolute inset-0 " />
						{showChart ? (
							boxColors?.styles?.viewMode === "3d" ? (
								<div className="relative h-full w-full aspect-square">
									<div className="absolute inset-0" />
									<ResoBox3D
										slice={filteredBoxSlice}
										pair={pair}
										boxColors={boxColors}
									/>
								</div>
							) : (
								<div className="relative h-full w-full aspect-square">
									<div className="absolute inset-0" />
									<ResoBox
										slice={filteredBoxSlice}
										className="h-full w-full"
										boxColors={boxColors}
										pair={pair}
										showPriceLines={settings.showPriceLines}
									/>
								</div>
							)
						) : (
							<ChartSkeleton />
						)}
					</div>

					{/* Timeframe Control with enhanced separator */}
					<div className="relative h-20 w-full flex-shrink-0">
						<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1C1E23] to-transparent" />
						<TimeFrameSlider showPanel={false} pair={pair} />
					</div>
				</div>
			</div>
		</div>
	);
};
