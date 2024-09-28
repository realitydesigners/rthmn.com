import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, OHLC } from "@/types";

interface PairData {
	boxes: Box[];
	currentOHLC: OHLC;
}

interface PairsSidebarProps {
	pairs: Record<string, PairData>;
	currentPair: string;
	renderTrendIcon: (trend: "up" | "down") => JSX.Element;
	getTrendForOffset: (boxes: Box[], offset: number) => "up" | "down";
}

const offsets = [
	{ label: "4H", value: 0 },
	{ label: "1H", value: 6 },
	{ label: "15M", value: 12 },
	{ label: "1M", value: 19 },
];

const PairsSidebar: React.FC<PairsSidebarProps> = ({
	pairs,
	currentPair,
	renderTrendIcon,
	getTrendForOffset,
}) => {
	const router = useRouter();

	const formatValue = (value: number | undefined) => {
		return value !== undefined ? value.toFixed(5) : "N/A";
	};

	const handleOffsetClick = (pair: string, offset: number) => {
		router.push(`/${pair}?offset=${offset}`);
	};

	return (
		<div className="fixed mr-6 h-screen w-auto overflow-y-auto border-r border-[#181818] bg-black p-4">
			<ul>
				{Object.entries(pairs).map(([pair, data]) => (
					<li
						key={pair}
						className={`mb-4 font-bold ${pair === currentPair ? "font-bold" : ""}`}
					>
						<Link
							href={`/${pair}`}
							className="block rounded p-2 hover:bg-gray-200"
						>
							<div>{pair}</div>
							<div className="text-sm">
								<span className="text-white">
									{formatValue(data.currentOHLC.close)}
								</span>
							</div>
						</Link>
						<div className="mt-2 flex space-x-2">
							{offsets.map(({ label, value }) => {
								const trend = getTrendForOffset(data.boxes, value);
								return (
									<button
										key={label}
										onClick={() => handleOffsetClick(pair, value)}
										className="flex items-center rounded bg-[#181818] px-2 py-1 text-xs hover:bg-gray-300"
									>
										{renderTrendIcon(trend)}
										<span className="ml-1">{label}</span>
									</button>
								);
							})}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default PairsSidebar;
