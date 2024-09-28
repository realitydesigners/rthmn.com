"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { BoxSlice, PairData } from "@/types";
import HistogramManager from "../../components/Histogram/HistogramManager";
import { getBoxSlices } from "@/app/utils/getBoxSlices";
import PairsSidebar from "@/components/PairsSidebar";
import { getTrendForOffset } from "@/app/utils/getTrendForOffset";

interface OHLC {
	open: number;
	high: number;
	low: number;
	close: number;
}

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

	const fetchData = useCallback(async () => {
		const newData = await getBoxSlices(pair, undefined, 250);
		return newData;
	}, [pair]);

	const { data, isLoading, error, refetch } = useQuery<BoxSlice[]>({
		queryKey: ["boxSlices", pair],
		queryFn: fetchData,
		initialData: initialData,
		refetchInterval: 5000,
	});

	const handleHistogramResize = useCallback((newHeight: number) => {
		setHistogramHeight(newHeight);
	}, []);

	const handleOffsetChange = useCallback(
		(newOffset: number) => {
			setBoxOffset(newOffset);
			const params = new URLSearchParams(searchParams.toString());
			params.set("offset", newOffset.toString());
			router.push(`?${params.toString()}`, { scroll: false });
		},
		[searchParams, router],
	);

	useEffect(() => {
		const offsetParam = searchParams.get("offset");
		if (offsetParam) {
			const newOffset = parseInt(offsetParam, 10);
			setBoxOffset(newOffset);
		}
	}, [searchParams]);

	const renderTrendIcon = (trend: "up" | "down") => {
		const color = trend === "up" ? "text-teal-500" : "text-red-500";
		return (
			<svg
				className={`h-4 w-4 ${color}`}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{trend === "up" ? (
					<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
				) : (
					<polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
				)}
				<polyline
					points={trend === "up" ? "17 6 23 6 23 12" : "17 18 23 18 23 12"}
				/>
			</svg>
		);
	};

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {(error as Error).message}</div>;
	if (!data) return <div>No data available</div>;

	return (
		<div className="flex">
			<PairsSidebar
				pairs={allPairsData}
				currentPair={pair}
				renderTrendIcon={renderTrendIcon}
				getTrendForOffset={getTrendForOffset}
			/>
			<div className="flex-grow">
				<HistogramManager
					data={data}
					height={histogramHeight}
					onResize={handleHistogramResize}
					boxOffset={boxOffset}
					onOffsetChange={handleOffsetChange}
				/>
			</div>
		</div>
	);
};

export default React.memo(PairClient);
