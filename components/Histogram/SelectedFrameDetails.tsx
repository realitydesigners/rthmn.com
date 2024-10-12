import React from "react";
import { BoxSlice, Box } from "@/types";

interface SelectedFrameDetailsProps {
	selectedFrame: BoxSlice;
	visibleBoxes: Box[];
	onClose: () => void;
	linePrice: number;
}

const SelectedFrameDetails: React.FC<SelectedFrameDetailsProps> = ({
	selectedFrame,
	visibleBoxes,
	onClose,
	linePrice,
}) => {
	const totalPositive = visibleBoxes.reduce(
		(sum, box) => sum + (box.value > 0 ? box.value : 0),
		0,
	);
	const totalNegative = visibleBoxes.reduce(
		(sum, box) => sum + (box.value < 0 ? box.value : 0),
		0,
	);

	// Find the smallest box by absolute value
	const smallestBox = visibleBoxes.reduce((smallest, current) =>
		Math.abs(current.value) < Math.abs(smallest.value) ? current : smallest,
	);

	// Determine if LinePrice matches high or low
	const linePriceMatch = smallestBox.value >= 0 ? "High" : "Low";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="max-h-[80vh] w-[80vw] max-w-2xl overflow-hidden rounded-lg bg-gray-800 shadow-xl">
				<div className="flex items-center justify-between border-b border-gray-700 p-4">
					<h3 className="text-lg font-bold text-white">
						Selected Frame Details
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white focus:outline-none"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div className="p-4">
					<p className="mb-4 text-white">
						Timestamp: {new Date(selectedFrame.timestamp).toLocaleString()}
					</p>
					<div className="mb-4 flex flex-wrap justify-between text-white">
						<p>
							Total Positive:{" "}
							<span className="text-green-400">{totalPositive.toFixed(2)}</span>
						</p>
						<p>
							Total Negative:{" "}
							<span className="text-red-400">{totalNegative.toFixed(2)}</span>
						</p>
						<p>
							Line Price:{" "}
							<span className="text-blue-400">{linePrice.toFixed(3)}</span>{" "}
							<span className="text-yellow-400">
								(Matches {linePriceMatch} of smallest box)
							</span>
						</p>
					</div>
					<div className="mt-2">
						<h4 className="mb-2 font-semibold text-white">Visible Boxes:</h4>
						<div className="max-h-[50vh] overflow-y-auto">
							<table className="w-full text-left text-sm text-white">
								<thead>
									<tr className="bg-gray-700">
										<th className="p-2">Box</th>
										<th className="p-2">High</th>
										<th className="p-2">Low</th>
										<th className="p-2">Difference</th>
										<th className="p-2">Value</th>
									</tr>
								</thead>
								<tbody>
									{visibleBoxes.map((box, index) => (
										<tr key={index} className="border-b border-gray-700">
											<td className="p-2">{index + 1}</td>
											<td className="p-2">{box.high.toFixed(3)}</td>
											<td className="p-2">{box.low.toFixed(3)}</td>
											<td className="p-2">{(box.high - box.low).toFixed(3)}</td>
											<td
												className={`p-2 ${
													box.value > 0 ? "text-green-400" : "text-red-400"
												}`}
											>
												{box.value.toFixed(2)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SelectedFrameDetails;
