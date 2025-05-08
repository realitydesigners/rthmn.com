import type { BoxColors } from "@/stores/colorStore";
import React, { memo } from "react";
import type { PriceLine } from "./types";

type Point = [number, number];

// Gradient definitions component
export const ChartGradients = ({ boxColors }: { boxColors: BoxColors }) => (
	<defs>
		<linearGradient id="positiveGradient" x1="0" y1="1" x2="0" y2="0">
			<stop offset="0%" stopColor={boxColors.positive} stopOpacity="0.1" />
			<stop offset="100%" stopColor={boxColors.positive} stopOpacity="0.3" />
		</linearGradient>
		<linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor={boxColors.negative} stopOpacity="0.1" />
			<stop offset="100%" stopColor={boxColors.negative} stopOpacity="0.3" />
		</linearGradient>
	</defs>
);

// Price line component
export const PriceLines = ({
	priceLines,
	boxColors,
}: { priceLines: PriceLine[]; boxColors: BoxColors }) => (
	<>
		{priceLines.map((line, index) => (
			<g key={`line-${index}`}>
				<line
					x1={!isNaN(line.x1) ? line.x1 : 0}
					y1={!isNaN(line.y) ? line.y : 0}
					x2={line.x2}
					y2={!isNaN(line.y) ? line.y : 0}
					stroke={line.isPositive ? boxColors.positive : boxColors.negative}
					strokeWidth="2"
					strokeOpacity="0.05"
				/>
				<line
					x1={!isNaN(line.x1) ? line.x1 : 0}
					y1={!isNaN(line.y) ? line.y : 0}
					x2={line.x2}
					y2={!isNaN(line.y) ? line.y : 0}
					stroke={line.isPositive ? boxColors.positive : boxColors.negative}
					strokeWidth=".5"
					strokeDasharray="2,4"
					strokeOpacity="0.3"
				/>
			</g>
		))}
	</>
);

// Chart segments component
export const ChartSegments = ({
	points,
	priceLines,
	boxColors,
}: { points: Point[]; priceLines: PriceLine[]; boxColors: BoxColors }) => (
	<>
		{points.map(([x, y], index, arr) => {
			if (index === arr.length - 1) return null;
			const nextPoint = arr[index + 1];
			const isUp = y > nextPoint[1];
			const gradientColor = isUp
				? "url(#positiveGradient)"
				: "url(#negativeGradient)";

			const currentPriceLine = priceLines.find(
				(line) => Math.abs(line.y - y) < 1,
			);
			const nextPriceLine = priceLines.find(
				(line) => Math.abs(line.y - nextPoint[1]) < 1,
			);
			const endX = Math.max(
				currentPriceLine?.x2 ?? x,
				nextPriceLine?.x2 ?? nextPoint[0],
			);

			return (
				<path
					key={`segment-${index}`}
					d={`M ${x},${y} L ${nextPoint[0]},${nextPoint[1]} L ${endX},${nextPoint[1]} L ${endX},${y} Z`}
					fill={gradientColor}
					opacity="1.5"
				/>
			);
		})}
	</>
);

// Chart points component
export const ChartPoints = ({
	points,
	boxColors,
	prices,
	digits = 5,
}: {
	points: Point[];
	boxColors: BoxColors;
	prices: number[];
	digits?: number;
}) => {
	const pathData = points.reduce((acc, [x, y], index) => {
		return index === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
	}, "");

	return (
		<>
			<path
				d={pathData}
				fill="none"
				stroke="white"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{points.map(([x, y], index) => (
				<g key={`point-${index}`}>
					<circle
						cx={!isNaN(x) ? x : 0}
						cy={!isNaN(y) ? y : 0}
						r="4"
						fill="white"
					/>
					<text
						x={!isNaN(x) ? x + 8 : 0}
						y={!isNaN(y) ? y + 4 : 0}
						fill="white"
						fontSize="11"
						fontFamily="monospace"
						textAnchor="start"
					>
						{prices[index].toFixed(digits)}
					</text>
				</g>
			))}
		</>
	);
};

// Price sidebar component
export const PriceSidebar = ({
	priceLines,
	boxColors,
	digits = 5,
}: { priceLines: PriceLine[]; boxColors: BoxColors; digits?: number }) => (
	<div className="relative w-18 border-l border-[#0A0B0D] pl-2">
		{priceLines.map((line, index) => (
			<div
				key={`price-${index}`}
				className="absolute left-0 w-full pl-2 font-mono text-[10px] text-white"
				style={{
					top: !isNaN(line.y) ? line.y - 6 : 0,
				}}
			>
				{line.price.toFixed(digits)}
			</div>
		))}
	</div>
);
