"use client";

import { useDashboard } from "@/providers/DashboardProvider/client";
import { useUser } from "@/providers/UserProvider";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

export const SelectedPairs = () => {
	const { pairData } = useDashboard();
	const { favorites, togglePair } = useUser();
	const [activeRow, setActiveRow] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setActiveRow(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const formatPrice = (price: number) => {
		return price.toFixed(price >= 100 ? 2 : 5);
	};

	const handleContextMenu = (e: React.MouseEvent, pair: string) => {
		e.preventDefault();
		setActiveRow(activeRow === pair ? null : pair);
	};

	if (favorites.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-sm text-[#818181]">
				<span>No instruments added to watchlist</span>
				<span className="mt-1 text-xs">Use the search bar to add pairs</span>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="flex h-full flex-col">
			<div className="font-kodemono  flex h-8 items-center justify-between border-b border-[#0A0B0D] px-4 text-xs font-medium tracking-wider text-[#818181]">
				<div className="flex w-[140px] items-center gap-2">
					<span className="uppercase">Symbol</span>
					<FaChevronDown size={8} className="opacity-50" />
				</div>
				<div className="w-[100px] text-right uppercase">Price</div>
			</div>

			<div className="custom-scrollbar flex flex-col gap-1 overflow-y-auto p-2">
				{favorites.map((pair) => {
					const currentPrice = pairData[pair]?.currentOHLC?.close;
					const isActive = activeRow === pair;

					return (
						<div
							key={pair}
							onContextMenu={(e) => handleContextMenu(e, pair)}
							className="group flex h-9 cursor-default items-center justify-between rounded border border-transparent bg-[#111] px-2 transition-all select-none hover:border-[#1C1E23] "
						>
							<div className="flex items-center overflow-hidden">
								<span className="font-russo truncate text-[13px] font-bold tracking-wider text-white">
									{pair}
								</span>
							</div>
							<div className="flex shrink-0 items-center gap-3">
								<span className="font-kodemono  text-[13px] font-medium tracking-wider text-[#32353C]">
									{currentPrice ? formatPrice(currentPrice) : "0"}
								</span>
								{isActive && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											togglePair(pair);
											setActiveRow(null);
										}}
										className="flex h-5 w-5 items-center justify-center rounded border border-red-400 bg-red-400/80 opacity-0 transition-all group-hover:opacity-100 hover:text-white"
									>
										<FaTimes size={10} className="text-black" />
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
