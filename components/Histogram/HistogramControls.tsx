import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { getTrendForOffset } from "@/app/utils/getTrendForOffset";
import { BoxSlice, ViewType } from "@/types";
import {
	ScaledIcon,
	EvenIcon,
	OscillatorIcon,
	MinusIcon,
	PlusIcon,
} from "./Icons";

interface HistogramControlsProps {
	boxOffset: number;
	onOffsetChange: (offset: number) => void;
	totalBoxes: number;
	visibleBoxesCount: number;
	viewType: ViewType;
	onViewChange: (viewType: ViewType) => void;
	selectedFrame: BoxSlice | null;
	height: number;
}

const offsets = [
	{ label: "4H", value: 0 },
	{ label: "1H", value: 6 },
	{ label: "15M", value: 12 },
	{ label: "1M", value: 19 },
];

const HistogramControls: React.FC<HistogramControlsProps> = ({
	boxOffset,
	onOffsetChange,
	totalBoxes,
	visibleBoxesCount,
	viewType,
	onViewChange,
	selectedFrame,
}) => {
	const [trends, setTrends] = useState<Record<number, "up" | "down">>({});

	useEffect(() => {
		if (selectedFrame && selectedFrame.boxes) {
			const newTrends = offsets.reduce(
				(acc, { value }) => {
					acc[value] = getTrendForOffset(selectedFrame.boxes, value);
					return acc;
				},
				{} as Record<number, "up" | "down">,
			);
			setTrends(newTrends);
		}
	}, [selectedFrame]);

	const handleOffsetClick = useCallback(
		(offset: number) => {
			onOffsetChange(offset);
		},
		[onOffsetChange],
	);

	return (
		<div
			className="flex flex-col items-center justify-between bg-black p-2"
			style={{ height: "100%", width: "100%" }}
		>
			<div className="flex flex-col space-y-2">
				<OffsetAdjuster
					boxOffset={boxOffset}
					onOffsetChange={onOffsetChange}
					totalBoxes={totalBoxes}
					visibleBoxesCount={visibleBoxesCount}
				/>
			</div>
			<ViewSwitcher viewType={viewType} onViewChange={onViewChange} />
		</div>
	);
};

const ViewSwitcher: React.FC<{
	viewType: ViewType;
	onViewChange: (viewType: ViewType) => void;
}> = ({ viewType, onViewChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const switcherRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				switcherRef.current &&
				!switcherRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getCurrentViewIcon = useMemo(() => {
		switch (viewType) {
			case "scaled":
				return <ScaledIcon className="h-6 w-6" />;
			case "even":
				return <EvenIcon className="h-6 w-6" />;
			case "oscillator":
				return <OscillatorIcon className="h-6 w-6" />;
		}
	}, [viewType]);

	return (
		<div className="relative" ref={switcherRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="rounded border border-[#181818] bg-black p-1 hover:bg-[#181818]"
				title={`Current: ${viewType} View`}
			>
				{getCurrentViewIcon}
			</button>
			{isOpen && (
				<div className="absolute right-0 mt-2 w-32 rounded border border-[#181818] bg-black shadow-lg">
					{(["scaled", "even", "oscillator"] as const).map((type) => (
						<ViewButton
							key={type}
							type={type}
							isSelected={viewType === type}
							onClick={() => {
								onViewChange(type);
								setIsOpen(false);
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
};

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

export default React.memo(HistogramControls);
