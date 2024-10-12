"use client";
import { XAxis, YAxis } from "../Axis";
import ChartPath from "../ChartPath";
import PairName from "../PairName";
import React, { useCallback, RefObject, useEffect, useRef, useState, useMemo } from "react";
import { Candle } from "@/types";

const RthmnVision: React.FC<{
	pair: string;
	candles: Candle[];
	width: number;
	height: number;
}> = ({ pair, candles, width, height }) => {
	const [closingPrices, setClosingPrices] = useState<number[]>([]);
	const [timeData, setTimeData] = useState<number[]>([]);

	const svgRef = useRef<SVGSVGElement>(null);

	const point = 0.00001; // Default point value, adjust as needed

	const minY = Math.min(...closingPrices) - point * 50;
	const maxY = Math.max(...closingPrices) + point * 50;

	const chartPadding = { top: 20, right: 50, bottom: 30, left: 50 };
	const chartWidth = width - chartPadding.left - chartPadding.right;
	const chartHeight = height - chartPadding.top - chartPadding.bottom;

	useEffect(() => {
		if (candles.length === 0) {
			console.error("Invalid candles data:", candles);
			return;
		}

		const newClosingPrices = candles.map((candle) => candle.close);
		const newTimeData = candles.map((candle) => new Date(candle.timestamp).getTime());

		setClosingPrices(newClosingPrices);
		setTimeData(newTimeData);
	}, [candles]);

	const memoizedChartLine = useMemo(() => (
		<ChartLine
			closingPrices={closingPrices}
			timeData={timeData}
			minY={minY}
			maxY={maxY}
			width={chartWidth}
			height={chartHeight}
			pair={pair}
			candles={candles}
		/>
	), [closingPrices, timeData, minY, maxY, chartWidth, chartHeight, pair, candles]);

	if (closingPrices.length === 0) {
		return <div>Loading...</div>;
	}

	return (
		<div className="h-full bg-black overflow-hidden border border-[#181818] relative w-full">
			<PairName pair={pair} />
			<div className="flex-1 relative">
				<svg
					ref={svgRef}
					width={width}
					height={height}
					viewBox={`0 0 ${width} ${height}`}
				>
					<g transform={`translate(${chartPadding.left},${chartPadding.top})`}>
						{memoizedChartLine}
						<XAxis timeData={timeData} chartWidth={chartWidth} chartHeight={chartHeight} />
						<YAxis minY={minY} maxY={maxY} point={point} chartHeight={chartHeight} />
					</g>
				</svg>
			</div>
		</div>
	);
};

export default RthmnVision;

interface ChartLineProps {
	closingPrices: number[];
	timeData: number[];
	minY: number;
	maxY: number;
	width: number;
	height: number;
	pair: string;
	candles: { time: string }[];
}

const ChartLine: React.FC<ChartLineProps> = React.memo(({
	closingPrices,
	timeData,
	minY,
	maxY,
	width,
	height,
	pair,
	candles,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [hoverPrice, setHoverPrice] = useState<number | null>(null);
	const [isHoveringLine, setIsHoveringLine] = useState(false);
	const [hoverPosition, setHoverPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [hoverTime, setHoverTime] = useState<string | null>(null);

	const calculatePathData = () => {
		return closingPrices
			.map((price, index) => {
				const x = (index / (closingPrices.length - 1)) * width;
				const y = height - ((price - minY) / (maxY - minY)) * height;
				return `${x.toFixed(3)},${y.toFixed(2)}`;
			})
			.join(" L ");
	};

	const calculateCurrentPricePosition = () => {
		const currentPrice = closingPrices[closingPrices.length - 1];
		const x = width;
		const y = height - ((currentPrice - minY) / (maxY - minY)) * height;
		return { x, y };
	};

	const handleMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
		const { left, width, top, height } = svgRef.current?.getBoundingClientRect() || {
			left: 0,
			width: 1,
			top: 0,
			height: 1,
		};
		const x = event.clientX - left;
		const y = event.clientY - top;
		const xRatio = x / width;
		const yRatio = 1 - y / height;

		const priceIndex = Math.round(xRatio * (closingPrices.length - 1));
		const hoverYPrice = minY + yRatio * (maxY - minY);

		if (priceIndex >= 0 && priceIndex < closingPrices.length) {
			const price = closingPrices[priceIndex];
			setHoverPrice(price);

			const tolerance = (maxY - minY) / 20;
			if (Math.abs(price - hoverYPrice) < tolerance) {
				setIsHoveringLine(true);
				setHoverPosition({ x, y });
				const hoverTime = new Date(candles[priceIndex].time).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
				setHoverTime(hoverTime);
			} else {
				setIsHoveringLine(false);
				setHoverPosition(null);
				setHoverTime(null);
			}
		} else {
			setHoverPrice(null);
			setIsHoveringLine(false);
			setHoverPosition(null);
			setHoverTime(null);
		}
	};

	const handleMouseLeave = () => {
		setHoverPrice(null);
		setIsHoveringLine(false);
		setHoverPosition(null);
		setHoverTime(null);
	};

	return (
		<ChartContainer
			svgRef={svgRef}
			chartWidth={width}
			chartHeight={height}
			handleMouseMove={handleMouseMove}
			handleMouseLeave={handleMouseLeave}
		>
			<ChartPath
				isHoveringLine={isHoveringLine}
				calculatePathData={calculatePathData}
				calculateCurrentPricePosition={calculateCurrentPricePosition}
				hoverPosition={hoverPosition}
				hoverPrice={hoverPrice}
				hoverTime={hoverTime}
				chartHeight={height}
			/>
		</ChartContainer>
	);
});

interface ChartContainerProps {
	svgRef: RefObject<SVGSVGElement>;
	chartWidth: number;
	chartHeight: number;
	handleMouseMove: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
	handleMouseLeave: () => void;
	children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
	svgRef,
	chartWidth,
	chartHeight,
	handleMouseMove,
	handleMouseLeave,
	children,
}) => {
	return (
		<svg
			ref={svgRef}
			className="w-full h-full"
			viewBox={`0 0 ${chartWidth} ${chartHeight}`}
			preserveAspectRatio="none"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			<title>Rthmn Vision</title>
			{children}
		</svg>
	);
};
