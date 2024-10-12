import React from "react";

interface CurrentSpreadLinesProps {
	closeoutAsk: number | null;
	closeoutBid: number | null;
	askPosition: { x: number; y: number } | null;
	bidPosition: { x: number; y: number } | null;
}

const CurrentSpread: React.FC<CurrentSpreadLinesProps> = ({ closeoutAsk, closeoutBid, askPosition, bidPosition }) => {
	if (closeoutAsk === null || closeoutBid === null || !askPosition || !bidPosition) {
		return null;
	}

	return (
		<>
			<div className="absolute z-[1000] left-0 right-0 flex items-center" style={{ top: `${askPosition.y}px` }}>
				<div className="relative w-full">
					<div className="absolute left-0 top-0 h-px w-full bg-[#777]" />
					<div className="absolute right-0 -top-2 text-xs text-black bg-[#777] px-1">{closeoutAsk.toFixed(5)}</div>
				</div>
			</div>
			<div className="absolute z-[1000] left-0 right-0 flex items-center" style={{ top: `${bidPosition.y}px` }}>
				<div className="relative w-full pr-1">
					<div className="absolute left-0 top-0 h-px w-full border-t border-dashed border-[#555]" />
					<div className="absolute right-0 -top-2 text-xs text-black bg-[#555] px-1">{closeoutBid.toFixed(5)}</div>
				</div>
			</div>
		</>
	);
};

export default CurrentSpread;
