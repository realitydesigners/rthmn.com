"use client";

import { useUser } from "@/providers/UserProvider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import { useGridStore } from "@/stores/gridStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import {
	CRYPTO_PAIRS,
	EQUITY_PAIRS,
	ETF_PAIRS,
	FOREX_PAIRS,
} from "@/utils/instruments";
import { formatPrice } from "@/utils/instruments";
import { Reorder, useDragControls } from "framer-motion";
import { motion } from "framer-motion";
import React, {
	useEffect,
	useRef,
	useState,
	useMemo,
	memo,
	useCallback,
} from "react";
import { FaSearch, FaTimes, FaStar } from "react-icons/fa";

interface LoadingSpinnerProps {
	color?: string;
	itemId: string;
}

const LoadingSpinner = ({ color = "#3b82f6" }: LoadingSpinnerProps) => {
	const [showFallback, setShowFallback] = React.useState(false);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setShowFallback(true);
		}, 10000);

		return () => clearTimeout(timer);
	}, []);

	if (showFallback) {
		return (
			<span className="font-mono text-[11px] tracking-wider opacity-50">
				N/A
			</span>
		);
	}

	return (
		<div className="relative h-3 w-3">
			<div
				className="absolute inset-0 rounded-full border-2"
				style={{ borderColor: `${color}20` }}
			/>
			<div
				className="absolute inset-0 animate-spin rounded-full border-t-2"
				style={{ borderColor: color }}
			/>
		</div>
	);
};

interface PairItemProps {
	item: string;
	isSelected?: boolean;
	onToggle: () => void;
	price?: number;
}

const PairItem = memo(
	({ item, isSelected = false, onToggle }: Omit<PairItemProps, "price">) => {
		const { currentStepId } = useOnboardingStore();
		const { boxColors } = useUser();
		const { priceData } = useWebSocket();
		const isOnboardingActive = currentStepId === "instruments"; // ??
		const price = priceData[item]?.price;

		return (
			<div
				className={cn(
					"group/item relative flex h-10 w-full items-center rounded-lg transition-all duration-300 select-none",
					isSelected
						? [
								"bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
								"border border-white/[0.02]",
								"shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
								"hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
								"hover:border-[#1C1E23]",
							]
						: "hover:bg-white/[0.02]",
				)}
			>
				<div className="relative flex w-full items-center px-3">
					{/* Instrument name */}
					<span
						className={cn(
							"font-outfit flex-1 text-sm font-bold tracking-wide transition-colors",
							isSelected
								? "text-white"
								: "text-[#32353C] group-hover/item:text-[#545963]",
						)}
					>
						{item}
					</span>

					{/* Price */}
					<div className="flex items-center">
						<span
							className={cn(
								"font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors",
								isSelected
									? "text-[#545963]"
									: "text-[#32353C] group-hover/item:text-[#32353C]",
							)}
						>
							{price ? (
								formatPrice(price, item)
							) : (
								<LoadingSpinner
									key={`${item}-loading`}
									itemId={item}
									color={isSelected ? boxColors.positive : "#444"}
								/>
							)}
						</span>

						{/* Toggle button */}
						<div className="z-90 ml-2 flex w-6 justify-center">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onToggle();
								}}
								className={cn(
									"relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
									"opacity-0 group-hover/item:opacity-100",
									isSelected
										? [
												"border-white/[0.02] bg-white/[0.02] text-white/40",
												"hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
											]
										: [
												"border-white/[0.02] bg-white/[0.02] text-white/40",
												"hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
											],
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
			</div>
		);
	},
);

interface PairGroupProps {
	label: string;
	items: React.ReactNode;
	count: number;
	isSelected?: boolean;
}

const PairGroup = memo(
	({ label, items, count, isSelected = false }: PairGroupProps) => {
		return (
			<div className="mb-8">
				<div className="space-y-1 animate-in fade-in duration-300">{items}</div>
			</div>
		);
	},
);

// Memoized search result item component
const SearchResultItem = memo(
	({
		pair,
		isSelected,
		onSelect,
	}: { pair: string; isSelected: boolean; onSelect: () => void }) => {
		const { priceData } = useWebSocket();
		const price = priceData[pair]?.price;

		return (
			<div
				onClick={onSelect}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onSelect();
					}
				}}
				className={cn(
					"group/result relative flex h-10 w-full items-center justify-between px-3 transition-all duration-300 cursor-pointer",
					isSelected
						? [
								"bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
								"border border-white/[0.02]",
								"shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
								"hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
								"hover:border-[#1C1E23]",
							]
						: "hover:bg-white/[0.02]",
				)}
			>
				{/* Left side */}
				<div className="flex w-full items-center">
					{/* Instrument name */}
					<span
						className={cn(
							"font-outfit ml-4 flex-1 text-sm font-bold tracking-wide transition-colors",
							isSelected
								? "text-white/90 group-hover/result:text-white"
								: "text-[#32353C] group-hover/result:text-[#545963]",
						)}
					>
						{pair}
					</span>

					{/* Right side */}
					<div className="flex items-center">
						<span
							className={cn(
								"font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors",
								isSelected
									? "text-[#545963]"
									: "text-[#32353C] group-hover/result:text-[#32353C]",
							)}
						>
							{price ? formatPrice(price, pair) : "N/A"}
						</span>

						{/* Toggle button */}
						<div className="z-90 ml-2 flex w-6 justify-center">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onSelect();
								}}
								className={cn(
									"relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
									"opacity-0 group-hover/result:opacity-100",
									isSelected
										? [
												"border-white/[0.02] bg-white/[0.02] text-white/40",
												"hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
											]
										: [
												"border-white/[0.02] bg-white/[0.02] text-white/40",
												"hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
											],
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
			</div>
		);
	},
);

// Memoized filtered pairs calculation
const useFilteredPairs = (searchQuery: string, selectedPairs: string[]) => {
	return useMemo(() => {
		if (!searchQuery) return [];

		const allPairs = [
			...FOREX_PAIRS,
			...CRYPTO_PAIRS,
			...EQUITY_PAIRS,
			...ETF_PAIRS,
		];
		return allPairs
			.filter((pair) => pair.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => {
				const aSelected = selectedPairs.includes(a);
				const bSelected = selectedPairs.includes(b);
				if (aSelected && !bSelected) return -1;
				if (!aSelected && bSelected) return 1;
				return 0;
			});
	}, [searchQuery, selectedPairs]);
};

const SearchBar = memo(
	({
		onSearchStateChange,
	}: { onSearchStateChange: (isSearching: boolean) => void }) => {
		const [searchQuery, setSearchQuery] = useState("");
		const [showResults, setShowResults] = useState(false);
		const { selectedPairs, togglePair } = useUser();
		const searchRef = useRef<HTMLDivElement>(null);

		const filteredPairs = useFilteredPairs(searchQuery, selectedPairs);

		const handleToggle = useCallback(
			(pair: string) => {
				togglePair(pair);
				setSearchQuery("");
				setShowResults(false);
			},
			[togglePair],
		);

		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					searchRef.current &&
					!searchRef.current.contains(event.target as Node)
				) {
					setShowResults(false);
					onSearchStateChange(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}, [onSearchStateChange]);

		useEffect(() => {
			onSearchStateChange(showResults && !!searchQuery);
		}, [showResults, searchQuery, onSearchStateChange]);

		return (
			<div className="relative" ref={searchRef}>
				{/* Search Input */}
				<div className="group/search relative flex h-10 items-center overflow-hidden rounded-lg transition-all duration-300">
					<div className="absolute inset-0 rounded-lg border border-white/[0.02] bg-gradient-to-b from-[#0A0B0D] to-[#070809] transition-all duration-300 group-focus-within/search:border-[#1C1E23]" />

					{/* Search Icon */}
					<div className="relative ml-3 text-[#32353C] transition-colors duration-300 group-focus-within/search:text-[#545963]">
						<FaSearch size={12} />
					</div>

					{/* Input */}
					<input
						type="text"
						spellCheck={false}
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => {
							const value = e.target.value.toUpperCase().replace(/\s/g, "");
							setSearchQuery(value);
						}}
						onFocus={() => setShowResults(true)}
						className="font-outfit relative h-full flex-1 bg-transparent px-3 text-[13px] font-medium text-[#545963] placeholder-[#32353C] transition-colors outline-none"
					/>

					{/* Clear Button */}
					{searchQuery && (
						<button
							type="button"
							onClick={() => {
								setSearchQuery("");
								setShowResults(false);
							}}
							className="relative mr-3 flex h-5 w-5 items-center justify-center rounded-md border border-white/[0.02] bg-white/[0.02] text-white/40 transition-all hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
						>
							<FaTimes size={8} />
						</button>
					)}
				</div>

				{/* Results Dropdown */}
				{showResults && searchQuery && (
					<div className="absolute top-full z-100 right-0 left-0 z-10 overflow-hidden bg-gradient-to-b from-[#0A0B0D] to-[#070809] pt-2 shadow-lg">
						<div className="max-h-[280px] overflow-y-auto rounded-lg border border-white/[0.02]">
							{filteredPairs.map((pair) => (
								<SearchResultItem
									key={pair}
									pair={pair}
									isSelected={selectedPairs.includes(pair)}
									onSelect={() => handleToggle(pair)}
								/>
							))}
							{filteredPairs.length === 0 && (
								<div className="flex h-20 items-center justify-center text-center text-[13px] text-[#32353C]">
									No instruments found matching "{searchQuery}"
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	},
);

// DraggableItem component to handle individual drag controls
const DraggableItem = memo(
	({ item, onToggle }: { item: string; onToggle: () => void }) => {
		const { boxColors } = useUser();
		const { priceData } = useWebSocket();
		const dragControls = useDragControls();

		return (
			<Reorder.Item
				value={item}
				id={item}
				dragListener={false}
				dragControls={dragControls}
				className="group/drag mb-1"
				whileDrag={{ zIndex: 50 }}
				style={{ position: "relative", zIndex: 0 }}
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
									className="pointer-events-none"
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
								"group/item relative flex h-10 w-full items-center rounded-lg transition-all duration-300 select-none",
								"bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
								"border border-white/[0.02]",
								"shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
								"hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
								"hover:border-[#1C1E23]",
							)}
						>
							<div className="relative flex w-full items-center px-3">
								{/* Status indicator */}
								{/* <div className='relative flex h-8 w-8 items-center justify-center'></div> */}

								{/* Instrument name */}
								<span className="ml-4 font-outfit flex-1 text-sm font-bold tracking-wide text-white transition-colors">
									{item}
								</span>

								{/* Price */}
								<div className="flex items-center">
									<span className="font-kodemono w-[70px] text-right text-sm tracking-wider text-[#545963] transition-colors">
										{priceData[item]?.price ? (
											formatPrice(priceData[item].price, item)
										) : (
											<LoadingSpinner
												key={`${item}-loading`}
												itemId={item}
												color={boxColors.positive}
											/>
										)}
									</span>

									{/* Toggle button */}
									<div className="z-90 ml-2 flex w-6 justify-center">
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onToggle();
											}}
											className={cn(
												"relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
												"opacity-0 group-hover/item:opacity-100",
												"border-white/[0.02] bg-white/[0.02] text-white/40 hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
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

DraggableItem.displayName = "DraggableItem";

// Add the filter buttons component
const FilterButton = ({
	isActive,
	onClick,
	label,
}: { isActive: boolean; onClick: () => void; label: React.ReactNode }) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"group relative w-auto flex flex h-8 items-center px-2",
				"transition-all duration-300 ease-in-out",
			)}
		>
			{/* Active indicator */}
			{isActive && (
				<div className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]">
					<div className="absolute inset-0 rounded-lg border border-white/[0.02]" />
				</div>
			)}

			{/* Hover background */}
			<div
				className={cn(
					"absolute inset-0 rounded-lg bg-white/[0.02] opacity-0 transition-opacity duration-300",
					"group-hover:opacity-100",
					isActive && "group-hover:opacity-0",
				)}
			/>

			{/* Label */}
			<span
				className={cn(
					"relative z-10 font-outfit text-[12px] font-medium tracking-wide whitespace-nowrap flex items-center justify-center",
					"transition-colors duration-300 ease-in-out",
					isActive ? "text-white" : "text-[#32353C] group-hover:text-[#545963]",
				)}
			>
				{label}
			</span>
		</button>
	);
};

export const InstrumentsPanel = () => {
	const { selectedPairs, togglePair } = useUser();
	const [isSearching, setIsSearching] = useState(false);
	const [activeFilter, setActiveFilter] = useState("selected");
	const reorderPairs = useGridStore((state) => state.reorderPairs);
	const contentRef = useRef<HTMLDivElement>(null);

	const scrollToSection = useCallback((filter: string) => {
		setActiveFilter(filter);

		// Give time for the DOM to update
		setTimeout(() => {
			const element = document.querySelector(`[data-section="${filter}"]`);
			if (element && contentRef.current) {
				const headerHeight = 200; // Approximate height of search + filters
				const elementPosition = element.getBoundingClientRect().top;
				const offsetPosition = elementPosition - headerHeight;

				contentRef.current.scrollTo({
					top: contentRef.current.scrollTop + offsetPosition,
					behavior: "smooth",
				});
			}
		}, 100);
	}, []);

	// Memoized selected pairs items
	const selectedPairsItems = useMemo(
		() =>
			selectedPairs.map((item) => (
				<DraggableItem
					key={item}
					item={item}
					onToggle={() => togglePair(item)}
				/>
			)),
		[selectedPairs, togglePair],
	);

	// Memoized available pairs groups
	const availablePairsGroups = useMemo(
		() =>
			[
				{ label: "FX", items: FOREX_PAIRS },
				{ label: "CRYPTO", items: CRYPTO_PAIRS },
				{ label: "STOCKS", items: EQUITY_PAIRS },
				{ label: "ETF", items: ETF_PAIRS },
			]
				.map((group) => {
					const availablePairs = group.items.filter(
						(item) => !selectedPairs.includes(item),
					);
					if (availablePairs.length === 0) return null;

					const items = availablePairs.map((item) => (
						<PairItem
							key={item}
							item={item}
							isSelected={false}
							onToggle={() => togglePair(item)}
						/>
					));

					return (
						<PairGroup
							key={group.label}
							label={group.label}
							items={items}
							count={availablePairs.length}
						/>
					);
				})
				.filter(Boolean),
		[selectedPairs, togglePair],
	);

	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Header section with search and filters */}
			<div className="flex-none overflow-hidden w-full">
				<SearchBar onSearchStateChange={setIsSearching} />
				<div className="w-full flex gap-2 w-auto ">
					<div className="w-auto overflow-x-auto flex flex-wrap gap-2 py-2">
						<FilterButton
							isActive={activeFilter === "selected"}
							onClick={() => scrollToSection("selected")}
							label={<FaStar size={10} />}
						/>
						<FilterButton
							isActive={activeFilter === "fx"}
							onClick={() => scrollToSection("fx")}
							label="FX"
						/>
						<FilterButton
							isActive={activeFilter === "crypto"}
							onClick={() => scrollToSection("crypto")}
							label="Crypto"
						/>
						<FilterButton
							isActive={activeFilter === "stocks"}
							onClick={() => scrollToSection("stocks")}
							label="Stocks"
						/>
						<FilterButton
							isActive={activeFilter === "etf"}
							onClick={() => scrollToSection("etf")}
							label="ETF"
						/>
					</div>
				</div>
			</div>

			{/* Scrollable content section */}
			<div
				ref={contentRef}
				className={cn(
					"flex-1 overflow-y-auto min-h-0 hide-scrollbar",
					isSearching ? "opacity-30" : "opacity-100",
				)}
			>
				<div className="space-y-4">
					{selectedPairs.length > 0 && (
						<div data-section="selected">
							<PairGroup
								label="Selected Pairs"
								items={
									<Reorder.Group
										axis="y"
										values={selectedPairs}
										onReorder={reorderPairs}
									>
										{selectedPairsItems}
									</Reorder.Group>
								}
								count={selectedPairs.length}
								isSelected={true}
							/>
						</div>
					)}
					{availablePairsGroups.map((group) => (
						<div
							key={group.props.label}
							data-section={group.props.label.toLowerCase()}
						>
							{group}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
