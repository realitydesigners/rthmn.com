import React, { useMemo, useRef, useEffect, useState } from "react";
import type { Box } from "@/types";

const COLORS = {
	GREEN: {
		DARK: "#001a1a",
		MEDIUM: "#0a4d45",
		LIGHT: "#22FFE7",
		DOT: "#000",
		GRID: "#000",
	},
	RED: {
		DARK: "#1a0000",
		MEDIUM: "#7a162f",
		LIGHT: "#FF6E86",
		DOT: "#000",
		GRID: "#000",
	},
	NEUTRAL: {
		DARK: "#1a1a1a",
		MEDIUM: "#333333",
		LIGHT: "#888888",
		DOT: "#888888",
		GRID: "#444444",
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

const PulseWave: React.FC<{
	meetingPoints: { x: number; y: number }[];
	colors: typeof COLORS.GREEN | typeof COLORS.RED | typeof COLORS.NEUTRAL;
	height: number;
	sliceWidth: number;
	isGreen: boolean;
}> = ({ meetingPoints, colors, height, sliceWidth, isGreen }) => {
	const pathData = meetingPoints.reduce((acc, point, index, array) => {
		if (index === 0) {
			return `M ${point.x} ${isGreen ? 0 : height} L ${point.x} ${point.y}`;
		}
		const prevPoint = array[index - 1];
		const midX = (prevPoint.x + point.x) / 2;
		return `${acc} 
      L ${midX} ${prevPoint.y} 
      L ${midX} ${point.y} 
      L ${point.x} ${point.y}`;
	}, "");

	const gradientId = isGreen ? "pulseGradientGreen" : "pulseGradientRed";

	return (
		<g>
			<defs>
				<linearGradient
					id={gradientId}
					x1="0%"
					y1={isGreen ? "100%" : "0%"}
					x2="0%"
					y2={isGreen ? "0%" : "100%"}
				>
					<stop offset="0%" stopColor={colors.LIGHT} stopOpacity="0.7" />
					<stop offset="100%" stopColor={colors.LIGHT} stopOpacity="0" />
				</linearGradient>
			</defs>
			<path
				d={`${pathData} L ${sliceWidth} ${isGreen ? 0 : height} Z`}
				fill={`url(#${gradientId})`}
				stroke="none"
			>
				<animate
					attributeName="opacity"
					values="0.7;0.3;0.7"
					dur="2s"
					repeatCount="indefinite"
				/>
			</path>
		</g>
	);
};

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
		if (sortedBoxes.length === 0) return "NEUTRAL";
		const largestBox = sortedBoxes.reduce((max, box) =>
			Math.abs(box.value) > Math.abs(max.value) ? box : max,
		);
		return largestBox.value > 0 ? "GREEN" : "RED";
	}, [sortedBoxes]);

	const colors = COLORS[sectionColor as keyof typeof COLORS];
	const isGreen = sectionColor === "GREEN";

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
				if (start.x === end.x) {
					return (
						start.y +
						((end.y - start.y) * (x - start.x)) / (end.x - start.x + 2)
					);
				}
				const t = (x - start.x) / (end.x - start.x);
				return start.y + t * (end.y - start.y);
			}
		}
		return meetingPointY;
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const drawCanvas = () => {
			ctx.clearRect(0, 0, sliceWidth, height);

			const gradient = ctx.createLinearGradient(0, 0, 0, height);
			gradient.addColorStop(0, colors.DARK);
			gradient.addColorStop(1, colors.MEDIUM);
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, sliceWidth, height);

			ctx.beginPath();
			for (let i = 0; i <= visibleBoxesCount; i++) {
				const y = Math.round(i * boxHeight);
				ctx.moveTo(0, y);
				ctx.lineTo(sliceWidth, y);
			}
			ctx.strokeStyle = colors.GRID;
			ctx.lineWidth = 0.3;
			ctx.stroke();

			sortedBoxes.forEach((box, index) => {
				const y = Math.round(index * boxHeight);

				ctx.beginPath();
				ctx.rect(0, y, sliceWidth, boxHeight);
				ctx.strokeStyle = colors.GRID;
				ctx.lineWidth = 0.3;
				ctx.stroke();

				const rangeHeight =
					((box.high - box.low) / (box.high + Math.abs(box.low))) * boxHeight;
				const rangeY = Math.round(
					box.value > 0 ? y + boxHeight - rangeHeight : y,
				);
				ctx.fillStyle = colors.MEDIUM;
				ctx.fillRect(sliceWidth * 0.25, rangeY, sliceWidth * 0.5, rangeHeight);

				const centerX = sliceWidth / 2;
				const centerY = Math.round(y + boxHeight / 2);
				ctx.beginPath();
				ctx.arc(centerX, centerY, 1, 0, 2 * Math.PI);
				ctx.fillStyle = colors.DOT;
				ctx.fill();
			});
		};

		drawCanvas();

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
				style={{ zIndex: 200, overflow: "visible" }}
			>
				<PulseWave
					meetingPoints={meetingPoints}
					colors={colors}
					height={height}
					sliceWidth={sliceWidth}
					isGreen={isGreen}
				/>
				{prevMeetingPointY !== null && (
					<path
						d={`M ${-sliceWidth / 2} ${prevMeetingPointY} 
                H 0 
                V ${meetingPointY} 
                H ${sliceWidth / 2}`}
						fill="none"
						stroke={colors.LIGHT}
						strokeWidth="4"
						className="transition-all duration-100 ease-in-out"
					>
						<animate
							attributeName="stroke-dashoffset"
							from="0"
							to="20"
							dur="5s"
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
						strokeWidth="4"
						className="transition-all duration-100 ease-in-out"
					>
						<animate
							attributeName="stroke-dashoffset"
							from="0"
							to="20"
							dur="5s"
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
							strokeWidth="2"
							strokeDasharray="4 4"
						>
							<animate
								attributeName="stroke-opacity"
								values="0.5;1;0.5"
								dur="1s"
								repeatCount="indefinite"
							/>
						</line>
						<circle
							cx={hoverPosition.x}
							cy={hoverPosition.y}
							r="4"
							fill={colors.LIGHT}
							style={{
								filter: `drop-shadow(0 0 5px ${colors.LIGHT})`,
							}}
						>
							<animate
								attributeName="r"
								values="4;6;4"
								dur="1s"
								repeatCount="indefinite"
							/>
						</circle>
					</>
				)}
			</svg>
		</div>
	);
};
