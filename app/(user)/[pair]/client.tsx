"use client";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { BoxSlice, PairData } from "@/types";
import HistogramManager from "../../../components/Histogram/HistogramManager";
import RthmnVision from "../../../components/LineChart"
import { getBoxSlices, compareSlices } from "@/utils/boxSlices";
import debounce from "lodash/debounce";
import { ViewType } from "@/types";

interface DashboardClientProps {
	initialData: BoxSlice[];
	pair: string;
	allPairsData: Record<string, PairData>;
}

const Client: React.FC<DashboardClientProps> = ({
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
	const [visibleBoxesCount, setVisibleBoxesCount] = useState(6);
	const [viewType, setViewType] = useState<ViewType>("oscillator");
	const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
	const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [startHeight, setStartHeight] = useState(200);
	const [rthmnVisionDimensions, setRthmnVisionDimensions] = useState({ width: 0, height: 0 });
	const containerRef = useRef<HTMLDivElement>(null);
	const [rthmnVisionHeight, setRthmnVisionHeight] = useState(400);

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
		if (!data) return [];
		return data.map(slice => ({
			time: new Date(slice.timestamp).toISOString(),
			open: slice.currentOHLC?.open ?? slice.boxes[0]?.high ?? 0,
			high: slice.currentOHLC?.high ?? Math.max(...slice.boxes.map(box => box.high)),
			low: slice.currentOHLC?.low ?? Math.min(...slice.boxes.map(box => box.low)),
			close: slice.currentOHLC?.close ?? slice.boxes[slice.boxes.length - 1]?.low ?? 0,
		}));
	}, [data]);

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
		const updateDimensions = () => {
			if (containerRef.current) {
				const containerHeight = containerRef.current.clientHeight;
				const containerWidth = containerRef.current.clientWidth;
				const newRthmnVisionHeight = containerHeight - histogramHeight - 80;
				setRthmnVisionHeight(Math.max(newRthmnVisionHeight, 200));
				setRthmnVisionDimensions({
					width: containerWidth,
					height: newRthmnVisionHeight,
				});
			}
		};

		updateDimensions();
		window.addEventListener('resize', updateDimensions);

		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	}, [histogramHeight]);

	return (
		<div ref={containerRef} className="flex flex-col h-screen w-full overflow-hidden  bg-black">
			<div 
				className="flex-grow overflow-hidden pt-[80px]"
				style={{ 
					minHeight: `${rthmnVisionHeight}px`,
				}}
			>
				<RthmnVision
					pair={pair}
					candles={candleData}
					width={rthmnVisionDimensions.width}
					height={rthmnVisionHeight - 40}
				/>
			</div>
			<div 
				className="flex-shrink-0" 
				style={{ 
					height: `${histogramHeight + 40}px`,
				}}
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
					containerWidth={rthmnVisionDimensions.width}
				/>
			</div>
		</div>
	);
};

export default React.memo(Client);
