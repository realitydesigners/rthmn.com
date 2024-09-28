import React from "react";
import Link from "next/link";

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

const PairsSidebar: React.FC<PairsSidebarProps> = ({ pairs, currentPair }) => {
	const formatValue = (value: number | undefined) => {
		return value !== undefined ? value.toFixed(5) : "N/A";
	};

	return (
		<div className="fixed h-screen w-64 overflow-y-auto bg-gray-100 p-4">
			<h2 className="mb-4 text-xl font-bold">Pairs</h2>
			<ul>
				{Object.entries(pairs).map(([pair, data]) => (
					<li
						key={pair}
						className={`mb-2 ${pair === currentPair ? "font-bold" : ""}`}
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
							<div className="text-xs text-gray-600">
								{data.boxes
									.map((box, index) => (
										<div key={index}>Value: {formatValue(box.value)}</div>
									))
									.slice(0, 5)}{" "}
								{/* Show only first 5 values */}
								{data.boxes.length > 5 && <div>...</div>}
							</div>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default PairsSidebar;
