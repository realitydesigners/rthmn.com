"use client";

import { CandleData, Signal } from "@/types";
import React, { RefObject, useEffect, useRef, useState } from "react";

interface CandleChartProps {
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
	candles: CandleData[];
}

const CandleChart: React.FC<CandleChartProps> = ({
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

	const calculateCandleData = () => {
		return candles.map((candle, index) => {
			const x = (index / (candles.length - 1)) * paddedWidth + padding;
			const openY = chartHeight - ((parseFloat(candle.mid.o) - minY) / (maxY - minY)) * chartHeight;
			const closeY = chartHeight - ((parseFloat(candle.mid.c) - minY) / (maxY - minY)) * chartHeight;
			const highY = chartHeight - ((parseFloat(candle.mid.h) - minY) / (maxY - minY)) * chartHeight;
			const lowY = chartHeight - ((parseFloat(candle.mid.l) - minY) / (maxY - minY)) * chartHeight;
			return { x, openY, closeY, highY, lowY };
		});
	};

	const candleData = calculateCandleData();

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
	}, [askPosition, bidPosition, onPricePositionChange, minY, maxY, chartHeight, paddedWidth, padding, rightPadding]);



	return (
		<ChartContainer svgRef={svgRef} chartWidth={chartWidth} chartHeight={chartHeight}>
			{candleData.map((candle, index) => (
				<g key={`${candle.x}-${index}`} transform={`translate(${candle.x}, 0)`}>
					<line x1={0} y1={candle.highY} x2={0} y2={candle.lowY} stroke={candle.openY > candle.closeY ? "#666" : "#444"} />
					<rect
						x={-2.5}
						y={Math.min(candle.openY, candle.closeY)}
						width={5}
						height={Math.abs(candle.openY - candle.closeY)}
						fill={candle.openY > candle.closeY ? "#666" : "#444"}
					/>
				</g>
			))}

		
		</ChartContainer>
	);
};

interface ChartContainerProps {
	svgRef: RefObject<SVGSVGElement>;
	chartWidth: number;
	chartHeight: number;
	children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ svgRef, chartWidth, chartHeight, children }) => {
	return (
		<svg ref={svgRef} className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
			<title>Rthmn Vision</title>
			{children}
		</svg>
	);
};

export default CandleChart;
