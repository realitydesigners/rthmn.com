import React, { useMemo, useRef, useEffect, useState } from "react";
import type { Box } from "@/types";

const COLORS = {
	GREEN: {
		DARK: "#000",
		MEDIUM: "#116B61",
		LIGHT: "#22FFE7",
		DOT: "#116B61",
		GRID: "#116B61",
	},
	RED: {
		DARK: "#000",
		MEDIUM: "#A01D3E",
		LIGHT: "#FF6E86",
		DOT: "#A01D3E",
		GRID: "#A01D3E",
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
	const [hoverPosition, setHoverPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
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
	const containerRef = useRef<HTMLDivElement>(null);

	const meetingPoints = useMemo(() => {
		return [
			{ x: -sliceWidth / 2, y: prevMeetingPointY ?? meetingPointY },
			{ x: 0, y: prevMeetingPointY ?? meetingPointY },
			{ x: 0, y: meetingPointY },
			{ x: sliceWidth / 2, y: meetingPointY },
			{ x: sliceWidth, y: meetingPointY },
			{ x: sliceWidth, y: nextMeetingPointY ?? meetingPointY },
			{ x: sliceWidth * 1.5, y: nextMeetingPointY ?? meetingPointY },
		];
	}, [prevMeetingPointY, meetingPointY, nextMeetingPointY, sliceWidth]);

	const interpolateY = (x: number) => {
		for (let i = 0; i < meetingPoints.length - 1; i++) {
			const start = meetingPoints[i];
			const end = meetingPoints[i + 1];
			if (x >= start.x && x <= end.x) {
				// If it's a vertical line segment
				if (start.x === end.x) {
					return (
						start.y +
						((end.y - start.y) * (x - start.x)) / (end.x - start.x + 0.001)
					);
				}
				// For horizontal or sloped segments
				const t = (x - start.x) / (end.x - start.x);
				return start.y + t * (end.y - start.y);
			}
		}
		return meetingPointY; // fallback
	};

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
			ctx.arc(centerX, centerY, 1, 0, 1 * Math.PI);
			ctx.fillStyle = colors.DOT;
			ctx.fill();
		});

		// Add event listeners for mouse interactions
		const handleMouseMove = (e: MouseEvent) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (rect) {
				const x = e.clientX - rect.left;
				const y = interpolateY(x);
				setHoverPosition({ x, y });
			}
		};

		const handleMouseLeave = () => {
			setHoverPosition(null);
		};

		containerRef.current?.addEventListener("mousemove", handleMouseMove);
		containerRef.current?.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			containerRef.current?.removeEventListener("mousemove", handleMouseMove);
			containerRef.current?.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [
		boxArray,
		height,
		sliceWidth,
		boxHeight,
		colors,
		visibleBoxesCount,
		sortedBoxes,
		meetingPoints,
	]);

	return (
		<div
			ref={containerRef}
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

				{hoverPosition && (
					<>
						<line
							x1={hoverPosition.x}
							y1={0}
							x2={hoverPosition.x}
							y2={height}
							stroke={colors.LIGHT}
							strokeWidth="1"
							strokeDasharray="4 4"
						/>
						<circle
							cx={hoverPosition.x}
							cy={hoverPosition.y}
							r="4"
							fill={colors.LIGHT}
							style={{
								zIndex: 1000,
								filter: `drop-shadow(0 0 3px ${colors.LIGHT})`,
							}}
						/>
					</>
				)}
			</svg>
		</div>
	);
};
