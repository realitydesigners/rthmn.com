import type { ExtendedBoxSlice } from "@/app/(user)/pair/[pair]/client";
import type { Box } from "@/types/types";
import type React from "react";

interface BoxValuesDebugProps {
	resoBoxes?: Box[];
	histogramData?: ExtendedBoxSlice[];
	startIndex: number;
	maxBoxCount: number;
}

export const BoxValuesDebug: React.FC<BoxValuesDebugProps> = ({
	resoBoxes,
	histogramData,
	startIndex,
	maxBoxCount,
}) => {
	const latestHistogramSlice = histogramData?.[histogramData.length - 1];
	const visibleHistogramBoxes = latestHistogramSlice?.progressiveValues.slice(
		startIndex,
		startIndex + maxBoxCount,
	);
	const visibleResoBoxes = resoBoxes?.slice(
		startIndex,
		startIndex + maxBoxCount,
	);

	// Format timestamp to be more readable
	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString();
	};

	return (
		<div className="h-full overflow-auto rounded-lg bg-black/50 p-4 font-mono text-xs">
			{/* Settings Info */}
			<div className="mb-4 flex justify-between rounded border border-neutral-800 bg-black/40 p-2 text-neutral-400">
				<div className="space-y-1">
					<div>Start Index: {startIndex}</div>
					<div>Max Box Count: {maxBoxCount}</div>
				</div>
				<div className="space-y-1 text-right">
					<div>Reso Box Count: {visibleResoBoxes?.length || 0}</div>
					<div>Histogram Box Count: {visibleHistogramBoxes?.length || 0}</div>
				</div>
			</div>

			{/* Timestamps */}
			<div className="mb-4 grid grid-cols-2 gap-4 rounded border border-neutral-800 bg-black/40 p-2 text-neutral-400">
				<div>
					<span className="text-emerald-500">ResoBox Last Update: </span>
					<span>
						{latestHistogramSlice?.timestamp
							? formatTimestamp(latestHistogramSlice.timestamp)
							: "N/A"}
					</span>
				</div>
				<div className="text-right">
					<span className="text-blue-500">Histogram Last Update: </span>
					<span>
						{latestHistogramSlice?.timestamp
							? formatTimestamp(latestHistogramSlice.timestamp)
							: "N/A"}
					</span>
				</div>
			</div>

			{/* ResoBox Values */}
			<div className="mb-4">
				<h3 className="mb-2 font-bold text-emerald-500">ResoBox Values</h3>
				<div className="rounded border border-emerald-900/50 bg-emerald-900/10 p-2">
					<div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-emerald-900/30 pb-1 text-emerald-400">
						<span>Value</span>
						<span>High</span>
						<span>Low</span>
					</div>
					<div className="mt-1 space-y-1">
						{visibleResoBoxes?.map((box, i) => (
							<div
								key={i}
								className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-right"
							>
								<span
									className={
										box.value >= 0 ? "text-emerald-400" : "text-red-400"
									}
								>
									{box.value}
								</span>
								<span className="text-neutral-300">{box.high}</span>
								<span className="text-neutral-300">{box.low}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Histogram Values */}
			<div>
				<h3 className="mb-2 font-bold text-blue-500">Histogram Values</h3>
				<div className="rounded border border-blue-900/50 bg-blue-900/10 p-2">
					<div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-blue-900/30 pb-1 text-blue-400">
						<span>Value</span>
						<span>High</span>
						<span>Low</span>
					</div>
					<div className="mt-1 space-y-1">
						{visibleHistogramBoxes?.map((box, i) => (
							<div
								key={i}
								className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-right"
							>
								<span
									className={
										box.value >= 0 ? "text-emerald-400" : "text-red-400"
									}
								>
									{box.value}
								</span>
								<span className="text-neutral-300">{box.high}</span>
								<span className="text-neutral-300">{box.low}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
