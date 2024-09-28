import React, { useMemo, useRef, useEffect } from "react";
import type { Box } from "@/types";

const COLORS = {
	GREEN: {
		DARK: "#023E8A", // Deep blue-green
		LIGHT: "#0077B6", // Brighter blue-green
		LINE: "#90E0EF", // Light cyan for the line
		DOT: "#015C92", // Darker cyan for the dot
	},
	RED: {
		DARK: "#7D0633", // Deep burgundy
		LIGHT: "#B80D57", // Brighter burgundy
		LINE: "#FF7096", // Light pink for the line
		DOT: "#C41E3A", // Darker red for the dot
	},
	GRAY: {
		DARK: "#2B2D42", // Dark slate
		LIGHT: "#8D99AE", // Cool gray
		LINE: "#EDF2F4", // Very light gray-blue for the line
		DOT: "#4A4E69", // Darker gray for the dot
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
	const positiveBoxes = sortedBoxes.filter((box) => box.value > 0);
	const negativeBoxes = sortedBoxes.filter((box) => box.value <= 0);

	let positiveOffset = 0;
	let negativeOffset = 0;

	const width = sliceWidth;
	const sectionColor = useMemo(() => {
		if (sortedBoxes.length === 0) {
			return "gray";
		}
		const largestBox = sortedBoxes.reduce((max, box) =>
			Math.abs(box.value) > Math.abs(max.value) ? box : max,
		);
		return largestBox.value > 0 ? "green" : "red";
	}, [sortedBoxes]);

	const colors = useMemo(() => {
		return COLORS[sectionColor.toUpperCase() as keyof typeof COLORS];
	}, [sectionColor]);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, width, height);

		const drawBox = (box: Box, y: number, isPositive: boolean) => {
			ctx.beginPath();
			ctx.rect(0, y, width, boxHeight);
			ctx.strokeStyle = colors.LIGHT;
			ctx.stroke();

			// Draw high-low range
			const rangeHeight =
				((box.high - box.low) / (box.high + Math.abs(box.low))) * boxHeight;
			const rangeY = isPositive ? y + boxHeight - rangeHeight : y;
			ctx.fillStyle = colors.LIGHT;
			ctx.fillRect(width * 0.25, rangeY, width * 0.5, rangeHeight);

			// Draw center point
			const centerX = width / 2;
			const centerY = y + boxHeight / 2;
			ctx.beginPath();
			ctx.arc(centerX, centerY, 0.5, 0, 2 * Math.PI);
			ctx.fillStyle = colors.DOT;
			ctx.fill();
		};

		negativeBoxes.forEach((box) => {
			drawBox(box, negativeOffset, false);
			negativeOffset += boxHeight;
		});

		positiveBoxes.forEach((box) => {
			drawBox(box, height - positiveOffset - boxHeight, true);
			positiveOffset += boxHeight;
		});
	}, [
		boxArray,
		height,
		width,
		boxHeight,
		colors,
		positiveBoxes,
		negativeBoxes,
	]);

	return (
		<div
			className="relative overflow-hidden"
			style={{
				width: width,
				height: `${height}px`,
			}}
		>
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom, ${colors.LIGHT}, ${colors.DARK})`,
					opacity: 0.7,
				}}
			/>

			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				className="absolute inset-0"
			/>

			<svg
				className="pointer-events-none absolute left-0 top-0 h-full w-full"
				style={{ zIndex: 2, overflow: "visible" }}
			>
				{prevMeetingPointY !== null && (
					<path
						d={`M ${-width / 2} ${prevMeetingPointY} 
                H 0 
                V ${meetingPointY} 
                H ${width / 2}`}
						fill="none"
						stroke={colors.LINE}
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
						d={`M ${width / 2} ${meetingPointY} 
                H ${width} 
                V ${nextMeetingPointY} 
                H ${width * 1.5}`}
						fill="none"
						stroke={colors.LINE}
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
