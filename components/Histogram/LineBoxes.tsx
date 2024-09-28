import React, { useMemo } from "react";
import type { BoxSlice } from "@/types";

interface LineBoxesProps {
	boxArray: BoxSlice["boxes"];
	isSelected: boolean;
	height: number;
	visibleBoxesCount: number;
	zoomedBarWidth: number;
	initialBarWidth: number;
	meetingPointY: number;
	prevMeetingPointY: number | null;
	nextMeetingPointY: number | null;
	sliceWidth: number;
}

export const LineBoxes: React.FC<LineBoxesProps> = ({
	boxArray,
	isSelected,
	height,
	visibleBoxesCount,
	zoomedBarWidth,
	initialBarWidth,
	meetingPointY,
	prevMeetingPointY,
	nextMeetingPointY,
	sliceWidth,
}) => {
	const boxHeight = height / visibleBoxesCount;
	const sortedBoxes = boxArray.slice(0, visibleBoxesCount);

	const sectionColor = useMemo(() => {
		if (sortedBoxes.length === 0) {
			return "gray";
		}
		const largestBox = sortedBoxes.reduce((max, box) =>
			Math.abs(box.value) > Math.abs(max.value) ? box : max,
		);
		return largestBox.value > 0 ? "green" : "red";
	}, [sortedBoxes]);

	const gradientId = `gradient-${sectionColor}-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<div
			className="relative"
			style={{
				width: sliceWidth,
				height: `${height}px`,
			}}
		>
			<svg className="absolute inset-0 h-full w-full">
				<defs>
					<linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
						<stop
							offset="0%"
							stopColor={sectionColor === "green" ? "#46FFF9" : "#FF4646"}
							stopOpacity="0.6"
						/>
						<stop
							offset="100%"
							stopColor={sectionColor === "green" ? "#46FFF9" : "#FF4646"}
							stopOpacity="0.1"
						/>
					</linearGradient>
				</defs>
				<rect width="100%" height="100%" fill={`url(#${gradientId})`} />
			</svg>

			{sortedBoxes.map((box, idx) => (
				<div
					key={idx}
					className="absolute w-full border border-black"
					style={{
						top: `${idx * boxHeight}px`,
						height: `${boxHeight}px`,
					}}
				>
					<div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gray-400" />
				</div>
			))}

			<svg
				className="pointer-events-none absolute left-0 top-0 h-full w-full"
				style={{ zIndex: 1, overflow: "visible" }}
			>
				{prevMeetingPointY !== null && (
					<line
						x1={-sliceWidth / 2}
						y1={prevMeetingPointY}
						x2={sliceWidth / 2}
						y2={meetingPointY}
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				)}
				{nextMeetingPointY !== null && (
					<line
						x1={sliceWidth / 2}
						y1={meetingPointY}
						x2={sliceWidth + sliceWidth / 2}
						y2={nextMeetingPointY}
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				)}
			</svg>
		</div>
	);
};
