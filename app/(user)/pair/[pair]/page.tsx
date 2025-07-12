import { processInitialBoxData } from "@/utils/boxDataProcessor";
import { processInitialChartData } from "@/utils/chartDataProcessor";
import { getSubscription } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import PairClient from "./client";
import { getUnixTimestamp } from "@/utils/dateUtils";

interface PageProps {
  params: Promise<{
    pair: string;
  }>;
}

// Test function to compare both endpoints (disabled after successful testing)
async function testBothEndpoints(pair: string, token: string) {
  // Temporarily disabled - can be removed once everything is confirmed working
  return;
}

async function fetchApiData(
  pair: string,
  token: string,
  hasSubscription: boolean
) {
  const CANDLE_LIMIT = 200; // Increased limit to ensure we get enough recent data

  // Run test comparison (temporary)
  await testBothEndpoints(pair, token);

  try {
    // Use public route for non-subscribers, protected route for subscribers
    // Add timestamp to prevent caching and ensure fresh data
    const timestamp = Date.now();
    const endpoint = hasSubscription
      ? `/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}&interval=1min&recent=true&_t=${timestamp}`
      : `/public/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}&interval=1min&recent=true&_t=${timestamp}`;

    console.log(
      `🎯 Using ${hasSubscription ? "SUBSCRIPTION" : "PUBLIC"} endpoint:`,
      endpoint
    );
    console.log(
      `📅 Requesting most recent ${CANDLE_LIMIT} candles for ${pair.toUpperCase()}`
    );

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store", // Ensure we don't get cached data
        next: { revalidate: 0 }, // Force revalidation in Next.js
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const responseBody = await response.json();

    console.log("🔍 Raw API response:", {
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}${endpoint}`,
      status: responseBody.status,
      dataLength: responseBody.data?.length || 0,
      firstDataItem: responseBody.data?.[0],
      lastDataItem: responseBody.data?.[responseBody.data?.length - 1],
      firstTimestamp: responseBody.data?.[0]?.timestamp
        ? new Date(responseBody.data[0].timestamp).toISOString()
        : "N/A",
      lastTimestamp: responseBody.data?.[responseBody.data?.length - 1]
        ?.timestamp
        ? new Date(
            responseBody.data[responseBody.data.length - 1].timestamp
          ).toISOString()
        : "N/A",
      responseKeys: Object.keys(responseBody),
    });

    const { data } = responseBody;

    if (!data || !Array.isArray(data)) {
      console.error("Invalid data format received:", data);
      return [];
    }

    // Convert timestamps and validate OHLC data - no sorting needed
    const processedData = data
      .map((candle) => {
        // --- Corrected: Directly use getUnixTimestamp ---
        const timestamp = getUnixTimestamp(candle.timestamp);
        // --- End Correction ---

        // Simple validation - skip invalid candles
        if (
          isNaN(timestamp) ||
          candle.open == null ||
          candle.high == null ||
          candle.low == null ||
          candle.close == null
        ) {
          return null;
        }

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
          return null;
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
          candle
        ): candle is {
          timestamp: number;
          open: number;
          high: number;
          low: number;
          close: number;
        } => candle !== null
      ); // Filter out nulls and type guard

    // Early exit if no valid data remained after processing
    if (!processedData.length) {
      console.error(
        "No valid candle data remained after processing timestamps and OHLC."
      );
      return [];
    }

    // Sort by timestamp to ensure chronological order (oldest to newest)
    const sortedData = processedData.sort((a, b) => a.timestamp - b.timestamp);

    // Get current time for freshness check
    const currentTime = Date.now();
    const mostRecentCandle = sortedData[sortedData.length - 1];
    const dataAge = currentTime - mostRecentCandle.timestamp;
    const minutesOld = Math.floor(dataAge / (1000 * 60));

    console.log("🔍 API Data Processing Debug:", {
      totalRawCandles: data.length,
      totalProcessedCandles: processedData.length,
      totalSortedCandles: sortedData.length,
      firstProcessedCandle: processedData[0],
      lastProcessedCandle: processedData[processedData.length - 1],
      firstSortedCandle: sortedData[0],
      lastSortedCandle: sortedData[sortedData.length - 1],
      currentTime: new Date(currentTime).toISOString(),
      mostRecentCandleTime: new Date(mostRecentCandle.timestamp).toISOString(),
      dataAgeMinutes: minutesOld,
      dataAgeHours: Math.floor(minutesOld / 60),
      isFresh: minutesOld < 10, // Data is fresh if less than 10 minutes old
      isStale: minutesOld > 60, // Data is stale if more than 1 hour old
    });

    // Add warning if data is old
    if (minutesOld > 60) {
      console.warn(
        `⚠️ DATA IS ${Math.floor(minutesOld / 60)} HOURS OLD! Last candle: ${new Date(mostRecentCandle.timestamp).toISOString()}`
      );
    }

    return sortedData;
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
    hasSubscription
  );

  // Return early if no data
  if (!rawCandleData.length) {
    console.error("No candle data available");
    return null;
  }

  console.log("📊 Raw candle data received:", {
    candleCount: rawCandleData.length,
    hasSubscription,
    pair,
    firstCandle: rawCandleData[0],
    lastCandle: rawCandleData[rawCandleData.length - 1],
  });

  // Process chart data only if needed for charting
  const { processedCandles, initialVisibleData } =
    processInitialChartData(rawCandleData);

  // Use raw candle data directly for box calculations
  const { histogramBoxes, histogramPreProcessed } = processInitialBoxData(
    rawCandleData,
    pair
  );

  console.log("📈 Processed chart data:", {
    processedCandlesCount: processedCandles?.length,
    initialVisibleDataCount: initialVisibleData?.length,
    histogramBoxes: histogramBoxes ? "✅ Generated" : "❌ Missing",
    histogramBoxesCount: histogramBoxes?.length || 0,
    histogramPreProcessed: histogramPreProcessed
      ? "✅ Generated"
      : "❌ Missing",
    firstHistogramFrame: histogramBoxes?.[0]?.timestamp,
    lastHistogramFrame: histogramBoxes?.[histogramBoxes.length - 1]?.timestamp,
    mostRecentCandleTime: rawCandleData[rawCandleData.length - 1]?.timestamp
      ? new Date(
          rawCandleData[rawCandleData.length - 1].timestamp
        ).toISOString()
      : "N/A",
  });

  const chartData = {
    processedCandles,
    initialVisibleData,
    histogramBoxes,
    histogramPreProcessed,
  };

  // Always render PairClient - it should handle subscription differences internally
  return <PairClient pair={pair} chartData={chartData} />;
}
