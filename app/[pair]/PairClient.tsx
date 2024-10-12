"use client";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { BoxSlice, PairData } from "@/types";
import HistogramManager from "../../components/Histogram/HistogramManager";
import RthmnVision from "../../components/charts/RthmnVision";
import { getBoxSlices } from "@/utils/getBoxSlices";
import PairsSidebar from "@/components/PairsSidebar";
import { getTrendForOffset } from "@/utils/getTrendForOffset";
import { compareSlices } from "@/utils/compareSlices";
import debounce from "lodash/debounce";
import { ViewType } from "@/types";
import {TrendHealth} from "@/components/TrendHealth";

interface DashboardClientProps {
	initialData: BoxSlice[];
	pair: string;
	allPairsData: Record<string, PairData>;
}

const PairClient: React.FC<DashboardClientProps> = ({
	initialData,
	pair,
	allPairsData,
}) => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [histogramHeight, setHistogramHeight] = useState(200);
	const [boxOffset, setBoxOffset] = useState(() => {
		const offsetParam = searchParams.get("offset");
		return offsetParam ? parseInt(offsetParam, 10) : 0;
	});
	const [sidebarWidth, setSidebarWidth] = useState(375);
	const [visibleBoxesCount, setVisibleBoxesCount] = useState(12);
	const [viewType, setViewType] = useState<ViewType>("oscillator");
	const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
	const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(
		null,
	);
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [startHeight, setStartHeight] = useState(200);
	const [lineChartHeight, setLineChartHeight] = useState(200);
	const [lineChartWidth, setLineChartWidth] = useState(0);
	const lineChartRef = useRef<HTMLDivElement>(null);
	const [closeoutAsk, setCloseoutAsk] = useState<number | null>(null);
	const [closeoutBid, setCloseoutBid] = useState<number | null>(null);
	const [rthmnVisionDimensions, setRthmnVisionDimensions] = useState({ width: 0, height: 0 });
	const rthmnVisionRef = useRef<HTMLDivElement>(null);

	const fetchData = useCallback(async () => {
		return getBoxSlices(pair, undefined, 500);
	}, [pair]);

	const { data } = useQuery<BoxSlice[]>({
		queryKey: ["boxSlices", pair],
		queryFn: fetchData,
		initialData: initialData,
		refetchInterval: 10000,
	});

	const filteredData = useMemo(() => {
		if (!data) return [];
		return data.reduce((acc: BoxSlice[], currentSlice, index) => {
			if (
				index === 0 ||
				!compareSlices(
					currentSlice,
					acc[acc.length - 1],
					boxOffset,
					visibleBoxesCount,
				)
			) {
				acc.push(currentSlice);
			}
			return acc;
		}, []);
	}, [data, boxOffset, visibleBoxesCount]);

	const candleData = useMemo(() => {
		return filteredData.map(slice => ({
			timestamp: slice.timestamp,
			time: new Date(slice.timestamp).toISOString(),
			open: slice.currentOHLC?.open ?? slice.boxes[0]?.high ?? 0,
			high: slice.currentOHLC?.high ?? Math.max(...slice.boxes.map(box => box.high)),
			low: slice.currentOHLC?.low ?? Math.min(...slice.boxes.map(box => box.low)),
			close: slice.currentOHLC?.close ?? slice.boxes[slice.boxes.length - 1]?.low ?? 0,
			volume: 0, // Add this if you have volume data
			currentOHLC: slice.currentOHLC ?? {
				open: slice.boxes[0]?.high ?? 0,
				high: Math.max(...slice.boxes.map(box => box.high)),
				low: Math.min(...slice.boxes.map(box => box.low)),
				close: slice.boxes[slice.boxes.length - 1]?.low ?? 0,
			},
			mid: {
				o: slice.currentOHLC?.open ?? slice.boxes[0]?.high ?? 0,
				h: slice.currentOHLC?.high ?? Math.max(...slice.boxes.map(box => box.high)),
				l: slice.currentOHLC?.low ?? Math.min(...slice.boxes.map(box => box.low)),
				c: slice.currentOHLC?.close ?? slice.boxes[slice.boxes.length - 1]?.low ?? 0,
			},
			ask: {
				o: (slice.currentOHLC?.open ?? slice.boxes[0]?.high ?? 0) + 0.00001, // Slightly higher than mid
				h: (slice.currentOHLC?.high ?? Math.max(...slice.boxes.map(box => box.high))) + 0.00001,
				l: (slice.currentOHLC?.low ?? Math.min(...slice.boxes.map(box => box.low))) + 0.00001,
				c: (slice.currentOHLC?.close ?? slice.boxes[slice.boxes.length - 1]?.low ?? 0) + 0.00001,
			},
			bid: {
				o: (slice.currentOHLC?.open ?? slice.boxes[0]?.high ?? 0) - 0.00001, // Slightly lower than mid
				h: (slice.currentOHLC?.high ?? Math.max(...slice.boxes.map(box => box.high))) - 0.00001,
				l: (slice.currentOHLC?.low ?? Math.min(...slice.boxes.map(box => box.low))) - 0.00001,
				c: (slice.currentOHLC?.close ?? slice.boxes[slice.boxes.length - 1]?.low ?? 0) - 0.00001,
			},
		}));
	}, [filteredData]);

	const debouncedUpdateURL = useMemo(
		() =>
			debounce((newOffset: number) => {
				const params = new URLSearchParams(searchParams.toString());
				params.set("offset", newOffset.toString());
				router.push(`/${pair}?${params.toString()}`, { scroll: false });
			}, 300),
		[searchParams, router, pair],
	);

	const handleOffsetChange = useCallback(
		(newOffset: number) => {
			setBoxOffset(newOffset);
			debouncedUpdateURL(newOffset);
			// Reset selected frame when offset changes
			setSelectedFrame(null);
			setSelectedFrameIndex(null);
		},
		[debouncedUpdateURL],
	);

	const handleViewChange = useCallback((newViewType: ViewType) => {
		setViewType(newViewType);
	}, []);

	const handleFrameSelect = useCallback(
		(frame: BoxSlice | null, index: number | null) => {
			setSelectedFrame(frame);
			setSelectedFrameIndex(index);
		},
		[],
	);

	const handleDragStart = useCallback(
		(e: React.MouseEvent) => {
			setIsDragging(true);
			setStartY(e.clientY);
			setStartHeight(histogramHeight);
		},
		[histogramHeight],
	);

	const handleDragEnd = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrag = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return;
			const deltaY = startY - e.clientY;
			const newHeight = Math.min(Math.max(startHeight + deltaY, 100), 350);
			setHistogramHeight(newHeight);
		},
		[isDragging, startY, startHeight],
	);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleDrag);
			document.addEventListener("mouseup", handleDragEnd);
		} else {
			document.removeEventListener("mousemove", handleDrag);
			document.removeEventListener("mouseup", handleDragEnd);
		}
		return () => {
			document.removeEventListener("mousemove", handleDrag);
			document.removeEventListener("mouseup", handleDragEnd);
		};
	}, [isDragging, handleDrag, handleDragEnd]);

	useEffect(() => {
		const offsetParam = searchParams.get("offset");
		if (offsetParam) {
			const newOffset = parseInt(offsetParam, 10);
			setBoxOffset(newOffset);
		}
	}, [searchParams]);

	useEffect(() => {
		const updateLineChartWidth = () => {
			if (lineChartRef.current) {
				setLineChartWidth(lineChartRef.current.clientWidth);
			}
		};

		updateLineChartWidth();
		window.addEventListener('resize', updateLineChartWidth);

		return () => {
			window.removeEventListener('resize', updateLineChartWidth);
		};
	}, []);

	useEffect(() => {
		if (candleData.length > 0) {
			const latestCandle = candleData[candleData.length - 1];
			setCloseoutAsk(latestCandle.high);
			setCloseoutBid(latestCandle.low);
		}
	}, [candleData]);

	useEffect(() => {
		const updateRthmnVisionDimensions = () => {
			if (rthmnVisionRef.current) {
				const { width, height } = rthmnVisionRef.current.getBoundingClientRect();
				setRthmnVisionDimensions({ width, height });
			}
		};

		updateRthmnVisionDimensions();
		window.addEventListener('resize', updateRthmnVisionDimensions);

		return () => {
			window.removeEventListener('resize', updateRthmnVisionDimensions);
		};
	}, []);

	return (
		<div className="flex min-h-screen w-full overflow-y-hidden">
			<div className="relative flex-grow overflow-y-hidden bg-black">
				<div
					ref={rthmnVisionRef}
					className="h-[70vh] mt-32"
					style={{ paddingRight: `${sidebarWidth}px` }}
				>
					<RthmnVision
						pair={pair}
						candles={candleData}
						width={rthmnVisionDimensions.width}
						height={rthmnVisionDimensions.height}
					/>
				</div>
				<div
					className="absolute bottom-0 left-0 right-0"
					style={{ paddingRight: `${sidebarWidth}px` }}
					>
						<HistogramManager
							data={filteredData}
							height={histogramHeight}
							boxOffset={boxOffset}
							onOffsetChange={handleOffsetChange}
							visibleBoxesCount={visibleBoxesCount}
							viewType={viewType}
							onViewChange={handleViewChange}
							selectedFrame={selectedFrame}
							selectedFrameIndex={selectedFrameIndex}
							onFrameSelect={handleFrameSelect}
							isDragging={isDragging}
							onDragStart={handleDragStart}
						/>
				</div>
			</div>
			<PairsSidebar
				pairs={allPairsData}
				currentPair={pair}
				getTrendForOffset={getTrendForOffset}
				width={sidebarWidth}
				onWidthChange={setSidebarWidth}
			/>
		</div>
	);
};

export default React.memo(PairClient);