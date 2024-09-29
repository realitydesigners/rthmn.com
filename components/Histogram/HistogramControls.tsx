import React from "react";
import { ViewType } from "@/types";
import {
	ScaledIcon,
	EvenIcon,
	OscillatorIcon,
	MinusIcon,
	PlusIcon,
} from "./Icons";

interface HistogramControlsProps {
	boxOffset: number;
	onOffsetChange: (newOffset: number) => void;
	totalBoxes: number;
	visibleBoxesCount: number;
	viewType: ViewType;
	onViewChange: (newViewType: ViewType) => void;
	selectedFrame: any | null;
	height: number;
}

const ViewButton: React.FC<{
	type: ViewType;
	isSelected: boolean;
	onClick: () => void;
}> = ({ type, isSelected, onClick }) => (
	<button
		onClick={onClick}
		className={`flex w-full items-center px-4 py-2 text-left text-sm ${
			isSelected
				? "bg-[#181818] text-white"
				: "text-gray-300 hover:bg-[#181818] hover:text-white"
		}`}
	>
		{type === "scaled" && <ScaledIcon className="mr-2 h-5 w-5" />}
		{type === "even" && <EvenIcon className="mr-2 h-5 w-5" />}
		{type === "oscillator" && <OscillatorIcon className="mr-2 h-5 w-5" />}
		{type.charAt(0).toUpperCase() + type.slice(1)}
	</button>
);

const OffsetAdjuster: React.FC<{
	boxOffset: number;
	onOffsetChange: (offset: number) => void;
	totalBoxes: number;
	visibleBoxesCount: number;
}> = ({ boxOffset, onOffsetChange, totalBoxes, visibleBoxesCount }) => (
	<>
		<AdjusterButton
			icon={<MinusIcon />}
			onClick={() => onOffsetChange(Math.max(0, boxOffset - 1))}
			disabled={boxOffset === 0}
		/>
		<AdjusterButton
			icon={<PlusIcon />}
			onClick={() =>
				onOffsetChange(Math.min(totalBoxes - visibleBoxesCount, boxOffset + 1))
			}
			disabled={boxOffset >= totalBoxes - visibleBoxesCount}
		/>
	</>
);

const AdjusterButton: React.FC<{
	icon: React.ReactNode;
	onClick: () => void;
	disabled: boolean;
}> = ({ icon, onClick, disabled }) => (
	<button
		onClick={onClick}
		className="flex h-8 w-8 items-center justify-center rounded border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50"
		disabled={disabled}
	>
		{icon}
	</button>
);

const HistogramControls: React.FC<HistogramControlsProps> = ({
	boxOffset,
	onOffsetChange,
	totalBoxes,
	visibleBoxesCount,
	viewType,
	onViewChange,
	selectedFrame,
	height,
}) => {
	return (
		<div className="flex h-full flex-col items-center justify-between p-2">
			<div className="flex w-full flex-col space-y-2">
				<ViewButton
					type="scaled"
					isSelected={viewType === "scaled"}
					onClick={() => onViewChange("scaled")}
				/>
				<ViewButton
					type="even"
					isSelected={viewType === "even"}
					onClick={() => onViewChange("even")}
				/>
				<ViewButton
					type="oscillator"
					isSelected={viewType === "oscillator"}
					onClick={() => onViewChange("oscillator")}
				/>
			</div>
			<div className="flex w-full justify-between">
				<OffsetAdjuster
					boxOffset={boxOffset}
					onOffsetChange={onOffsetChange}
					totalBoxes={totalBoxes}
					visibleBoxesCount={visibleBoxesCount}
				/>
			</div>
			<div className="text-center text-white">
				<div>{boxOffset}</div>
				<div>{totalBoxes}</div>
			</div>
		</div>
	);
};

export default React.memo(HistogramControls);
