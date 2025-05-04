import { getSubscription } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { processInitialBoxData } from "@/utils/boxDataProcessor";
import { processInitialChartData } from "@/utils/chartDataProcessor";
import { getUnixTimestamp } from "@/utils/dateUtils";
import PairClient from "./client";

interface PageProps {
	params: Promise<{
		pair: string;
	}>;
}

async function fetchApiData(pair: string, token: string) {
	const CANDLE_LIMIT = 200;
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_SERVER_URL}/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}&interval=1min`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		const { data } = await response.json();

		if (!data || !Array.isArray(data)) {
			console.error("Invalid data format received:", data);
			return [];
		}

		// Convert timestamps and validate OHLC data
		const processedData = [...data]
			.reverse()
			.map((candle) => {
				// --- Corrected: Directly use getUnixTimestamp ---
				const timestamp = getUnixTimestamp(candle.timestamp);
				// --- End Correction ---

				// Validate timestamp
				if (isNaN(timestamp)) {
					console.error(
						"Invalid or unparseable timestamp format received: skipping candle:",
						candle,
					); // Log error here if needed
					return null; // Mark for filtering (timestamp failed)
				}

				// Validate and convert OHLC values
				const candleOpen = Number(candle.open);
				const candleHigh = Number(candle.high);
				const candleLow = Number(candle.low);
				const candleClose = Number(candle.close);

				if (
					isNaN(candleOpen) ||
					isNaN(candleHigh) ||
					isNaN(candleLow) ||
					isNaN(candleClose)
				) {
					console.error("Invalid OHLC data received: skipping candle:", candle);
					return null; // Mark for filtering
				}

				return {
					timestamp: timestamp,
					open: candleOpen,
					high: candleHigh,
					low: candleLow,
					close: candleClose,
				};
			})
			.filter(
				(
					candle,
				): candle is {
					timestamp: number;
					open: number;
					high: number;
					low: number;
					close: number;
				} => candle !== null,
			); // Filter out nulls and type guard

		// Early exit if no valid data remained after processing
		if (!processedData.length) {
			console.error(
				"No valid candle data remained after processing timestamps and OHLC.",
			);
			return [];
		}

		return processedData;
	} catch (error) {
		console.error("Error fetching candle data:", error);
		return [];
	} // Correctly closes the try...catch block
} // Correctly closes the fetchApiData function

export default async function PairPage(props: PageProps) {
	const params = await props.params;
	const { pair } = params;
	const supabase = await createClient();
	const session = await supabase.auth.getSession();
	const subscription = await getSubscription(supabase);
	const hasSubscription = subscription?.status === "active";

	if (!session.data.session?.access_token) {
		throw new Error("No access token available");
	}

	const rawCandleData = await fetchApiData(
		pair,
		session.data.session.access_token,
	);

	// Return early if no data
	if (!rawCandleData.length) {
		console.error("No candle data available");
		return null;
	}

	// Process chart data only if needed for charting
	const { processedCandles, initialVisibleData } =
		processInitialChartData(rawCandleData);

	// Use raw candle data directly for box calculations
	const { histogramBoxes, histogramPreProcessed } = processInitialBoxData(
		rawCandleData,
		pair,
	);

	const chartData = {
		processedCandles,
		initialVisibleData,
		histogramBoxes,
		histogramPreProcessed,
	};

	if (hasSubscription) {
		return <PairClient pair={pair} chartData={chartData} />;
	}

	return null;
}
