"use client";
import React, {
	useState,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import HistogramControls from "./HistogramControls";
import HistogramSwitcher from "./HistogramSwitcher";
import BoxOffsetSelector from "./BoxOffsetSelector";
import SelectedFrameDetails from "./SelectedFrameDetails";
import OffsetModal from "./OffsetModal";
import { ScaledBoxes } from "./ScaledBoxes";
import { SquareBoxes } from "./SquareBoxes";
import { LineBoxes } from "./LineBoxes";
import { Oscillator } from "./charts/Oscillator";
import DataDotSelector from "./DataDotSelector";
import type { BoxSlice } from "@/types";

const MIN_HISTOGRAM_HEIGHT = 100;
const MAX_HISTOGRAM_HEIGHT = 400;
const ZOOMED_BAR_WIDTH = 16;
const INITIAL_BAR_WIDTH = 16;
const DEFAULT_VISIBLE_BOXES_COUNT = 8;

interface HistogramManagerProps {
	data: BoxSlice[];
	height: number;
	onResize: (newHeight: number) => void;
}

const HistogramManager: React.FC<HistogramManagerProps> = ({
	data,
	height,
	onResize,
}) => {
	const [boxOffset, setBoxOffset] = useState(0);
	const [viewType, setViewType] = useState<
		"scaled" | "even" | "chart" | "oscillator"
	>("oscillator");
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [startHeight, setStartHeight] = useState(height);
	const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
	const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [visibleBoxesCount, setVisibleBoxesCount] = useState(
		DEFAULT_VISIBLE_BOXES_COUNT,
	);
	const [customRangeStart, setCustomRangeStart] = useState(0);
	const [customRangeEnd, setCustomRangeEnd] = useState(
		DEFAULT_VISIBLE_BOXES_COUNT - 1,
	);

	const currentFrame = useMemo(() => {
		return selectedFrame || (data.length > 0 ? data[0] : null);
	}, [selectedFrame, data]);

	const visibleBoxes = useMemo(() => {
		return currentFrame
			? currentFrame.boxes.slice(customRangeStart, customRangeEnd + 1)
			: [];
	}, [currentFrame, customRangeStart, customRangeEnd]);

	const handleOffsetChange = useCallback(
		(change: number) => {
			setBoxOffset((prevOffset) => {
				const newOffset = prevOffset + change;
				const maxOffset =
					(data[selectedFrameIndex ?? 0]?.boxes.length || 0) -
					visibleBoxesCount;
				return Math.max(0, Math.min(newOffset, maxOffset));
			});
		},
		[data, selectedFrameIndex, visibleBoxesCount],
	);

	const handleViewChange = useCallback(
		(newViewType: "scaled" | "even" | "chart" | "oscillator") => {
			setViewType(newViewType);
		},
		[],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return;
			const deltaY = startY - e.clientY;
			const newHeight = Math.min(
				Math.max(startHeight + deltaY, MIN_HISTOGRAM_HEIGHT),
				MAX_HISTOGRAM_HEIGHT,
			);
			onResize(newHeight);
		},
		[isDragging, startY, startHeight, onResize],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, [setIsDragging]);

	const handleFrameSelect = useCallback((frame: BoxSlice, index: number) => {
		setSelectedFrame((prev) => (prev === frame ? null : frame));
		setSelectedFrameIndex((prev) => (prev === index ? null : index));
	}, []);

	const handleRangeChange = useCallback((start: number, end: number) => {
		setCustomRangeStart(start);
		setCustomRangeEnd(end);
		setBoxOffset(start);
		setVisibleBoxesCount(end - start + 1);
	}, []);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		} else {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		}
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	const maxSize = useMemo(() => {
		const sizes = data.flatMap((slice) =>
			slice.boxes.map((box) => Math.abs(box.value)),
		);
		return sizes.reduce((max, size) => Math.max(max, size), 0);
	}, [data]);

	const renderNestedBoxes = useCallback(
		(
			boxArray: BoxSlice["boxes"],
			isSelected: boolean,
			meetingPointY: number,
			prevMeetingPointY: number | null,
			nextMeetingPointY: number | null,
			sliceWidth: number,
		): JSX.Element | null => {
			const visibleBoxArray = boxArray.slice(
				boxOffset,
				boxOffset + visibleBoxesCount,
			);
			switch (viewType) {
				case "scaled":
					return (
						<ScaledBoxes
							boxArray={visibleBoxArray}
							idx={0}
							prevColor={null}
							isSelected={isSelected}
							maxSize={maxSize}
							height={height}
							zoomedBarWidth={ZOOMED_BAR_WIDTH}
							initialBarWidth={INITIAL_BAR_WIDTH}
							handleFrameClick={handleFrameSelect}
						/>
					);
				case "even":
					return (
						<SquareBoxes
							boxArray={visibleBoxArray}
							isSelected={isSelected}
							height={height}
							visibleBoxesCount={visibleBoxesCount}
							zoomedBarWidth={ZOOMED_BAR_WIDTH}
							initialBarWidth={INITIAL_BAR_WIDTH}
						/>
					);
				case "chart":
					return (
						<LineBoxes
							boxArray={visibleBoxArray}
							isSelected={isSelected}
							height={height}
							visibleBoxesCount={visibleBoxesCount}
							zoomedBarWidth={ZOOMED_BAR_WIDTH}
							initialBarWidth={INITIAL_BAR_WIDTH}
							meetingPointY={meetingPointY}
							prevMeetingPointY={prevMeetingPointY}
							nextMeetingPointY={nextMeetingPointY}
							sliceWidth={sliceWidth}
						/>
					);
				case "oscillator":
					return (
						<Oscillator
							boxArray={visibleBoxArray}
							height={height}
							visibleBoxesCount={visibleBoxesCount}
							meetingPointY={meetingPointY}
							prevMeetingPointY={prevMeetingPointY}
							nextMeetingPointY={nextMeetingPointY}
							sliceWidth={sliceWidth}
						/>
					);
				default:
					return null;
			}
		},
		[
			viewType,
			maxSize,
			height,
			handleFrameSelect,
			boxOffset,
			visibleBoxesCount,
		],
	);

	const framesWithPoints = useMemo(() => {
		// Use the original order of data (most recent at the end)
		return data.map((slice, index) => {
			const boxArray = slice.boxes;
			const isSelected = index === selectedFrameIndex;

			const boxHeight = height / visibleBoxesCount;
			const visibleBoxes = boxArray.slice(
				boxOffset,
				boxOffset + visibleBoxesCount,
			);
			const positiveBoxes = visibleBoxes.filter((box) => box.value > 0);
			const negativeBoxes = visibleBoxes.filter((box) => box.value <= 0);

			const totalNegativeHeight = negativeBoxes.length * boxHeight;
			const totalPositiveHeight = positiveBoxes.length * boxHeight;
			const meetingPointY =
				totalNegativeHeight +
				(height - totalNegativeHeight - totalPositiveHeight) / 2;

			const sliceWidth = isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH;

			return {
				frameData: {
					boxArray,
					isSelected,
					meetingPointY,
					sliceWidth,
				},
				meetingPointY,
				sliceWidth,
			};
		});
	}, [data, selectedFrameIndex, height, boxOffset, visibleBoxesCount]);

	const DraggableBorder = ({
		onMouseDown,
	}: {
		onMouseDown: (e: React.MouseEvent) => void;
	}) => {
		return (
			<div
				className={`absolute left-0 right-0 top-0 z-10 h-[1px] cursor-ns-resize rounded-full bg-[#181818] transition-all duration-200 hover:bg-blue-400 ${
					isDragging
						? "shadow-2xl shadow-blue-500"
						: "hover:h-[3px] hover:shadow-2xl hover:shadow-blue-500"
				}`}
				onMouseDown={onMouseDown}
			/>
		);
	};

	// Auto-scroll to the right when new data is received
	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollLeft =
				scrollContainerRef.current.scrollWidth;
		}
	}, [data]);

	return (
		<div className="absolute bottom-0 m-2 flex w-full items-center justify-center">
			<div className="absolute top-2 z-20 -mt-16 flex items-center justify-center space-x-2">
				<BoxOffsetSelector
					onOffsetChange={(newOffset) => setBoxOffset(newOffset)}
					currentOffset={boxOffset}
					selectedFrame={currentFrame}
					visibleBoxes={visibleBoxes}
				/>
				<DataDotSelector
					currentFrame={currentFrame}
					onRangeChange={handleRangeChange}
					currentOffset={boxOffset}
					visibleBoxesCount={visibleBoxesCount}
				/>
				<HistogramControls
					boxOffset={boxOffset}
					onOffsetChange={handleOffsetChange}
					totalBoxes={data[selectedFrameIndex ?? 0]?.boxes.length || 0}
					visibleBoxesCount={visibleBoxesCount}
				/>
				<HistogramSwitcher viewType={viewType} onChange={handleViewChange} />
				{/* <button
          onClick={() => setIsModalOpen(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Show Offset Info
        </button> */}
			</div>
			<div
				className="relative w-full border border-[#181818] bg-black pr-60"
				style={{ height: `${height}px`, transition: "height 0.1s ease-out" }}
				ref={containerRef}
			>
				<DraggableBorder
					onMouseDown={(e) => {
						setIsDragging(true);
						setStartY(e.clientY);
						setStartHeight(height);
					}}
				/>

				{data && data.length > 0 && (
					<div className="h-full" style={{ position: "relative" }}>
						<div
							className="hide-scrollbar flex h-full w-full items-end overflow-x-auto"
							role="region"
							aria-label="Histogram Chart"
							ref={scrollContainerRef}
						>
							<div
								style={{
									display: "inline-flex",
									width: `${data.length * INITIAL_BAR_WIDTH}px`,
									height: "100%",
									flexDirection: "row",
								}}
							>
								{framesWithPoints.map((frameWithPoint, index) => {
									const { frameData, meetingPointY, sliceWidth } =
										frameWithPoint;
									const prevMeetingPointY =
										index > 0
											? framesWithPoints[index - 1].meetingPointY
											: null;
									const nextMeetingPointY =
										index < framesWithPoints.length - 1
											? framesWithPoints[index + 1].meetingPointY
											: null;

									return (
										<div
											key={`${index}`}
											className="relative flex-shrink-0 cursor-pointer"
											style={{
												width: sliceWidth,
												height: `${height}px`,
												position: "relative",
											}}
											onClick={() => handleFrameSelect(data[index], index)}
										>
											{renderNestedBoxes(
												frameData.boxArray,
												frameData.isSelected,
												meetingPointY,
												prevMeetingPointY,
												nextMeetingPointY,
												sliceWidth,
											)}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}
			</div>
			{/* <div className="absolute left-2 top-2 z-20 text-white">
        Displaying {data.length} frames (Offset: {boxOffset})
      </div> */}
			{selectedFrame && (
				<SelectedFrameDetails
					selectedFrame={selectedFrame}
					visibleBoxes={visibleBoxes}
					onClose={() => {
						setSelectedFrame(null);
						setSelectedFrameIndex(null);
					}}
				/>
			)}
			{isModalOpen && (
				<OffsetModal
					offset={boxOffset}
					visibleBoxes={visibleBoxes}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</div>
	);
};

export default React.memo(HistogramManager);
