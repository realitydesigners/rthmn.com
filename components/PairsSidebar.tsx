import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BoxData {
	high: number;
	low: number;
	value: number;
}

interface OHLC {
	open: number;
	high: number;
	low: number;
	close: number;
}

interface PairData {
	boxes: BoxData[];
	currentOHLC: OHLC;
}

interface PairsSidebarProps {
	pairs: Record<string, PairData>;
	currentPair: string;
}

const offsets = [
	{ label: "4H", value: 0 },
	{ label: "1H", value: 6 },
	{ label: "15M", value: 12 },
	{ label: "1M", value: 19 },
];

const PairsSidebar: React.FC<PairsSidebarProps> = ({ pairs, currentPair }) => {
	const router = useRouter();

	const formatValue = (value: number | undefined) => {
		return value !== undefined ? value.toFixed(5) : "N/A";
	};

	const handleOffsetClick = (pair: string, offset: number) => {
		router.push(`/${pair}?offset=${offset}`);
	};

	return (
		<div className="fixed h-screen w-64 overflow-y-auto bg-gray-100 p-4">
			<h2 className="mb-4 text-xl font-bold">Pairs</h2>
			<ul>
				{Object.entries(pairs).map(([pair, data]) => (
					<li
						key={pair}
						className={`mb-4 ${pair === currentPair ? "font-bold" : ""}`}
					>
						<Link
							href={`/${pair}`}
							className="block rounded p-2 hover:bg-gray-200"
						>
							<div>{pair}</div>
							<div className="text-sm">
								<span className="text-blue-600">
									Close: {formatValue(data.currentOHLC.close)}
								</span>
							</div>
						</Link>
						<div className="mt-2 flex space-x-2">
							{offsets.map(({ label, value }) => (
								<button
									key={label}
									onClick={() => handleOffsetClick(pair, value)}
									className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
								>
									{label}
								</button>
							))}
						</div>
						<div className="mt-2 text-xs text-gray-600">
							{data.boxes
								.map((box, index) => (
									<div key={index}>Value: {formatValue(box.value)}</div>
								))
								.slice(0, 5)}{" "}
							{/* Show only first 5 values */}
							{data.boxes.length > 5 && <div>...</div>}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default PairsSidebar;
