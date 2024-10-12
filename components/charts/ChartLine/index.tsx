"use client";
import ChartPath from "../ChartPath";

import { Signal } from "@/types";
import React, { RefObject, useEffect, useRef, useState } from "react";

interface ChartLineProps {
	closingPrices: number[];
	minY: number;
	maxY: number;
	padding?: number;
	rightPadding?: number;
	onPricePositionChange?: (askPosition: { x: number; y: number }, bidPosition: { x: number; y: number }) => void;
	closeoutAsk: number;
	closeoutBid: number;
	tradingSignals?: Signal[];
	pair: string;
	candles: { time: string }[];
}

const ChartLine: React.FC<ChartLineProps> = ({
	closingPrices,
	minY,
	maxY,
	padding = 0,
	rightPadding = 100,
	onPricePositionChange,
	closeoutAsk,
	closeoutBid,
	tradingSignals = [],
	pair,
	candles,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [chartWidth, setChartWidth] = useState(1000);
	const [hoverPrice, setHoverPrice] = useState<number | null>(null);
	const [isHoveringLine, setIsHoveringLine] = useState(false);
	const [hoverPosition, setHoverPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [hoverTime, setHoverTime] = useState<string | null>(null);

	const handleResize = () => {
		if (svgRef.current) {
			const { width } = svgRef.current.getBoundingClientRect();
			setChartWidth(width);
		}
	};

	useEffect(() => {
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const chartHeight = 800;
	const paddedWidth = chartWidth - padding - rightPadding;

	const calculatePathData = () => {
		return closingPrices
			.map((price, index) => {
				const x = (index / (closingPrices.length - 1)) * paddedWidth + padding;
				const y = chartHeight - ((price - minY) / (maxY - minY)) * chartHeight;
				return `${x.toFixed(3)},${y.toFixed(2)}`;
			})
			.join(" L ");
	};

	const calculateCurrentPricePosition = () => {
		const currentPrice = closingPrices[closingPrices.length - 1];
		const x = paddedWidth + padding;
		const y = chartHeight - ((currentPrice - minY) / (maxY - minY)) * chartHeight;
		return { x, y };
	};

	const calculatePricePosition = (price: number) => {
		const y = chartHeight - ((price - minY) / (maxY - minY)) * chartHeight;
		return { x: paddedWidth + padding, y };
	};

	const askPosition = calculatePricePosition(closeoutAsk);
	const bidPosition = calculatePricePosition(closeoutBid);

	useEffect(() => {
		if (onPricePositionChange) {
			onPricePositionChange(askPosition, bidPosition);
		}
	}, [askPosition, bidPosition, onPricePositionChange]);

	const getSignalXPosition = (time: string) => {
		const signalDate = new Date(time).getTime();
		const candleTimes = candles.map((candle) => new Date(candle.time).getTime());
		let closestIndex = candleTimes.findIndex((t) => t >= signalDate);
		if (closestIndex === -1) closestIndex = candleTimes.length - 1;
		return (closestIndex / (candles.length - 1)) * paddedWidth + padding;
	};

	const getSignalYPosition = (price: number) => {
		const yPosition = chartHeight - ((price - minY) / (maxY - minY)) * chartHeight;
		return Math.min(Math.max(yPosition, 0), chartHeight);
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
		const xRatio = (x - padding) / (width - padding - rightPadding);
		const yRatio = 1 - (y - padding) / (height - padding);

		const priceIndex = Math.round(xRatio * (closingPrices.length - 1));
		const hoverYPrice = minY + yRatio * (maxY - minY);

		if (priceIndex >= 0 && priceIndex < closingPrices.length) {
			const price = closingPrices[priceIndex];
			setHoverPrice(price);

			const tolerance = (maxY - minY) / 4;
			if (Math.abs(price - hoverYPrice) < tolerance) {
				setIsHoveringLine(true);
				setHoverPosition({
					x,
					y: chartHeight - ((price - minY) / (maxY - minY)) * chartHeight,
				});
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
			chartWidth={chartWidth}
			chartHeight={chartHeight}
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
				chartHeight={chartHeight}
			/>
		
		</ChartContainer>
	);
};

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

export default ChartLine;
