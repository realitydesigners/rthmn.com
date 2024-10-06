import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, BoxSlice, PairData } from "@/types";
import { DraggableBorder } from "./DraggableBorder";

interface PairsSidebarProps {
	pairs: Record<string, PairData>;
	currentPair: string;
	getTrendForOffset: (
		boxes: Box[] | BoxSlice[],
		offset: number,
	) => "up" | "down";
	width: number;
	onWidthChange: (newWidth: number) => void;
}

const offsets = [
	{ label: "4H", value: 0 },
	{ label: "1H", value: 6 },
	{ label: "15M", value: 12 },
	{ label: "1M", value: 19 },
];

const MIN_SIDEBAR_WIDTH = 375;
const MAX_SIDEBAR_WIDTH = 400;

const PairsSidebar: React.FC<PairsSidebarProps> = ({
	pairs,
	currentPair,
	getTrendForOffset,
	width,
	onWidthChange,
}) => {
	const router = useRouter();
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const [hoveredOffset, setHoveredOffset] = useState<string | null>(null);

	const formatValue = (value: number | undefined) => {
		return value !== undefined ? value.toFixed(5) : "N/A";
	};

	const handleOffsetClick = (pair: string, offset: number) => {
		router.push(`/${pair}?offset=${offset}`);
	};

	const renderTrendIcon = (trend: "up" | "down") => {
		const color = trend === "up" ? "text-teal-500" : "text-red-500";
		return (
			<svg
				className={`h-4 w-4 ${color}`}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{trend === "up" ? (
					<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
				) : (
					<polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
				)}
				<polyline
					points={trend === "up" ? "17 6 23 6 23 12" : "17 18 23 18 23 12"}
				/>
			</svg>
		);
	};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return;
			const deltaX = startX - e.clientX;
			const newWidth = Math.min(
				Math.max(width + deltaX, MIN_SIDEBAR_WIDTH),
				MAX_SIDEBAR_WIDTH,
			);
			onWidthChange(newWidth);
		},
		[isDragging, startX, width, onWidthChange],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	useEffect(() => {
		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		} else {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	const handleDragStart = useCallback((e: React.MouseEvent) => {
		setIsDragging(true);
		setStartX(e.clientX);
	}, []);

	return (
		<div
			ref={sidebarRef}
			className="fixed right-0 h-screen overflow-y-auto border-l border-[#181818] bg-black p-2 pt-24"
			style={{
				width: `${width}px`,
				transition: isDragging ? "none" : "width 0.1s ease-out",
			}}
		>
			<DraggableBorder
				isDragging={isDragging}
				onDragStart={handleDragStart}
				direction="left"
			/>
			<div className="mb-2 flex text-[10px] tracking-widest text-gray-300/50">
				<span className="w-24 pl-1">INSTRUMENT</span>
				<span className="w-24">PRICE</span>
				<div className="flex space-x-1 pr-1">
					<span className="w-8 text-center">4H</span>
					<span className="w-8 text-center">1H</span>
					<span className="w-8 text-center">15M</span>
					<span className="w-8 text-center">1M</span>
				</div>
			</div>
			<ul className="space-y-1">
				{Object.entries(pairs).map(([pair, data]) => (
					<li
						key={pair}
						className={`flex flex-col text-sm ${
							pair === currentPair ? "bg-[#111]" : ""
						}`}
					>
						<div className="flex items-center justify-between p-1 hover:bg-[#111]">
							<Link href={`/${pair}`} className="flex items-center">
								<span className="w-24 pl-1 font-bold">{pair}</span>
								<span className="w-24 pl-1 text-[10px] text-gray-300">
									{formatValue(data.currentOHLC.close)}
								</span>
							</Link>
							<div className="flex space-x-1 pr-1">
								{offsets.map(({ label, value }) => {
									const trend = getTrendForOffset(data.boxes, value);
									return (
										<button
											key={label}
											onClick={() => handleOffsetClick(pair, value)}
											className="flex w-8 items-center justify-center rounded bg-[#222] px-1 py-1 text-xs hover:bg-[#181818]"
											onMouseEnter={() => setHoveredOffset(`${pair}-${label}`)}
											onMouseLeave={() => setHoveredOffset(null)}
										>
											{renderTrendIcon(trend)}
											{hoveredOffset === `${pair}-${label}` && (
												<span className="ml-1 text-[12px]">{label}</span>
											)}
										</button>
									);
								})}
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default PairsSidebar;
