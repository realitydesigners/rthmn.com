import React, { useMemo, useRef, useEffect } from "react";
import type { Box } from "@/types";

const COLORS = {
	GREEN: {
		DARK: "#023E8A",
		MEDIUM: "#0077B6",
		LIGHT: "#90E0EF",
		DOT: "#015C92",
		GRID: "rgba(0, 119, 182, 0.3)", // Medium blue with opacity for grid
	},
	RED: {
		DARK: "#7D0633",
		MEDIUM: "#B80D57",
		LIGHT: "#FF7096",
		DOT: "#C41E3A",
		GRID: "rgba(184, 13, 87, 0.3)", // Medium red with opacity for grid
	},
	GRAY: {
		DARK: "#2B2D42",
		MEDIUM: "#8D99AE",
		LIGHT: "#EDF2F4",
		DOT: "#4A4E69",
		GRID: "rgba(141, 153, 174, 0.3)", // Medium gray with opacity for grid
	},
};

interface OscillatorProps {
	boxArray: Box[];
	height: number;
	visibleBoxesCount: number;
	meetingPointY: number;
	prevMeetingPointY: number | null;
	nextMeetingPointY: number | null;
	sliceWidth: number;
}

export const Oscillator: React.FC<OscillatorProps> = ({
	boxArray,
	height,
	visibleBoxesCount,
	meetingPointY,
	prevMeetingPointY,
	nextMeetingPointY,
	sliceWidth,
}) => {
	const boxHeight = height / visibleBoxesCount;
	const sortedBoxes = boxArray.slice(0, visibleBoxesCount);

	const sectionColor = useMemo(() => {
		if (sortedBoxes.length === 0) return "gray";
		const largestBox = sortedBoxes.reduce((max, box) =>
			Math.abs(box.value) > Math.abs(max.value) ? box : max,
		);
		return largestBox.value > 0 ? "green" : "red";
	}, [sortedBoxes]);

	const colors = COLORS[sectionColor.toUpperCase() as keyof typeof COLORS];

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, sliceWidth, height);

		// Draw background gradient
		const gradient = ctx.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, colors.DARK);
		gradient.addColorStop(1, colors.MEDIUM);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, sliceWidth, height);

		// Draw grid
		ctx.beginPath();
		for (let i = 0; i <= visibleBoxesCount; i++) {
			const y = i * boxHeight;
			ctx.moveTo(0, y);
			ctx.lineTo(sliceWidth, y);
		}
		ctx.strokeStyle = colors.GRID;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Draw boxes
		sortedBoxes.forEach((box, index) => {
			const y = index * boxHeight;

			// Draw box border using GRID color
			ctx.beginPath();
			ctx.rect(0, y, sliceWidth, boxHeight);
			ctx.strokeStyle = colors.GRID;
			ctx.lineWidth = 1;
			ctx.stroke();

			// Draw high-low range
			const rangeHeight =
				((box.high - box.low) / (box.high + Math.abs(box.low))) * boxHeight;
			const rangeY = box.value > 0 ? y + boxHeight - rangeHeight : y;
			ctx.fillStyle = colors.MEDIUM;
			ctx.fillRect(sliceWidth * 0.25, rangeY, sliceWidth * 0.5, rangeHeight);

			// Draw center point
			const centerX = sliceWidth / 2;
			const centerY = y + boxHeight / 2;
			ctx.beginPath();
			ctx.arc(centerX, centerY, 1, 0, 2 * Math.PI);
			ctx.fillStyle = colors.DOT;
			ctx.fill();
		});
	}, [
		boxArray,
		height,
		sliceWidth,
		boxHeight,
		colors,
		visibleBoxesCount,
		sortedBoxes,
	]);

	return (
		<div
			className="relative overflow-hidden"
			style={{
				width: sliceWidth,
				height: `${height}px`,
			}}
		>
			<canvas
				ref={canvasRef}
				width={sliceWidth}
				height={height}
				className="absolute inset-0"
			/>

			<svg
				className="pointer-events-none absolute left-0 top-0 h-full w-full"
				style={{ zIndex: 2, overflow: "visible" }}
			>
				{prevMeetingPointY !== null && (
					<path
						d={`M ${-sliceWidth / 2} ${prevMeetingPointY} 
                H 0 
                V ${meetingPointY} 
                H ${sliceWidth / 2}`}
						fill="none"
						stroke={colors.LIGHT}
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="transition-all duration-300 ease-in-out"
					>
						<animate
							attributeName="stroke-dashoffset"
							from="0"
							to="20"
							dur="2s"
							repeatCount="indefinite"
						/>
					</path>
				)}
				{nextMeetingPointY !== null && (
					<path
						d={`M ${sliceWidth / 2} ${meetingPointY} 
                H ${sliceWidth} 
                V ${nextMeetingPointY} 
                H ${sliceWidth * 1.5}`}
						fill="none"
						stroke={colors.LIGHT}
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="transition-all duration-300 ease-in-out"
					>
						<animate
							attributeName="stroke-dashoffset"
							from="0"
							to="20"
							dur="2s"
							repeatCount="indefinite"
						/>
					</path>
				)}
			</svg>
		</div>
	);
};
