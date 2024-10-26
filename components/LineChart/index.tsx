"use client";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import styles from "./styles.module.css";
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
	const point = 0.00001; 
	const visibleDataPoints = 200; 
	const visibleClosingPrices = closingPrices.slice(-visibleDataPoints);
	const minY = Math.min(...visibleClosingPrices) - point * 50;
	const maxY = Math.max(...visibleClosingPrices) + point * 50;
	const chartPadding = { top: 20, right: 100, bottom: 40, left: 60 };
	const chartWidth = width - chartPadding.left - chartPadding.right;
	const chartHeight = height - chartPadding.top - chartPadding.bottom;

	const PairName: React.FC<{ pair: string }> = ({ pair }) => {
		const pairName = pair.substring(0, 7).replace(/_/g, "");
		return <div className="text-gray-200 absolute top-4 left-4 text-2xl font-bold uppercase">{pairName}</div>;
	};
	
	useEffect(() => {
		if (candles.length === 0) {
			console.error("Invalid candles data:", candles);
			return;
		}

		const newClosingPrices = candles.map((candle) => candle.close);
		const newTimeData = candles.map((candle) => new Date(candle.time).getTime());

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
			visibleDataPoints={visibleDataPoints} 
		/>
	), [closingPrices, timeData, minY, maxY, chartWidth, chartHeight, pair, candles, visibleDataPoints]);

	if (closingPrices.length === 0) {
		return <div>Loading...</div>;
	}

	return (
		<div className="h-full bg-black overflow-hidden border border-[#181818] relative w-full">
			<PairName pair={pair} />
			<svg
				ref={svgRef}
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
			>
				<g transform={`translate(${chartPadding.left},${chartPadding.top})`}>
					{memoizedChartLine}
					<XAxis 
						timeData={timeData} 
						chartWidth={chartWidth} 
						chartHeight={chartHeight} 
					/>
					<g transform={`translate(${chartWidth}, 0)`}>
						<YAxis 
							minY={minY} 
							maxY={maxY} 
							point={point} 
							chartHeight={chartHeight} 
						/>
					</g>
				</g>
			</svg>
		</div>
	);
};

export default RthmnVision;

const ChartLine: React.FC<{
	closingPrices: number[];
	timeData: number[];
	minY: number;
	maxY: number;
	width: number;
	height: number;
	pair: string;
	candles: { time: string }[];
	visibleDataPoints: number;
}> = React.memo(({
	closingPrices,
	timeData,
	minY,
	maxY,
	width,
	height,
	pair,
	candles,
	visibleDataPoints,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [hoverPrice, setHoverPrice] = useState<number | null>(null);
	const [isHoveringLine, setIsHoveringLine] = useState(false);
	const [hoverPosition, setHoverPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [hoverTime, setHoverTime] = useState<string | null>(null);

	const rightMargin = 200;

	const calculatePathData = useCallback(() => {
		if (closingPrices.length === 0) return '';
		
		const dataToShow = closingPrices.slice(-visibleDataPoints);
		const xScale = (width - rightMargin) / (dataToShow.length - 1);
		const yScale = height / (maxY - minY);
		
		return dataToShow
			.map((price, index) => {
				const x = index * xScale;
				const y = height - (price - minY) * yScale;
				return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
			})
			.join(' ');
	}, [closingPrices, minY, maxY, width, height, visibleDataPoints, rightMargin]);

	const calculateCurrentPricePosition = useCallback(() => {
		if (closingPrices.length === 0) return { x: 0, y: 0 };
		const currentPrice = closingPrices[closingPrices.length - 1];
		const x = width - rightMargin;
		const y = height - ((currentPrice - minY) / (maxY - minY)) * height;
		return { x, y };
	}, [closingPrices, minY, maxY, width, height, rightMargin]);

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
				pathData={calculatePathData()}
				currentPricePosition={calculateCurrentPricePosition()}
				hoverPosition={hoverPosition}
				hoverPrice={hoverPrice}
				hoverTime={hoverTime}
				chartHeight={height}
				chartWidth={width}
			/>
		</ChartContainer>
	);
});

const ChartContainer: React.FC<{
	svgRef: React.RefObject<SVGSVGElement | null>;
	chartWidth: number;
	chartHeight: number;
	handleMouseMove: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
	handleMouseLeave: () => void;
	children: React.ReactNode;
}> = ({
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
			className="w-full h-full bg-gray-800"
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

export const XAxis: React.FC<{
	timeData: number[];
	chartWidth: number;
	chartHeight: number;
}> = ({ timeData, chartWidth, chartHeight }) => {
	const tickCount = 5;
	const ticks = timeData.filter((_, i) => i % Math.floor(timeData.length / tickCount) === 0);

	return (
		<g className="x-axi" transform={`translate(0, ${chartHeight})`}>
			<line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#333" />
			{ticks.map((time, i) => (
				<g key={time} transform={`translate(${(i / (tickCount - 1)) * chartWidth}, 0)`}>
					<line y2={6} stroke="#333" />
					<text
						y={20}
						textAnchor="middle"
						fill="#fff"
						fontSize="12"
					>
						{new Date(time).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</text>
				</g>
			))}
		</g>
	);
};

export const YAxis: React.FC<{
	minY: number;
	maxY: number;
	point: number;
	chartHeight: number;
}> = ({ minY, maxY, point, chartHeight }) => {
	const steps = 5;
	const range = maxY - minY;
	const stepSize = range / steps;

	return (
		<g className="y-axis">
			<line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#333" />
			{Array.from({ length: steps + 1 }, (_, i) => {
				const value = maxY - i * stepSize;
				return (
					<g key={i} transform={`translate(0, ${(i / steps) * chartHeight})`}>
						<line x2={6} stroke="#333" />
						<text
							x={10}
							y={4}
							textAnchor="start"
							fill="#fff"
							fontSize="12"
						>
							{value.toFixed(point < 0.01 ? 5 : 2)}
						</text>
					</g>
				);
			})}
		</g>
	);
};

const ChartPathPriceOnHover: React.FC<{
	hoverPosition: { x: number; y: number };
	hoverPrice: number;
	hoverTime: string;
	chartHeight: number;
}> = ({ hoverPosition, hoverPrice, hoverTime, chartHeight }) => {
	return (
		<>
			<line x1={hoverPosition.x} y1={0} x2={hoverPosition.x} y2={chartHeight} className="stroke-[#555]" strokeWidth="1" />
			<line
				x1={hoverPosition.x}
				y1={hoverPosition.y}
				x2={hoverPosition.x}
				y2={hoverPosition.y - 15}
				className="stroke-[#222]"
				strokeWidth="2"
			/>
			<foreignObject
				x={hoverPosition.x - 40}
				y={hoverPosition.y - 55}
				width="80"
				height="40"
				className="transition-opacity duration-300"
			>
				<div className="bg-[#181818] border border-[#222] py-2 rounded-[.25rem] text-white text-sm font-bold shadow-lg flex justify-center items-center">
					{hoverPrice.toFixed(5)}
				</div>
			</foreignObject>
			<circle cx={hoverPosition.x} cy={hoverPosition.y} r="5" className="fill-white z-[1000]" />
			<foreignObject x={hoverPosition.x - 30} y={chartHeight - 30} width="60" height="20" className="transition-opacity duration-300">
				<div className="bg-[#181818] border border-[#222] py-1 rounded-[.25rem] text-white text-xs font-bold shadow-lg flex justify-center items-center">
					{hoverTime}
				</div>
			</foreignObject>
		</>
	);
};

const ChartPath: React.FC<{
	isHoveringLine: boolean;
	pathData: string;
	currentPricePosition: { x: number; y: number };
	hoverPosition: { x: number; y: number } | null;
	hoverPrice: number | null;
	hoverTime: string | null;
	chartHeight: number;
	chartWidth: number;
}> = ({
	isHoveringLine,
	pathData,
	currentPricePosition,
	hoverPosition,
	hoverPrice,
	hoverTime,
	chartHeight,
	chartWidth,
}) => {
	return (
		<g>
			<clipPath id="chart-area">
				<rect x="0" y="0" width={chartWidth} height={chartHeight} />
			</clipPath>
			<g clipPath="url(#chart-area)">
				<path
					d={pathData}
					fill="none"
					stroke="white"
					strokeWidth={isHoveringLine ? 2 : 1.5}
					opacity={isHoveringLine ? 0.5 : 1}
				/>
				<line
					x1={currentPricePosition.x}
					y1={0}
					x2={currentPricePosition.x}
					y2={chartHeight}
					stroke="white"
					strokeWidth="1"
					strokeDasharray="5,5"
				/>
				<circle
					cx={currentPricePosition.x}
					cy={currentPricePosition.y}
					r="4"
					fill="white"
				/>
				<circle cx={currentPricePosition.x} cy={currentPricePosition.y} r="5" className={styles.chartDot} />
				<circle
					cx={currentPricePosition.x}
					cy={currentPricePosition.y}
					r="5"
					className={`${styles.chartDot} ${styles.pulsingCircle}`}
				/>
				<circle
					cx={currentPricePosition.x}
					cy={currentPricePosition.y}
					r="5"
					className={`${styles.chartDot} ${styles.pulsingCircle}`}
				/>

				{hoverPosition && hoverPrice !== null && hoverTime !== null && (
					<ChartPathPriceOnHover
						hoverPosition={hoverPosition}
						hoverPrice={hoverPrice}
						hoverTime={hoverTime}
						chartHeight={chartHeight}
					/>
				)}
			</g>
		</g>
	);
};