import React from "react";

interface HistogramControlsProps {
	boxOffset: number;
	onOffsetChange: (change: number) => void;
	totalBoxes: number;
	visibleBoxesCount: number;
}

const HistogramControls: React.FC<HistogramControlsProps> = ({
	boxOffset,
	onOffsetChange,
	totalBoxes,
	visibleBoxesCount,
}) => {
	return (
		<div className="flex items-center space-x-2">
			<button
				onClick={() => onOffsetChange(-1)}
				className="flex h-8 w-8 items-center justify-center rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
				disabled={boxOffset === 0}
			>
				<MinusIcon />
			</button>
			<button
				onClick={() => onOffsetChange(1)}
				className="flex h-8 w-8 items-center justify-center rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
				disabled={boxOffset >= totalBoxes - visibleBoxesCount}
			>
				<PlusIcon />
			</button>
		</div>
	);
};

const MinusIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="h-5 w-5"
	>
		<line x1="5" y1="12" x2="19" y2="12"></line>
	</svg>
);

const PlusIcon: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className="h-5 w-5"
	>
		<line x1="12" y1="5" x2="12" y2="19"></line>
		<line x1="5" y1="12" x2="19" y2="12"></line>
	</svg>
);

export default HistogramControls;
