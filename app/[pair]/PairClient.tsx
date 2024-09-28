"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { BoxSlice, PairData } from "@/types";
import HistogramManager from "../../components/Histogram/HistogramManager";
import { getBoxSlices } from "@/app/utils/getBoxSlices";
import PairsSidebar from "@/components/PairsSidebar";
import { getTrendForOffset } from "@/app/utils/getTrendForOffset";
import { compareSlices } from "@/app/utils/compareSlices";
import debounce from "lodash/debounce";

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
	const [sidebarWidth, setSidebarWidth] = useState(300);
	const [visibleBoxesCount, setVisibleBoxesCount] = useState(10);

	const fetchData = useCallback(async () => {
		return getBoxSlices(pair, undefined, 250);
	}, [pair]);

	const { data, isLoading, error } = useQuery<BoxSlice[]>({
		queryKey: ["boxSlices", pair],
		queryFn: fetchData,
		initialData: initialData,
		refetchInterval: 5000,
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

	const handleHistogramResize = useCallback((newHeight: number) => {
		setHistogramHeight(newHeight);
	}, []);

	const debouncedUpdateURL = useMemo(
		() =>
			debounce((newOffset: number) => {
				const params = new URLSearchParams(searchParams.toString());
				params.set("offset", newOffset.toString());
				router.push(`?${params.toString()}`, { scroll: false });
			}, 300),
		[searchParams, router],
	);

	const handleOffsetChange = useCallback(
		(newOffset: number) => {
			setBoxOffset(newOffset);
			debouncedUpdateURL(newOffset);
		},
		[debouncedUpdateURL],
	);

	const handleVisibleBoxesCountChange = useCallback((newCount: number) => {
		setVisibleBoxesCount(newCount);
	}, []);

	useEffect(() => {
		const offsetParam = searchParams.get("offset");
		if (offsetParam) {
			const newOffset = parseInt(offsetParam, 10);
			setBoxOffset(newOffset);
		}
	}, [searchParams]);

	return (
		<div className="0 flex min-h-screen w-full">
			<div className="relative flex-grow bg-black">
				<div
					className="absolute bottom-0 left-0 right-0"
					style={{ paddingRight: `${sidebarWidth}px` }}
				>
					<HistogramManager
						data={filteredData}
						height={histogramHeight}
						onResize={handleHistogramResize}
						boxOffset={boxOffset}
						onOffsetChange={handleOffsetChange}
						visibleBoxesCount={visibleBoxesCount}
						onVisibleBoxesCountChange={handleVisibleBoxesCountChange}
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
