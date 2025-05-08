"use client";

import { useUser } from "@/providers/UserProvider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import {
	CRYPTO_PAIRS,
	EQUITY_PAIRS,
	ETF_PAIRS,
	FOREX_PAIRS,
	INSTRUMENTS,
} from "@/utils/instruments";
import { setSelectedPairs as saveToLocalStorage } from "@/utils/localStorage";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface Props {
	selectedPairs: string[];
	setSelectedPairs: (pairs: string[]) => void;
	onValidationChange?: (isValid: boolean) => void;
}

const MIN_PAIRS_REQUIRED = 4;

const formatPrice = (price: number, instrument: string) => {
	let digits = 2; // default
	for (const category of Object.values(INSTRUMENTS)) {
		if (instrument in category) {
			digits = category[instrument].digits;
			break;
		}
	}
	return price.toFixed(digits);
};

export default function PairsStep({
	selectedPairs,
	setSelectedPairs,
	onValidationChange,
}: Props) {
	const { togglePair } = useUser();
	const [searchQuery, setSearchQuery] = useState("");
	const { priceData } = useWebSocket();

	// Update validation whenever selected pairs change
	useEffect(() => {
		onValidationChange?.(selectedPairs.length >= MIN_PAIRS_REQUIRED);
	}, [selectedPairs, onValidationChange]);

	const handlePairClick = (pair: string) => {
		const newSelectedPairs = selectedPairs.includes(pair)
			? selectedPairs.filter((p) => p !== pair)
			: [...selectedPairs, pair];

		setSelectedPairs(newSelectedPairs);
		saveToLocalStorage(newSelectedPairs);
		togglePair(pair);
	};

	const groups = [
		{ label: "FX", items: FOREX_PAIRS },
		{ label: "CRYPTO", items: CRYPTO_PAIRS },
		{ label: "STOCKS", items: EQUITY_PAIRS },
		{ label: "ETF", items: ETF_PAIRS },
	];

	const getFilteredGroups = () => {
		if (!searchQuery) return groups;

		return groups
			.map((group) => ({
				...group,
				items: group.items.filter((item) =>
					item.toLowerCase().includes(searchQuery.toLowerCase()),
				),
			}))
			.filter((group) => group.items.length > 0);
	};

	return (
		<div className="flex h-[60vh] flex-col">
			<div className="flex-shrink-0 space-y-8">
				<div className="space-y-2">
					<motion.h2
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent"
					>
						Select Trading Instruments
					</motion.h2>
					<div className="flex items-center justify-between">
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="pr-4 text-base text-neutral-400"
						>
							Choose your favorite trading pairs, you can always add more later
						</motion.p>

						{/* Refined Selection Counter */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex items-center gap-2"
						>
							<div className="flex gap-1">
								{[...Array(MIN_PAIRS_REQUIRED)].map((_, i) => (
									<motion.div
										key={i}
										className={`h-1 w-6 rounded-full transition-all duration-300 ${i < selectedPairs.length ? "bg-blue-400/80" : "bg-[#32353C]"}`}
										initial={false}
										animate={{
											scale: i < selectedPairs.length ? 1 : 0.95,
										}}
									/>
								))}
							</div>
							<span
								className={`text-xs font-medium transition-all duration-300 ${selectedPairs.length >= MIN_PAIRS_REQUIRED ? "text-blue-400" : "text-[#32353C]"}`}
							>
								{selectedPairs.length}/{MIN_PAIRS_REQUIRED}
							</span>
						</motion.div>
					</div>
				</div>

				{/* Search Bar */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="relative"
				>
					<div className="relative flex items-center rounded-full bg-gradient-to-b from-[#32353C] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#32353C] hover:to-[#282828]">
						<div className="flex h-10 w-full items-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#121212]">
							<FaSearch className="ml-4 text-[#32353C]" />
							<input
								type="text"
								placeholder="Search instruments..."
								value={searchQuery}
								onChange={(e) =>
									setSearchQuery(
										e.target.value.replace(/\s/g, "").toUpperCase(),
									)
								}
								className="font-outfit w-full bg-transparent px-3 py-2 text-sm text-white placeholder-[#32353C] focus:outline-none"
							/>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Scrollable Pairs Grid */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
				className="mt-4 flex-1 space-y-2 overflow-y-auto pr-2"
				style={{
					scrollbarWidth: "thin",
					scrollbarColor: "#333 transparent",
				}}
			>
				{/* Scrollbar Styles */}
				<style jsx global>{`
                    .overflow-y-auto::-webkit-scrollbar {
                        width: 4px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb {
                        background-color: #333;
                        border-radius: 20px;
                    }
                `}</style>

				{getFilteredGroups().map((group, groupIndex) => {
					const pairs = group.items;
					if (pairs.length === 0) return null;

					return (
						<div key={group.label}>
							<h3 className="font-kodemono sticky top-0 z-90 py-2 text-xs font-medium tracking-wider text-[#32353C] uppercase">
								{group.label}
							</h3>
							<div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
								{pairs.map((item, index) => {
									const isSelected = selectedPairs.includes(item);

									return (
										<motion.button
											key={item}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{
												duration: 0.3,
												delay: (groupIndex * pairs.length + index) * 0.05,
											}}
											onClick={() => handlePairClick(item)}
											className={`group relative w-full overflow-hidden rounded-xl border  bg-gradient-to-b  transition-all duration-300 ${
												isSelected
													? "border-blue-400/50 from-blue-400/20 to-blue-400/0"
													: "border-[#1C1E23]  from-[#0A0B0D] to-[#070809] hover:border-blue-400/30 "
											}`}
										>
											<motion.div
												initial={false}
												animate={{
													opacity: isSelected ? 1 : 0,
													scale: isSelected ? 1 : 0.98,
												}}
												transition={{
													type: "spring",
													stiffness: 200,
													damping: 20,
												}}
												className={`absolute inset-0 bg-gradient-to-b from-blue-400/10 to-transparent`}
											/>

											<div className="relative flex items-center justify-between rounded-xl p-4">
												<div className="flex items-center">
													<span className="font-outfit text-[13px] font-bold tracking-wider text-white">
														{item}
													</span>
												</div>
												<div className="flex items-center">
													<span className="font-kodemono mr-3 text-[13px] font-medium tracking-wider text-[#32353C] transition-all group-hover:mr-4">
														{priceData[item]?.price
															? formatPrice(priceData[item].price, item)
															: "N/A"}
													</span>
												</div>
											</div>
										</motion.button>
									);
								})}
							</div>
						</div>
					);
				})}
			</motion.div>
		</div>
	);
}
