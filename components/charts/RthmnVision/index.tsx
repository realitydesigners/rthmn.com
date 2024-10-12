"use client";
import { XAxis, YAxis } from "../Axis";
import CandleChart from "../CandleChart";
import ChartLine from "../ChartLine";
import CurrentSpread from "../CurrentSpread";
import PairName from "../PairName";
import Toolbar from "../Toolbar";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Candle } from "@/types";

const RthmnVision: React.FC<{
	pair: string;
	timeInterval: string;
	setTimeInterval: (interval: string) => void;
	closeoutAsk: number | null;
	closeoutBid: number | null;
	setCloseoutAsk: (value: number | null) => void;
	setCloseoutBid: (value: number | null) => void;
	candles: Candle[];
}> = ({ pair, timeInterval, setTimeInterval, closeoutAsk, closeoutBid, setCloseoutAsk, setCloseoutBid, candles }) => {
	const [closingPrices, setClosingPrices] = useState<number[]>([]);
	const [timeData, setTimeData] = useState<number[]>([]);
	const [askPosition, setAskPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const [bidPosition, setBidPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const [chartType, setChartType] = useState<string>("line");

	const svgRef = useRef<SVGSVGElement>(null);
	const [chartWidth, setChartWidth] = useState(1000);
	const chartHeight = 800;

	const handleResize = useCallback(() => {
		if (svgRef.current) {
			const { width } = svgRef.current.getBoundingClientRect();
			setChartWidth(width);
		}
	}, []);

	useEffect(() => {
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [handleResize]);

	const point = 0.00001; // Default point value, adjust as needed

	const minY = Math.min(...closingPrices, closeoutAsk ?? Infinity, closeoutBid ?? Infinity) - point * 50; // 5 pips below
	const maxY = Math.max(...closingPrices, closeoutAsk ?? -Infinity, closeoutBid ?? -Infinity) + point * 50; // 5 pips above

	const padding = 0;
	const rightPadding = 150;

	useEffect(() => {
		if (candles.length === 0) {
			console.error("Invalid candles data:", candles);
			return;
		}

		const newClosingPrices = candles.map((candle) => candle.close);
		const newTimeData = candles.map((candle) => candle.timestamp);

		setClosingPrices(newClosingPrices);
		setTimeData(newTimeData);
	}, [candles]);

	useEffect(() => {
		if (closeoutAsk !== null && closeoutBid !== null) {
			const askPosY = ((closeoutAsk - minY) / (maxY - minY)) * chartHeight;
			const bidPosY = ((closeoutBid - minY) / (maxY - minY)) * chartHeight;
			setAskPosition({ x: 0, y: askPosY });
			setBidPosition({ x: 0, y: bidPosY });
		}
	}, [closeoutAsk, closeoutBid, minY, maxY, chartHeight]);

	const handlePricePositionChange = useCallback((askPos: { x: number; y: number }, bidPos: { x: number; y: number }) => {
		setAskPosition((prevAskPos) => {
			if (prevAskPos.x !== askPos.x || prevAskPos.y !== askPos.y) {
				return askPos;
			}
			return prevAskPos;
		});
		setBidPosition((prevBidPos) => {
			if (prevBidPos.x !== bidPos.x || prevBidPos.y !== bidPos.y) {
				return bidPos;
			}
			return prevBidPos;
		});
	}, []);

	if (closingPrices.length === 0) {
		return <div>Loading...</div>;
	}

	return (
		<ResponsiveContainer>
			<PairName pair={pair} />
			<Toolbar timeInterval={timeInterval} setTimeInterval={setTimeInterval} chartType={chartType} setChartType={setChartType} />
			<div className="flex-1">
				<XAxis timeData={timeData} />
				<YAxis minY={minY} maxY={maxY} point={point} />
				{chartType === "line" ? (
					<ChartLine
						closingPrices={closingPrices}
						minY={minY}
						maxY={maxY}
						padding={padding}
						rightPadding={rightPadding}
						onPricePositionChange={handlePricePositionChange}
						closeoutAsk={closeoutAsk ?? 0}
						closeoutBid={closeoutBid ?? 0}
						pair={pair}
						candles={candles}
					/>
				) : (
					<CandleChart
						closingPrices={closingPrices}
						minY={minY}
						maxY={maxY}
						padding={padding}
						rightPadding={rightPadding}
						onPricePositionChange={handlePricePositionChange}
						closeoutAsk={closeoutAsk ?? 0}
						closeoutBid={closeoutBid ?? 0}
						pair={pair}
						candles={candles}
					/>
				)}
				<CurrentSpread closeoutAsk={closeoutAsk} closeoutBid={closeoutBid} askPosition={askPosition} bidPosition={bidPosition} />
			</div>
		</ResponsiveContainer>
	);
};

interface ResponsiveContainerProps {
	children: ReactNode;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ children }) => {
	return <div className="h-full bg-black overflow-hidden border border-[#181818] relative w-full">{children}</div>;
};

export default RthmnVision;
