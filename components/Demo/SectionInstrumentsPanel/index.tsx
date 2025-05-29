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
								<span className="ml-4 font-russo flex-1 text-sm font-bold tracking-wide text-white transition-colors">
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
							"font-russo flex-1 text-sm font-bold tracking-wide transition-colors",
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
						className="font-russo relative h-full flex-1 bg-transparent px-4 text-sm font-medium text-[#545963] placeholder-[#32353C] transition-colors outline-none"
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
						"relative z-10 font-russo text-xs font-medium tracking-wide whitespace-nowrap flex items-center gap-2",
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
							<span className="font-russo text-xs font-medium text-[#545963] uppercase tracking-wider">
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
						<span className="font-russo text-xs font-medium text-[#545963] uppercase tracking-wider block mb-3">
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
								<span className="font-russo text-sm text-[#32353C]">
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
					<div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-20 items-start">
						{/* Left side - Enhanced Content */}
						<motion.div style={{ y, opacity }} className="space-y-12">
							{/* Header Section */}
							<div className="space-y-8">
								<motion.div
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8 }}
									className="space-y-4"
								>
									{/* Overline */}
									<div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#24FF66]/30 bg-gradient-to-r from-[#24FF66]/10 to-transparent">
										<div className="w-2 h-2 rounded-full bg-[#24FF66] animate-pulse" />
										<span className="font-russo text-sm font-semibold text-[#24FF66] uppercase tracking-wider">
											Advanced Trading Tools
										</span>
									</div>

									<h2 className="font-russo text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.8] uppercase">
										PRECISION
										<span className="block text-[#24FF66] mt-2 relative">
											INSTRUMENT CONTROL
											{/* Animated underline */}
											<motion.div
												initial={{ width: 0 }}
												whileInView={{ width: "100%" }}
												transition={{ duration: 1.2, delay: 0.5 }}
												className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-[#24FF66] via-[#1ECC52] to-transparent"
											/>
										</span>
									</h2>
								</motion.div>

								<motion.div
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.3 }}
									className="space-y-6"
								>
									<p className="font-russo text-xl lg:text-2xl text-white/80 leading-relaxed font-light">
										Navigate through{" "}
										<span className="text-[#24FF66] font-semibold">
											hundreds of financial instruments
										</span>{" "}
										with lightning-fast search, intelligent filtering, and
										drag-and-drop organization.
									</p>

									<p className="font-russo text-lg text-white/60 leading-relaxed max-w-2xl">
										Your trading universe, perfectly organized. From forex pairs
										to cryptocurrencies, stocks to ETFs — find, organize, and
										track everything in one unified interface.
									</p>
								</motion.div>
							</div>

							{/* Key Features Grid */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.5 }}
								className="grid md:grid-cols-2 gap-8"
							>
								{/* Feature 1 - Search */}
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.6, delay: 0.7 }}
									className="group relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-br from-[#0A0B0D] via-[#070809] to-[#050506] p-8 hover:border-[#24FF66]/40 transition-all duration-500"
								>
									{/* Background glow */}
									<div className="absolute inset-0 bg-gradient-to-br from-[#24FF66]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

									{/* Icon */}
									<div className="relative z-10 mb-6">
										<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#24FF66]/20 to-[#24FF66]/5 border border-[#24FF66]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
											<FaSearch className="w-7 h-7 text-[#24FF66]" />
										</div>
									</div>

									<div className="relative z-10 space-y-4">
										<div className="space-y-2">
											<div className="inline-flex items-center px-3 py-1 rounded-full bg-[#24FF66]/10 border border-[#24FF66]/20">
												<span className="font-russo text-xs font-bold text-[#24FF66] uppercase tracking-wider">
													INSTANT
												</span>
											</div>
											<h3 className="font-russo text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#24FF66] transition-colors duration-300">
												Lightning Search
											</h3>
										</div>

										<p className="font-russo text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
											Find any instrument in{" "}
											<span className="text-[#24FF66] font-semibold">
												milliseconds
											</span>{" "}
											with intelligent autocomplete, fuzzy matching, and
											real-time filtering across all asset classes.
										</p>

										{/* Performance indicator */}
										<div className="flex items-center gap-3 pt-2">
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-[#24FF66] animate-pulse" />
												<span className="font-mono text-sm text-[#24FF66] font-bold">
													&lt; 50ms
												</span>
											</div>
											<span className="font-russo text-xs text-white/50">
												Average search time
											</span>
										</div>
									</div>
								</motion.div>

								{/* Feature 2 - Organization */}
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.6, delay: 0.8 }}
									className="group relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-br from-[#0A0B0D] via-[#070809] to-[#050506] p-8 hover:border-[#24FF66]/40 transition-all duration-500"
								>
									{/* Background glow */}
									<div className="absolute inset-0 bg-gradient-to-br from-[#24FF66]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

									{/* Icon */}
									<div className="relative z-10 mb-6">
										<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#24FF66]/20 to-[#24FF66]/5 border border-[#24FF66]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
											<svg
												className="w-7 h-7 text-[#24FF66]"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<title>Organization Icon</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 11H5m14-7H5m14 14H5"
												/>
											</svg>
										</div>
									</div>

									<div className="relative z-10 space-y-4">
										<div className="space-y-2">
											<div className="inline-flex items-center px-3 py-1 rounded-full bg-[#24FF66]/10 border border-[#24FF66]/20">
												<span className="font-russo text-xs font-bold text-[#24FF66] uppercase tracking-wider">
													SMART
												</span>
											</div>
											<h3 className="font-russo text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#24FF66] transition-colors duration-300">
												Auto Organization
											</h3>
										</div>

										<p className="font-russo text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
											Intelligent categorization by{" "}
											<span className="text-[#24FF66] font-semibold">
												asset class
											</span>
											, custom favorites, and dynamic filtering that adapts to
											your trading patterns.
										</p>

										{/* Category indicators */}
										<div className="flex items-center gap-2 pt-2">
											{["FX", "Crypto", "Stocks", "ETF"].map((category, i) => (
												<div
													key={category}
													className="px-2 py-1 rounded bg-[#24FF66]/10 border border-[#24FF66]/20"
												>
													<span className="font-russo text-xs font-medium text-[#24FF66]">
														{category}
													</span>
												</div>
											))}
										</div>
									</div>
								</motion.div>
							</motion.div>

							{/* Drag & Drop Showcase */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.9 }}
								className="relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-r from-[#0A0B0D] via-[#070809] to-[#050506] p-8"
							>
								{/* Background pattern */}
								<div className="absolute inset-0 opacity-5">
									<div
										className="absolute inset-0"
										style={{
											backgroundImage:
												"radial-gradient(circle at 25% 25%, #24FF66 2px, transparent 2px)",
											backgroundSize: "24px 24px",
										}}
									/>
								</div>

								<div className="relative z-10 flex items-center gap-8">
									<div className="flex-1 space-y-4">
										<div className="space-y-2">
											<div className="inline-flex items-center px-3 py-1 rounded-full bg-[#24FF66]/10 border border-[#24FF66]/20">
												<span className="font-russo text-xs font-bold text-[#24FF66] uppercase tracking-wider">
													INTUITIVE
												</span>
											</div>
											<h3 className="font-russo text-2xl font-black text-white uppercase tracking-tight">
												Drag & Drop Control
											</h3>
										</div>

										<p className="font-russo text-white/70 leading-relaxed">
											Reorder your watchlist with intuitive drag-and-drop
											controls. Organize instruments exactly how you want them
											for optimal trading workflow.
										</p>

										<div className="flex items-center gap-3">
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-[#24FF66]" />
												<span className="font-russo text-sm text-white/60">
													Instant reordering
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-[#24FF66]" />
												<span className="font-russo text-sm text-white/60">
													Visual feedback
												</span>
											</div>
										</div>
									</div>

									{/* Visual drag indicator */}
									<div className="hidden lg:block">
										<div className="relative">
											<motion.div
												animate={{ y: [0, -10, 0] }}
												transition={{
													duration: 2,
													repeat: Number.POSITIVE_INFINITY,
													ease: "easeInOut",
												}}
												className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#24FF66]/20 to-[#24FF66]/5 border border-[#24FF66]/30 flex items-center justify-center"
											>
												<svg
													className="w-6 h-6 text-[#24FF66]"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<title>Drag and Drop Icon</title>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
													/>
												</svg>
											</motion.div>
											<motion.div
												animate={{ opacity: [0.3, 1, 0.3] }}
												transition={{
													duration: 2,
													repeat: Number.POSITIVE_INFINITY,
													ease: "easeInOut",
												}}
												className="absolute inset-0 rounded-lg bg-[#24FF66]/10 blur-xl"
											/>
										</div>
									</div>
								</div>
							</motion.div>

							{/* Performance Stats */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 1.1 }}
								className="grid grid-cols-3 gap-8 pt-4"
							>
								{[
									{
										value: "500+",
										label: "Instruments",
										sublabel: "Across all markets",
									},
									{
										value: "< 50ms",
										label: "Search Speed",
										sublabel: "Lightning fast",
									},
									{
										value: "100%",
										label: "Customizable",
										sublabel: "Your way",
									},
								].map((stat, index) => (
									<motion.div
										key={stat.label}
										initial={{ opacity: 0, scale: 0.9 }}
										whileInView={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
										className="text-center group"
									>
										<div className="space-y-2">
											<div className="font-russo text-3xl lg:text-4xl font-black text-[#24FF66] tracking-tighter group-hover:scale-110 transition-transform duration-300">
												{stat.value}
											</div>
											<div className="space-y-1">
												<div className="font-russo text-sm font-semibold text-white uppercase tracking-wider">
													{stat.label}
												</div>
												<div className="font-russo text-xs text-white/50">
													{stat.sublabel}
												</div>
											</div>
										</div>
									</motion.div>
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
