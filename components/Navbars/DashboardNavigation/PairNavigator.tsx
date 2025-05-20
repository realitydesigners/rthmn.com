"use client";

import { useLongPress } from "@/hooks/useLongPress";
import { useDashboard } from "@/providers/DashboardProvider/client";
import { useUser } from "@/providers/UserProvider";
import { cn } from "@/utils/cn";
import {
	CRYPTO_PAIRS,
	EQUITY_PAIRS,
	ETF_PAIRS,
	FOREX_PAIRS,
} from "@/utils/instruments";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { LuBookmark, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";

const useSound = () => {
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audioRef.current = new Audio("/click.wav");
		audioRef.current.volume = 0.5;
		return () => {
			if (audioRef.current) {
				audioRef.current = null;
			}
		};
	}, []);

	const play = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play().catch(() => {
				// Ignore errors (e.g. if user hasn't interacted with page yet)
			});
		}
	}, []);

	return { play };
};

const navigationButtons = [
	{ mode: "all", label: "All" },
	{ mode: "favorites", label: "Favorites" },
	{ mode: "fx", label: "FX" },
	{ mode: "crypto", label: "Crypto" },
	{ mode: "equity", label: "Equity" },
	{ mode: "etf", label: "ETF" },
];

const FilterButton = ({
	isActive,
	onClick,
	label,
}: {
	isActive: boolean;
	onClick: () => void;
	label: string;
}) => {
	return (
		<button
			onClick={onClick}
			className={cn(
				"font-outfit px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
				isActive
					? "bg-[#32353C] text-white"
					: "text-[#818181] hover:text-white",
			)}
		>
			{label}
		</button>
	);
};

export const PairNavigator = () => {
	const { pairData } = useDashboard();
	const { selectedPairs, togglePair } = useUser();
	const [activeIndex, setActiveIndex] = useState(0);
	const [viewMode, setViewMode] = useState<string>("favorites");
	const scrollRef = useRef<HTMLDivElement>(null);
	const { play } = useSound();
	const [showRemoveForPair, setShowRemoveForPair] = useState<string | null>(
		null,
	);
	const [showAddForPair, setShowAddForPair] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const handlePairClick = useCallback(
		(pair: string) => {
			if (!selectedPairs.includes(pair)) {
				return; // Do nothing if not a favorite
			}

			// Scroll to the pair
			const pairElement = document.querySelector(`[data-pair="${pair}"]`);
			if (pairElement) {
				pairElement.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}
		},
		[selectedPairs],
	);

	// Add scroll handler to cancel actions
	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;

		let scrollTimeout: NodeJS.Timeout;
		const handleScroll = () => {
			// Clear any existing timeout
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}

			// Set a new timeout to cancel actions after scrolling stops
			scrollTimeout = setTimeout(() => {
				setShowRemoveForPair(null);
				setShowAddForPair(null);
			}, 100);
		};

		container.addEventListener("scroll", handleScroll);
		return () => {
			container.removeEventListener("scroll", handleScroll);
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
		};
	}, []);

	const currentPairs =
		viewMode === "favorites"
			? selectedPairs
			: viewMode === "fx"
				? [...FOREX_PAIRS]
				: viewMode === "crypto"
					? [...CRYPTO_PAIRS]
					: viewMode === "equity"
						? [...EQUITY_PAIRS]
						: viewMode === "etf"
							? [...ETF_PAIRS]
							: ([
									...FOREX_PAIRS,
									...CRYPTO_PAIRS,
									...EQUITY_PAIRS,
									...ETF_PAIRS,
								] as string[]);

	const handleIndexChange = (index: number) => {
		if (index >= 0 && index < currentPairs.length) {
			setActiveIndex(index);
			play();
		}
	};

	// Handle scroll events to determine active item
	const handleScroll = useCallback(() => {
		if (!scrollRef.current) return;

		const container = scrollRef.current;
		const containerRect = container.getBoundingClientRect();
		const centerY = containerRect.top + containerRect.height / 2;

		// Find the item closest to the center
		const items = container.getElementsByClassName("pair-item");
		let closestItem = null;
		let minDistance = Number.POSITIVE_INFINITY;

		Array.from(items).forEach((item) => {
			const rect = item.getBoundingClientRect();
			const distance = Math.abs(rect.top + rect.height / 2 - centerY);
			if (distance < minDistance) {
				minDistance = distance;
				closestItem = item;
			}
		});

		if (closestItem) {
			const index = Number.parseInt(
				closestItem.getAttribute("data-index") || "0",
			);
			if (index !== activeIndex) {
				handleIndexChange(index);
			}
		}
	}, [activeIndex, handleIndexChange]);

	useEffect(() => {
		const container = scrollRef.current;
		if (container) {
			container.addEventListener("scroll", handleScroll);
			return () => container.removeEventListener("scroll", handleScroll);
		}
	}, [handleScroll]);

	return (
		<div className="flex h-full flex-col touch-none">
			{/* Search */}

			<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

			{/* Pairs */}
			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto px-4 pb-20 touch-pan-y [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
				style={{ WebkitOverflowScrolling: "touch" }}
			>
				{currentPairs.map((pair, index) => (
					<div
						key={pair}
						data-index={index}
						data-pair={pair}
						className="pair-item mb-2"
					>
						<PairItem
							pair={pair}
							index={index}
							isActive={activeIndex === index}
							isFavorite={selectedPairs.includes(pair)}
							currentPrice={pairData[pair]?.currentOHLC?.close}
							showRemove={showRemoveForPair === pair}
							showAdd={showAddForPair === pair}
							onIndexChange={handleIndexChange}
							onRemove={() => {
								togglePair(pair);
								setShowRemoveForPair(null);
							}}
							onCancelRemove={() => setShowRemoveForPair(null)}
							setShowRemoveForPair={setShowRemoveForPair}
							setShowAddForPair={setShowAddForPair}
							toggleFavorite={() => togglePair(pair)}
							viewMode={viewMode}
							onViewClick={() => handlePairClick(pair)}
							onLongPressReset={() => {}}
							style={{
								height: "50px",
								opacity: activeIndex === index ? 1 : 0.3,
								transform: `scale(${activeIndex === index ? 1 : 0.95})`,
								transition: "all 0.2s ease-out",
								cursor: selectedPairs.includes(pair) ? "pointer" : "default",
							}}
						/>
					</div>
				))}
			</div>

			{/* Navigation Buttons */}
			<div className="absolute inset-x-0 bottom-30 pt-6">
				<div className="w-full px-4 -mb-5">
					<div className="flex w-auto overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						<div className="flex gap-2 min-w-fit">
							{navigationButtons.map((button) => (
								<FilterButton
									key={button.mode}
									isActive={viewMode === button.mode}
									onClick={() => setViewMode(button.mode)}
									label={button.label}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const SearchBar = ({
	searchQuery,
	setSearchQuery,
}: {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
}) => {
	return (
		<div className="relative z-[99] flex justify-center ">
			<div className="relative flex w-full items-center rounded-full bg-gradient-to-b from-[#32353C] to-[#1C1E23] p-[1px] shadow-xl transition-all duration-200 hover:from-[#32353C] hover:to-[#282828] sm:max-w-[300px] lg:max-w-[300px]">
				<div className="flex h-12 w-full items-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#1C1E23]">
					<LuSearch className="ml-4 h-5 w-5 text-[#32353C]" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search instruments..."
						className="font-outfit text-md ml-2 w-full bg-transparent pr-3 text-white placeholder-[#32353C] focus:outline-none"
					/>
				</div>
			</div>
		</div>
	);
};

// Extract action buttons into separate components
const RemoveActions = ({
	onCancel,
	onRemove,
}: {
	onCancel: (e: React.MouseEvent) => void;
	onRemove: (e: React.MouseEvent) => void;
}) => (
	<div className="-webkit-tap-highlight-color-transparent bg-red-500/05 flex h-11 w-11 items-center justify-center rounded-full text-red-400 transition-all hover:bg-red-500/20 hover:text-white">
		{/* <ActionButton onClick={onCancel} icon={<LuX size={22} />} /> */}
		<ActionButton
			onClick={onRemove}
			icon={<LuTrash2 size={24} />}
			variant="danger"
		/>
	</div>
);

const AddActions = ({
	onCancel,
	onAdd,
}: {
	onCancel: (e: React.MouseEvent) => void;
	onAdd: (e: React.MouseEvent) => void;
}) => (
	<div className="-webkit-tap-highlight-color-transparent bg-blue-500/05 flex h-11 w-11 items-center justify-center rounded-full text-blue-400 transition-all hover:bg-blue-500/20 hover:text-white">
		{/* <ActionButton onClick={onCancel} icon={<LuX size={22} />} /> */}
		<ActionButton
			onClick={onAdd}
			icon={<LuPlus size={24} />}
			variant="success"
		/>
	</div>
);

const PairPrice = ({
	price,
	isJPY,
	isActive,
}: {
	price: number;
	isJPY: boolean;
	isActive: boolean;
}) => (
	<div
		className={`font-dmmono  ml-2 text-sm ${isActive ? "text-white" : "text-[#0A0B0D]"}`}
	>
		{price.toFixed(isJPY ? 3 : 5)}
	</div>
);

export const PairItem = ({
	pair,
	index,
	isActive,
	isFavorite,
	currentPrice,
	showRemove,
	showAdd,
	onIndexChange,
	onRemove,
	onCancelRemove,
	setShowRemoveForPair,
	setShowAddForPair,
	toggleFavorite,
	viewMode,
	onViewClick,
	onLongPressReset,
	style,
}: {
	pair: string;
	index: number;
	isActive: boolean;
	isFavorite: boolean;
	currentPrice: number;
	showRemove: boolean;
	showAdd: boolean;
	onIndexChange: (index: number) => void;
	onRemove: () => void;
	onCancelRemove: () => void;
	setShowRemoveForPair: (pair: string) => void;
	setShowAddForPair: (pair: string | null) => void;
	toggleFavorite: () => void;
	viewMode: string;
	onViewClick: () => void;
	onLongPressReset: () => void;
	style?: React.CSSProperties;
}): React.ReactElement => {
	const { isPressed, handlers } = useLongPress(() => {
		setTimeout(() => {
			onIndexChange(index);

			if (isFavorite) {
				setShowRemoveForPair(pair);
			} else if (viewMode !== "favorites") {
				setShowAddForPair(pair);
			}
		}, 50);
	});

	useEffect(() => {
		setShowAddForPair(null);
	}, [onLongPressReset]);

	const handleClick = () => {
		if (!showRemove && !showAdd) {
			onIndexChange(index);
			if (isFavorite) {
				onViewClick();
			}
		}
	};

	const renderActions = () => {
		if (showRemove) {
			return (
				<RemoveActions
					onCancel={(e) => {
						e.stopPropagation();
						onCancelRemove();
					}}
					onRemove={(e) => {
						e.stopPropagation();
						onRemove();
					}}
				/>
			);
		}

		if (showAdd) {
			return (
				<AddActions
					onCancel={(e) => {
						e.stopPropagation();
						setShowAddForPair(null);
					}}
					onAdd={(e) => {
						e.stopPropagation();
						toggleFavorite();
						setShowAddForPair(null);
					}}
				/>
			);
		}

		return null;
	};

	return (
		<div
			data-index={index}
			className={`pair-item relative shrink-0 touch-none px-2 py-4 transition-all duration-300 ease-in-out select-none ${isPressed ? "scale-[0.98]" : ""}`}
			style={{
				scrollSnapAlign: "center",
				WebkitTapHighlightColor: "transparent",
				WebkitUserSelect: "none",
				userSelect: "none",
				touchAction: "manipulation",
				WebkitTouchCallout: "none",
				cursor: isFavorite ? "pointer" : "default",
				...style,
			}}
			onClick={handleClick}
			{...handlers}
		>
			<div className="relative z-10 flex flex-col">
				<div className="group flex w-full items-center justify-between">
					<div className="flex items-baseline gap-2">
						<h3
							className={`font-outfit text-2xl font-bold tracking-tight transition-all duration-300 ease-in-out ${isActive ? "scale-105 text-white" : "scale-90 text-[#32353C]"}`}
						>
							{pair}
						</h3>
						{currentPrice && (
							<PairPrice
								price={currentPrice}
								isJPY={pair.includes("JPY")}
								isActive={isActive}
							/>
						)}
						{isFavorite && (
							<LuBookmark
								size={15}
								className="ml-1 inline-block text-blue-400/70"
							/>
						)}
					</div>

					<div className="flex items-center gap-3">{renderActions()}</div>
				</div>

				{isActive && !showRemove && !showAdd && <PairIndicator type="active" />}
				{showRemove && <PairIndicator type="remove" />}
				{showAdd && <PairIndicator type="add" />}
			</div>
		</div>
	);
};

const ActionButton = ({
	onClick,
	icon,
	variant = "default",
}: {
	onClick: (e: React.MouseEvent) => void;
	icon: React.ReactNode;
	variant?: "default" | "danger" | "success";
}) => {
	const variantStyles = {
		default: "bg-[#1C1E23] hover:bg-[#32353C] primary-text",
		danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
		success: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
	};

	return (
		<button
			onClick={onClick}
			className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${variantStyles[variant]}`}
		>
			{icon}
		</button>
	);
};

const PairIndicator = ({ type }: { type: "active" | "remove" | "add" }) => {
	const styles = {
		active: "bg-gradient-to-r from-[#32353C] to-transparent",
		remove: "animate-pulse bg-gradient-to-r from-red-400/20 to-transparent",
		add: "animate-pulse bg-gradient-to-r from-blue-400/20 to-transparent",
	};

	return (
		<div
			className={`absolute top-1/2 -left-4 h-[2px] w-3 -translate-y-1/2 ${styles[type]}`}
		/>
	);
};
