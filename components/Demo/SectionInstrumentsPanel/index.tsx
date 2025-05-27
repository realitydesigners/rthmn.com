"use client";

import {
	motion,
	useScroll,
	useTransform,
	Reorder,
	useDragControls,
} from "framer-motion";
import { memo, useRef, useState, useMemo, useCallback, useEffect } from "react";
import { FaSearch, FaTimes, FaStar } from "react-icons/fa";
import { cn } from "@/utils/cn";
import {
	INSTRUMENTS,
	FOREX_PAIRS,
	CRYPTO_PAIRS,
	EQUITY_PAIRS,
	ETF_PAIRS,
	formatPrice,
} from "@/utils/instruments";

// Generate realistic mock prices for demo
const generateMockPrice = (pair: string): { price: number; change: number } => {
	const basePrice = (() => {
		if (pair.includes("JPY")) return 100 + Math.random() * 50;
		if (pair.includes("USD") && pair.startsWith("USD"))
			return 0.5 + Math.random() * 1.5;
		if (pair.startsWith("BTC")) return 40000 + Math.random() * 10000;
		if (pair.startsWith("ETH")) return 2000 + Math.random() * 1000;
		if (pair.includes("USD") && !pair.startsWith("USD"))
			return 0.5 + Math.random() * 1.5;
		if (CRYPTO_PAIRS.includes(pair)) return Math.random() * 100;
		if (EQUITY_PAIRS.includes(pair)) return 50 + Math.random() * 200;
		if (ETF_PAIRS.includes(pair)) return 100 + Math.random() * 300;
		return 1 + Math.random();
	})();

	const changePercent = (Math.random() - 0.5) * 0.1; // ±5% change
	const change = basePrice * changePercent;

	return { price: basePrice, change };
};

// Create mock data for all instruments
const createMockData = () => {
	const allPairs = [
		...FOREX_PAIRS,
		...CRYPTO_PAIRS,
		...EQUITY_PAIRS,
		...ETF_PAIRS,
	];
	const mockData: Record<string, { price: number; change: number }> = {};

	for (const pair of allPairs) {
		mockData[pair] = generateMockPrice(pair);
	}

	return mockData;
};

const MOCK_PRICE_DATA = createMockData();
const MOCK_SELECTED_PAIRS = ["EURUSD", "BTCUSD", "GBPUSD", "AAPL", "SPY"];

// Draggable instrument item for selected pairs
const DraggableInstrumentItem = memo(
	({
		pair,
		onToggle,
	}: {
		pair: string;
		onToggle: () => void;
	}) => {
		const dragControls = useDragControls();
		const mockData = MOCK_PRICE_DATA[pair];
		const isPositive = mockData?.change > 0;

		return (
			<Reorder.Item
				value={pair}
				id={pair}
				dragListener={false}
				dragControls={dragControls}
				className="group/drag mb-1"
				whileDrag={{ zIndex: 50 }}
			>
				<motion.div
					className="relative flex w-full items-center rounded-lg"
					layout="position"
					transition={{ duration: 0.15 }}
					whileDrag={{ zIndex: 50 }}
				>
					<div className="w-full">
						{/* Drag Handle */}
						<motion.button
							type="button"
							className="absolute top-1/2 left-0 z-[100] -translate-y-1/2 cursor-grab active:cursor-grabbing"
							onPointerDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
								dragControls.start(e);
							}}
						>
							<div className="flex h-8 w-8 items-center justify-center opacity-0 transition-all duration-200 group-hover/drag:opacity-60">
								<svg
									width="14"
									height="14"
									viewBox="0 0 16 16"
									fill="none"
									role="img"
									aria-label="Drag handle"
								>
									<title>Drag handle</title>
									<path d="M7 3H5V5H7V3Z" fill="#666" />
									<path d="M7 7H5V9H7V7Z" fill="#666" />
									<path d="M7 11H5V13H7V11Z" fill="#666" />
									<path d="M11 3H9V5H11V3Z" fill="#666" />
									<path d="M11 7H9V9H11V7Z" fill="#666" />
									<path d="M11 11H9V13H11V11Z" fill="#666" />
								</svg>
							</div>
						</motion.button>

						{/* Item Content */}
						<div
							className={cn(
								"group/item relative flex h-12 w-full items-center rounded-lg transition-all duration-300 select-none",
								"border border-[#111215] bg-gradient-to-b from-[#131518] to-[#0E0F11]",
								"shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
								"hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
								"hover:border-[#1C1E23]",
							)}
						>
							<div className="relative flex w-full items-center px-4">
								{/* Instrument name */}
								<span className="ml-4 font-outfit flex-1 text-sm font-bold tracking-wide text-white transition-colors">
									{pair}
								</span>

								{/* Price */}
								<div className="flex items-center gap-3">
									<span className="font-mono w-[80px] text-right text-sm tracking-wider text-[#545963] transition-colors">
										{mockData ? formatPrice(mockData.price, pair) : "N/A"}
									</span>

									{/* Change indicator */}
									<div
										className={cn(
											"w-[60px] text-right text-xs font-medium",
											isPositive ? "text-[#24FF66]" : "text-red-400",
										)}
									>
										{mockData
											? `${isPositive ? "+" : ""}${formatPrice(Math.abs(mockData.change), pair)}`
											: "N/A"}
									</div>

									{/* Toggle button */}
									<div className="ml-2 flex w-6 justify-center">
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onToggle();
											}}
											className={cn(
												"relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
												"opacity-0 group-hover/item:opacity-100",
												"border-[#111215] bg-[#111215] text-white/40 hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
											)}
										>
											<FaTimes size={8} />
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</Reorder.Item>
		);
	},
);

DraggableInstrumentItem.displayName = "DraggableInstrumentItem";

// Regular instrument item component
const MockInstrumentItem = memo(
	({
		pair,
		isSelected = false,
		onToggle,
	}: {
		pair: string;
		isSelected?: boolean;
		onToggle: () => void;
	}) => {
		const mockData = MOCK_PRICE_DATA[pair];
		const isPositive = mockData?.change > 0;

		return (
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				className={cn(
					"group/item relative flex h-12 w-full items-center rounded-lg transition-all duration-300 select-none cursor-pointer",
					isSelected
						? "border border-[#111215] bg-gradient-to-b from-[#131518] to-[#0E0F11] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]"
						: "hover:bg-[#111215]/50",
				)}
				onClick={onToggle}
			>
				<div className="relative flex w-full items-center px-4">
					{/* Instrument name */}
					<span
						className={cn(
							"font-outfit flex-1 text-sm font-bold tracking-wide transition-colors",
							isSelected
								? "text-white"
								: "text-[#32353C] group-hover/item:text-[#545963]",
						)}
					>
						{pair}
					</span>

					{/* Price */}
					<div className="flex items-center gap-3">
						<span
							className={cn(
								"font-mono w-[80px] text-right text-sm tracking-wider transition-colors",
								isSelected ? "text-[#545963]" : "text-[#32353C]",
							)}
						>
							{mockData ? formatPrice(mockData.price, pair) : "N/A"}
						</span>

						{/* Change indicator */}
						<div
							className={cn(
								"w-[60px] text-right text-xs font-medium",
								isPositive ? "text-[#24FF66]" : "text-red-400",
							)}
						>
							{mockData
								? `${isPositive ? "+" : ""}${formatPrice(Math.abs(mockData.change), pair)}`
								: "N/A"}
						</div>

						{/* Toggle button */}
						<div className="ml-2 flex w-6 justify-center">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onToggle();
								}}
								className={cn(
									"relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
									"opacity-0 group-hover/item:opacity-100",
									"border-[#111215] bg-[#111215] text-white/40 hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
								)}
							>
								{isSelected ? (
									<FaTimes size={8} />
								) : (
									<span className="text-[9px] font-medium">+</span>
								)}
							</button>
						</div>
					</div>
				</div>
			</motion.div>
		);
	},
);

MockInstrumentItem.displayName = "MockInstrumentItem";

// Mock search bar component
const MockSearchBar = memo(
	({
		searchQuery,
		setSearchQuery,
	}: {
		searchQuery: string;
		setSearchQuery: (query: string) => void;
	}) => {
		const [isFocused, setIsFocused] = useState(false);

		return (
			<div className="relative">
				<div
					className={cn(
						"group/search relative flex h-12 items-center overflow-hidden rounded-lg transition-all duration-300",
						isFocused ? "ring-1 ring-[#1C1E23]" : "",
					)}
				>
					<div className="absolute inset-0 rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] transition-all duration-300" />

					{/* Search Icon */}
					<div
						className={cn(
							"relative ml-4 transition-colors duration-300",
							isFocused ? "text-[#545963]" : "text-[#32353C]",
						)}
					>
						<FaSearch size={14} />
					</div>

					{/* Input */}
					<input
						type="text"
						placeholder="Search instruments..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						className="font-outfit relative h-full flex-1 bg-transparent px-4 text-sm font-medium text-[#545963] placeholder-[#32353C] transition-colors outline-none"
					/>

					{/* Clear Button */}
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="relative mr-4 flex h-6 w-6 items-center justify-center rounded-md border border-[#111215] bg-[#111215] text-white/40 transition-all hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
						>
							<FaTimes size={8} />
						</button>
					)}
				</div>
			</div>
		);
	},
);

MockSearchBar.displayName = "MockSearchBar";

// Filter button component
const FilterButton = memo(
	({
		isActive,
		label,
		icon,
		onClick,
	}: {
		isActive: boolean;
		label: string;
		icon?: React.ReactNode;
		onClick?: () => void;
	}) => {
		return (
			<button
				type="button"
				onClick={onClick}
				className={cn(
					"group relative flex h-8 items-center justify-center px-3 transition-all duration-300 ease-in-out rounded-lg",
					isActive &&
						"border border-[#111215] bg-gradient-to-b from-[#131518] to-[#0E0F11] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
				)}
			>
				{!isActive && (
					<div className="absolute inset-0 rounded-lg bg-[#111215] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				)}

				<span
					className={cn(
						"relative z-10 font-outfit text-xs font-medium tracking-wide whitespace-nowrap flex items-center gap-2",
						"transition-colors duration-300 ease-in-out",
						isActive
							? "text-white"
							: "text-[#32353C] group-hover:text-[#545963]",
					)}
				>
					{icon}
					{label}
				</span>
			</button>
		);
	},
);

FilterButton.displayName = "FilterButton";

// Main mock instruments panel
const MockInstrumentsPanel = memo(() => {
	const [activeFilter, setActiveFilter] = useState("selected");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPairs, setSelectedPairs] = useState(MOCK_SELECTED_PAIRS);

	// Filter instruments based on search and category
	const filteredInstruments = useMemo(() => {
		let instruments: string[] = [];

		switch (activeFilter) {
			case "selected":
				instruments = selectedPairs;
				break;
			case "fx":
				instruments = FOREX_PAIRS;
				break;
			case "crypto":
				instruments = CRYPTO_PAIRS;
				break;
			case "stocks":
				instruments = EQUITY_PAIRS;
				break;
			case "etf":
				instruments = ETF_PAIRS;
				break;
		}

		if (searchQuery) {
			instruments = instruments.filter((pair) =>
				pair.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		return instruments.slice(0, 20); // Limit to 20 items for demo
	}, [activeFilter, searchQuery, selectedPairs]);

	const togglePairSelection = useCallback((pair: string) => {
		setSelectedPairs((prev) => {
			if (prev.includes(pair)) {
				return prev.filter((p) => p !== pair);
			}
			return [...prev, pair];
		});
	}, []);

	return (
		<div className="w-full max-w-sm bg-gradient-to-b from-[#0A0B0D] to-[#070809] border border-[#1C1E23]/60 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
			{/* Header */}
			<div className="p-6 border-b border-[#111215]">
				<h3 className="font-russo text-lg font-bold text-white uppercase tracking-tight mb-4">
					Instruments
				</h3>

				{/* Search Bar */}
				<MockSearchBar
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
				/>

				{/* Filter Buttons */}
				<div className="flex gap-2 mt-4 overflow-x-auto">
					<FilterButton
						isActive={activeFilter === "selected"}
						label="Selected"
						icon={<FaStar size={10} />}
						onClick={() => setActiveFilter("selected")}
					/>
					<FilterButton
						isActive={activeFilter === "fx"}
						label="FX"
						onClick={() => setActiveFilter("fx")}
					/>
					<FilterButton
						isActive={activeFilter === "crypto"}
						label="Crypto"
						onClick={() => setActiveFilter("crypto")}
					/>
					<FilterButton
						isActive={activeFilter === "stocks"}
						label="Stocks"
						onClick={() => setActiveFilter("stocks")}
					/>
					<FilterButton
						isActive={activeFilter === "etf"}
						label="ETF"
						onClick={() => setActiveFilter("etf")}
					/>
				</div>
			</div>

			{/* Content */}
			<div className="p-4 space-y-6 max-h-96 overflow-y-auto">
				{/* Selected Pairs with Drag & Drop */}
				{activeFilter === "selected" && (
					<div className="space-y-2">
						<div className="flex items-center gap-2 mb-3">
							<FaStar size={10} className="text-[#24FF66]" />
							<span className="font-outfit text-xs font-medium text-[#545963] uppercase tracking-wider">
								Selected Pairs ({selectedPairs.length})
							</span>
						</div>
						<Reorder.Group
							axis="y"
							values={selectedPairs}
							onReorder={setSelectedPairs}
							className="space-y-1"
						>
							{selectedPairs.map((pair) => (
								<DraggableInstrumentItem
									key={pair}
									pair={pair}
									onToggle={() => togglePairSelection(pair)}
								/>
							))}
						</Reorder.Group>
					</div>
				)}

				{/* Other Categories */}
				{activeFilter !== "selected" && (
					<div className="space-y-2">
						<span className="font-outfit text-xs font-medium text-[#545963] uppercase tracking-wider block mb-3">
							{activeFilter === "fx" && "Foreign Exchange"}
							{activeFilter === "crypto" && "Cryptocurrency"}
							{activeFilter === "stocks" && "Stocks"}
							{activeFilter === "etf" && "ETFs"}
							{searchQuery && ` (${filteredInstruments.length} results)`}
						</span>
						{filteredInstruments.map((pair, index) => (
							<motion.div
								key={pair}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<MockInstrumentItem
									pair={pair}
									isSelected={selectedPairs.includes(pair)}
									onToggle={() => togglePairSelection(pair)}
								/>
							</motion.div>
						))}
						{filteredInstruments.length === 0 && searchQuery && (
							<div className="text-center py-8">
								<span className="font-outfit text-sm text-[#32353C]">
									No instruments found for "{searchQuery}"
								</span>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
});

MockInstrumentsPanel.displayName = "MockInstrumentsPanel";

export const SectionInstrumentsPanel = memo(() => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
	const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

	return (
		<section
			ref={containerRef}
			className="relative min-h-screen w-full bg-gradient-to-b from-[#050506] via-[#0A0B0D] to-black py-24"
		>
			<div className="container mx-auto px-6">
				<div className="max-w-7xl mx-auto">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						{/* Left side - Content */}
						<motion.div style={{ y, opacity }} className="space-y-8">
							{/* Header */}
							<div className="space-y-6">
								<motion.h2
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8 }}
									className="font-russo text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tighter leading-[0.85] uppercase"
								>
									PRECISION
									<span className="block text-[#24FF66] mt-2">
										INSTRUMENT CONTROL
									</span>
								</motion.h2>

								<motion.p
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.2 }}
									className="font-outfit text-lg lg:text-xl text-white/70 leading-relaxed max-w-2xl"
								>
									Navigate through hundreds of financial instruments with
									lightning-fast search, intelligent filtering, and
									drag-and-drop organization. Your trading universe, perfectly
									organized.
								</motion.p>
							</div>

							{/* Features */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.4 }}
								className="grid gap-6"
							>
								{[
									{
										title: "Instant Search",
										description:
											"Find any instrument in milliseconds with intelligent autocomplete and fuzzy matching.",
										category: "SPEED",
									},
									{
										title: "Smart Filtering",
										description:
											"Organize by asset class, favorites, or custom categories with one-click filtering.",
										category: "ORGANIZATION",
									},
									{
										title: "Drag & Drop",
										description:
											"Reorder your watchlist with intuitive drag-and-drop controls for optimal workflow.",
										category: "CONTROL",
									},
								].map((feature, index) => (
									<motion.div
										key={feature.title}
										initial={{ opacity: 0, x: -30 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
										className="group relative p-6 rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm hover:border-[#24FF66]/30 transition-all duration-300"
									>
										{/* Category badge */}
										<div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 mb-3">
											<span className="font-outfit text-xs font-semibold text-[#24FF66] uppercase tracking-wider">
												{feature.category}
											</span>
										</div>

										<h3 className="font-russo text-lg font-bold text-white group-hover:text-[#24FF66] transition-colors duration-300 uppercase tracking-tight mb-2">
											{feature.title}
										</h3>

										<p className="font-outfit text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
											{feature.description}
										</p>

										{/* Hover accent */}
										<div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#24FF66] to-transparent group-hover:w-full transition-all duration-500" />
									</motion.div>
								))}
							</motion.div>

							{/* Stats */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.8 }}
								className="grid grid-cols-3 gap-6 pt-8"
							>
								{[
									{ value: "500+", label: "Instruments" },
									{ value: "< 50ms", label: "Search Speed" },
									{ value: "100%", label: "Customizable" },
								].map((stat, index) => (
									<div key={stat.label} className="text-center">
										<div className="font-russo text-2xl lg:text-3xl font-black text-[#24FF66] tracking-tighter">
											{stat.value}
										</div>
										<div className="font-outfit text-sm text-white/60 uppercase tracking-wider">
											{stat.label}
										</div>
									</div>
								))}
							</motion.div>
						</motion.div>

						{/* Right side - Mock Panel */}
						<motion.div
							style={{ y: useTransform(scrollYProgress, [0, 1], [50, -50]) }}
							initial={{ opacity: 0, scale: 0.9 }}
							whileInView={{ opacity: 1, scale: 1 }}
							transition={{ duration: 1, delay: 0.3 }}
							className="flex justify-center lg:justify-end"
						>
							<MockInstrumentsPanel />
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
});

SectionInstrumentsPanel.displayName = "SectionInstrumentsPanel";
