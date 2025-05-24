"use client";

import { useSignals } from "@/providers/SignalProvider/client";
import type React from "react";

export const SignalDisplay: React.FC = () => {
	const { latestSignals, isScanning, patterns, enableScanning, clearPatterns } =
		useSignals();

	return (
		<div className="bg-black border border-gray-800 rounded p-4">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-white text-lg">Trading Signals</h2>
				<div className="flex gap-2">
					<button
						onClick={() => enableScanning(!isScanning)}
						className={`px-3 py-1 rounded text-sm ${
							isScanning
								? "bg-gray-800 text-white hover:bg-gray-700"
								: "bg-white text-black hover:bg-gray-200"
						}`}
					>
						{isScanning ? "Stop" : "Start"}
					</button>
					<button
						onClick={clearPatterns}
						className="px-3 py-1 rounded text-sm bg-gray-800 text-white hover:bg-gray-700"
					>
						Clear
					</button>
				</div>
			</div>

			{/* Status */}
			<div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
				<span>{isScanning ? "● Active" : "○ Stopped"}</span>
				<span>{patterns.length} patterns</span>
			</div>

			{/* Signals */}
			<div className="space-y-3">
				{latestSignals.length === 0 ? (
					<p className="text-gray-500 text-center py-8">No signals detected</p>
				) : (
					<div className="space-y-2 max-h-80 overflow-y-auto">
						{latestSignals.map((signal) => {
							// Create a Set of matched pattern values for quick lookup
							const matchedPatternValues = new Set(signal.pattern);

							return (
								<div
									key={signal.id}
									className="border border-gray-800 rounded p-3"
								>
									{/* Header */}
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-3">
											<span className="text-white font-medium">
												{signal.currencyPair}
											</span>
											<span className="text-gray-400 text-sm">
												${signal.currentPrice.toFixed(5)}
											</span>
										</div>
										<span className="text-gray-500 text-xs">
											{new Date(signal.timestamp).toLocaleTimeString()}
										</span>
									</div>

									{/* Main Reversal Pattern */}
									<div className="mb-3">
										<span className="text-gray-400 text-xs">
											Reversal Pattern:{" "}
										</span>
										<span className="text-white text-sm font-mono font-bold">
											{signal.pattern.map((value, index) => (
												<span
													key={index}
													className={
														value < 0 ? "text-white" : "text-white font-bold"
													}
												>
													{value}
													{index < signal.pattern.length - 1 ? " → " : ""}
												</span>
											))}
										</span>
									</div>

									{/* Full Box Values */}
									<div>
										<div className="text-gray-400 text-xs mb-2">
											All Box Values:
										</div>
										<div className="bg-gray-900 border border-gray-800 rounded p-3 max-h-32 overflow-y-auto">
											<span className="text-xs font-mono leading-relaxed">
												{signal.matchedData.boxes
													.map((b) => b.value)
													.sort((a, b) => Math.abs(b) - Math.abs(a))
													.map((value, index) => {
														const isMatched = matchedPatternValues.has(value);
														return (
															<span
																key={index}
																className={
																	isMatched
																		? "text-green-400 font-bold"
																		: value < 0
																			? "text-white"
																			: "text-white font-bold"
																}
															>
																{value}
																{index < signal.matchedData.boxes.length - 1
																	? ", "
																	: ""}
															</span>
														);
													})}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};
