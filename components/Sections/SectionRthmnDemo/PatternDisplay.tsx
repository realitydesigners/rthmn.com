"use client";

import { NestedBoxes } from "@/components/Charts/NestedBoxes";
import {
	BASE_VALUES,
	createDemoStep,
	createMockBoxData,
	sequences,
} from "@/components/Constants/constants";
import type { CandleData } from "@/types/types";
import { formatPrice } from "@/utils/instruments";
import { motion } from "framer-motion";
import { memo, useEffect, useMemo, useRef, useState } from "react";

interface MarketData {
	pair: string;
	lastUpdated: string;
	candleData: string;
}

const BoxVisualization = memo(
	({ pair, candleData }: { pair: string; candleData: string }) => {
		const [baseSize, setBaseSize] = useState(150);
		const [demoStep, setDemoStep] = useState(() => {
			// Create a different starting point for each pair based on its name
			const startingOffset = pair.split("").reduce((acc, char) => {
				return char.charCodeAt(0) + ((acc << 5) - acc);
			}, 0);
			return Math.abs(startingOffset) % sequences.length;
		});

		// Generate a random base interval for this pair (between 500ms and 1500ms)
		const baseInterval = useMemo(() => {
			const pairHash = pair.split("").reduce((acc, char) => {
				return char.charCodeAt(0) + ((acc << 5) - acc);
			}, 0);
			return 500 + (Math.abs(pairHash) % 1000);
		}, [pair]);

		const totalStepsRef = useRef(sequences.length);
		const nextIntervalRef = useRef<number>(baseInterval);

		// Get the latest price from candle data
		const latestPrice = useMemo(() => {
			try {
				const data = JSON.parse(candleData) as CandleData[];
				return Number.parseFloat(data[data.length - 1].mid.c);
			} catch (e) {
				return null;
			}
		}, [candleData]);

		// Memoize current slice calculation
		const currentSlice = useMemo(() => {
			const currentValues = createDemoStep(demoStep, sequences, BASE_VALUES);
			const mockBoxData = createMockBoxData(currentValues);
			return {
				timestamp: new Date().toISOString(),
				boxes: mockBoxData,
			};
		}, [demoStep]);

		useEffect(() => {
			const handleResize = () => {
				setBaseSize(window.innerWidth >= 1024 ? 225 : 160);
			};

			handleResize();
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, []);

		useEffect(() => {
			const updateStep = () => {
				setDemoStep((prev) => (prev + 1) % totalStepsRef.current);
				// Generate next random interval (±30% of base interval)
				const variation = baseInterval * 0.3;
				nextIntervalRef.current =
					baseInterval + Math.random() * variation * 2 - variation;

				// Schedule next update
				timeoutRef.current = setTimeout(updateStep, nextIntervalRef.current);
			};

			const timeoutRef = {
				current: setTimeout(updateStep, nextIntervalRef.current),
			};

			return () => {
				clearTimeout(timeoutRef.current);
			};
		}, [baseInterval]);

		return (
			<div className="no-select group relative flex w-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#333]/30 via-[#222]/25 to-[#111]/30 p-[1px]">
				<div className="relative flex h-full flex-col rounded-lg border border-[#111] bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a]">
					<div className="relative flex flex-col items-center justify-center gap-2 p-3">
						{/* Price Display */}
						<div className="flex w-full flex-col items-center gap-2">
							<div className="flex w-full items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="font-outfit text-sm font-bold tracking-wider lg:text-lg">
										{pair.replace("_", "/")}
									</div>
									<div className="font-kodemono text-xs font-medium text-neutral-200 lg:text-sm">
										{latestPrice ? formatPrice(latestPrice, pair) : "-"}
									</div>
								</div>
							</div>
						</div>

						{/* Box Visualization */}
						<div
							className="relative flex items-center justify-center"
							style={{ height: `${baseSize}px`, width: `${baseSize}px` }}
						>
							{currentSlice && currentSlice.boxes.length > 0 && (
								<div className="absolute inset-0 flex items-center justify-center">
									<div
										className="relative"
										style={{ width: baseSize, height: baseSize }}
									>
										<NestedBoxes
											boxes={currentSlice.boxes.sort(
												(a, b) => Math.abs(b.value) - Math.abs(a.value),
											)}
											demoStep={demoStep}
											isPaused={false}
											baseSize={baseSize}
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	},
);

BoxVisualization.displayName = "BoxVisualization";

export const PatternDisplay = memo(
	({ marketData }: { marketData: MarketData[] }) => {
		return (
			<div className="h-full">
				<div className="grid h-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
					{marketData.map((item) => (
						<BoxVisualization
							key={item.pair}
							pair={item.pair}
							candleData={item.candleData}
						/>
					))}
				</div>
			</div>
		);
	},
);

PatternDisplay.displayName = "PatternDisplay";
