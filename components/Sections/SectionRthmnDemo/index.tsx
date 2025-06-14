"use client";

import { ConnectionBadge } from "@/components/Badges/ConnectionBadge";
import { LogoIcon } from "@/components/Icons/icons";
import type { CandleData } from "@/types/types";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaChartArea, FaCube, FaTable } from "react-icons/fa";
import { LineChart } from "./LineChart";
import { MarketDisplay } from "./MarketDisplay";
import { MarketNavigator } from "./MarketNavigator";
import { PairSlider } from "./PairSlider";
import { PatternDisplay } from "./PatternDisplay";

interface MarketData {
	pair: string;
	lastUpdated: string;
	candleData: string;
}

type TabType = "chart" | "grid" | "boxes" | "navigation";

const MarketCard = memo(
	({
		item,
		isSelected,
		onClick,
	}: { item: MarketData; isSelected: boolean; onClick: () => void }) => {
		const getLatestPrice = (candleData: string) => {
			try {
				const data = JSON.parse(candleData) as CandleData[];
				return Number.parseFloat(data[data.length - 1].mid.c);
			} catch (e) {
				return null;
			}
		};

		const getPriceChange = (candleData: string) => {
			try {
				const data = JSON.parse(candleData) as CandleData[];
				const firstPrice = Number.parseFloat(data[0].mid.o);
				const lastPrice = Number.parseFloat(data[data.length - 1].mid.c);
				const change = ((lastPrice - firstPrice) / firstPrice) * 100;
				return change;
			} catch (e) {
				return null;
			}
		};

		const latestPrice = getLatestPrice(item.candleData);
		const priceChange = getPriceChange(item.candleData);

		return (
			<motion.div
				whileHover={{ scale: 1.01 }}
				whileTap={{ scale: 0.99 }}
				onClick={onClick}
				className={`group relative flex h-[40px] cursor-pointer items-center justify-between rounded-md border px-3 backdrop-blur-sm transition-all duration-200 ${
					isSelected
						? "border-[#22c55e]/50 bg-[#22c55e]/10"
						: "border-[#1C1E23] bg-black/40 hover:border-[#1C1E23] hover:bg-black/60"
				}`}
			>
				{isSelected && (
					<div className="absolute top-0 left-0 h-full w-[3px] rounded-l-md bg-[#22c55e]" />
				)}
				<div className="flex w-full items-center justify-between">
					<span className="text-xs font-medium text-white/90">
						{item.pair.replace("_", "/")}
					</span>
					<span className="text-xs font-medium text-white/90">
						{latestPrice
							? latestPrice.toFixed(item.pair.includes("JPY") ? 3 : 5)
							: "N/A"}
					</span>
					<span
						className={`rounded-sm px-1.5 py-0.5 text-[9px] font-semibold ${priceChange >= 0 ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}
					>
						{priceChange ? `${priceChange.toFixed(1)}%` : "N/A"}
					</span>
				</div>
			</motion.div>
		);
	},
);

MarketCard.displayName = "MarketCard";

const DemoNavbar = memo(
	({
		activeTab,
		setActiveTab,
	}: { activeTab: TabType; setActiveTab: (tab: TabType) => void }) => {
		return (
			<nav className="h-16 border-b border-[#121212] bg-[#0a0a0a] p-1 lg:flex lg:h-14">
				<div className="group relative z-[110] h-full w-full">
					<div className="relative flex h-full w-full items-center justify-between rounded-lg px-2">
						{/* Left section */}
						<div className="relative z-[1] flex items-center gap-3">
							<div className="flex items-center">
								<div className="group relative z-[110] flex items-center gap-2 rounded-lg p-1.5">
									<div className="flex h-7 w-7 items-center">
										<LogoIcon />
									</div>
									<span className="font-russo tracking ml-2 hidden text-[16px] text-white lg:block">
										RTHMN
									</span>
								</div>
							</div>
						</div>

						{/* Center section - Navigation Tabs */}
						{/* <div className='absolute left-1/2 flex -translate-x-1/2 transform items-center gap-3'>
                        {[
                            { id: 'boxes', label: 'Boxes', icon: FaCube },
                            { id: 'chart', label: 'Chart', icon: FaChartArea },
                            { id: 'grid', label: 'Grid', icon: FaTable },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex h-auto items-center rounded-full bg-linear-to-b from-[#32353C] to-[#1C1E23] p-[1px] text-white transition-all duration-200 hover:from-[#32353C] hover:to-[#282828]`}>
                                <span
                                    className={`font-russo flex w-full items-center gap-2 rounded-full bg-linear-to-b from-[#0A0A0A] to-[#1C1E23] px-4 py-2 text-xs font-semibold ${
                                        activeTab === tab.id ? 'text-blue-400' : 'text-white hover:text-white'
                                    }`}>
                                    <tab.icon className='h-3 w-3' />
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div> */}

						{/* Right section */}
						<div className="relative z-[110] flex items-center gap-3">
							<div className="relative z-[110] flex items-center gap-2">
								<ConnectionBadge isConnected={true} />
							</div>
						</div>
					</div>
				</div>
			</nav>
		);
	},
);

DemoNavbar.displayName = "DemoNavbar";

export const SectionRthmnDemo = memo(
	({ marketData }: { marketData: MarketData[] }) => {
		const [selectedPair, setSelectedPair] = useState<string>(
			marketData[0]?.pair || "",
		);
		const [activeTab, setActiveTab] = useState<TabType>("boxes");
		const containerRef = useRef<HTMLDivElement>(null);
		const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

		// Process candles for LineChart
		const processCandles = useCallback((candleDataString: string) => {
			try {
				const data = JSON.parse(candleDataString) as CandleData[];
				return data.map((candle) => ({
					time: candle.time,
					open: Number.parseFloat(candle.mid.o),
					high: Number.parseFloat(candle.mid.h),
					low: Number.parseFloat(candle.mid.l),
					close: Number.parseFloat(candle.mid.c),
					volume: candle.volume,
				}));
			} catch (e) {
				return [];
			}
		}, []);

		// 3D mouse effect
		useEffect(() => {
			const handleMouseMove = (e: MouseEvent) => {
				if (!containerRef.current) return;
				const rect = containerRef.current.getBoundingClientRect();
				const x = (e.clientX - rect.left) / rect.width - 0.5;
				const y = (e.clientY - rect.top) / rect.height - 0.5;
				setMousePosition({ x, y });
			};

			const container = containerRef.current;
			container?.addEventListener("mousemove", handleMouseMove);
			return () => container?.removeEventListener("mousemove", handleMouseMove);
		}, []);

		const handlePairSelect = useCallback((pair: string) => {
			setSelectedPair(pair);
		}, []);

		const handleTabChange = useCallback((tab: TabType) => {
			setActiveTab(tab);
		}, []);

		const processedCandles = useMemo(() => {
			const selectedMarketData = marketData.find(
				(item) => item.pair === selectedPair,
			);
			return selectedMarketData
				? processCandles(selectedMarketData.candleData)
				: [];
		}, [marketData, selectedPair, processCandles]);

		const renderActiveTab = useMemo(() => {
			switch (activeTab) {
				case "chart":
					return (
						<div className="flex flex-col gap-4 lg:flex-row">
							{/* Main Chart Area */}
							<div className="relative z-100 flex-1 space-y-3">
								<div className="relative h-[400px] overflow-hidden rounded-lg border border-[#1C1E23] bg-black/20 backdrop-blur-sm lg:h-[500px]">
									<LineChart pair={selectedPair} candles={processedCandles} />
								</div>
							</div>

							{/* Market Cards - Side on desktop, bottom on mobile */}
							<div className="w-full shrink-0 space-y-3 lg:w-[250px]">
								<div className="rounded-lg border border-[#1C1E23] bg-black/20 p-2 backdrop-blur-sm">
									<div className="scrollbar-thin scrollbar-track-[#1C1E23] grid-cols- grid max-h-[200px] gap-1.5 overflow-y-auto pr-1 sm:max-h-[500px]">
										{marketData.map((marketItem) => (
											<MarketCard
												key={marketItem.pair}
												item={marketItem}
												isSelected={selectedPair === marketItem.pair}
												onClick={() => handlePairSelect(marketItem.pair)}
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					);

				case "grid":
					return (
						<div className="overflow-y-auto">
							<MarketDisplay marketData={marketData} />
						</div>
					);

				case "boxes":
					return (
						<div className="overflow-x-auto overflow-y-auto">
							<PatternDisplay marketData={marketData} />
						</div>
					);

				case "navigation":
					return (
						<div className="flex h-full gap-4">
							<div className="w-[300px]">
								<MarketNavigator
									marketData={marketData}
									selectedPair={selectedPair}
									onPairSelect={handlePairSelect}
								/>
							</div>
							<div className="flex-1">
								<PairSlider
									marketData={marketData}
									selectedPair={selectedPair}
									onPairSelect={handlePairSelect}
								/>
							</div>
						</div>
					);

				default:
					return null;
			}
		}, [
			activeTab,
			marketData,
			selectedPair,
			handlePairSelect,
			processedCandles,
		]);

		return (
			<section className="pt-12no relative z-100 -mt-48 flex h-full flex-col items-center justify-center lg:-mt-[12.5vw] lg:py-12">
				<div className="relative h-[820px] w-full overflow-hidden border-[#1C1E23] bg-black/90 p-2 backdrop-blur-md sm:w-[90vw] md:rounded-xl md:border lg:h-auto lg:w-[80vw] 2xl:w-[75vw]">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_30%)]" />
						<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#BFC2CA] to-transparent" />
					</div>
					<DemoNavbar activeTab={activeTab} setActiveTab={handleTabChange} />
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
						className="relative z-10 h-[calc(100%-80px)] [transform:translateZ(20px)] overflow-y-auto pt-2"
					>
						{renderActiveTab}
					</motion.div>
				</div>
			</section>
		);
	},
);

SectionRthmnDemo.displayName = "SectionRthmnDemo";
