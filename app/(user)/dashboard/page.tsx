import React from "react";
import { processInitialBoxData } from "@/utils/boxDataProcessor";
import { getSubscription } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { getUnixTimestamp } from "@/utils/dateUtils";
import DashboardClient from "./client";

const DASHBOARD_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "EURJPY", "AUDUSD"];

// Optimized: Reduce data for dashboard - we don't need 500 candles for preview
const DASHBOARD_CANDLE_LIMIT = 200; // Reduced from 500 for faster processing

async function fetchApiData(
  pair: string,
  token: string,
  hasSubscription: boolean,
  interval: string = "1min" // Add interval parameter
) {
  const CANDLE_LIMIT = DASHBOARD_CANDLE_LIMIT;

  try {
    const timestamp = Date.now();
    const endpoint = hasSubscription
      ? `/candles/${pair}?limit=${CANDLE_LIMIT}&interval=${interval}&recent=true&_t=${timestamp}`
      : `/public/candles/${pair}?limit=${CANDLE_LIMIT}&interval=${interval}&recent=true&_t=${timestamp}`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const responseBody = await response.json();
    const { data } = responseBody;

    if (!data || !Array.isArray(data)) {
      console.error(`Invalid data format received for ${pair}:`, data);
      return [];
    }

    const processedData = data
      .map((candle) => {
        // --- Corrected: Directly use getUnixTimestamp ---
        const timestamp = getUnixTimestamp(candle.timestamp);
        // --- End Correction ---

        const candleOpen = Number(candle.open);
        const candleHigh = Number(candle.high);
        const candleLow = Number(candle.low);
        const candleClose = Number(candle.close);

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

    return sortedData;
  } catch (error) {
    console.error(`Error fetching ${interval} candle data for ${pair}:`, error);
    return [];
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();
  const subscription = await getSubscription(supabase);
  const hasSubscription = subscription?.status === "active";

  if (!session.data.session?.access_token) {
    throw new Error("No access token available");
  }

  // Fetch historical data for all pairs with performance monitoring
  const dashboardStartTime = performance.now();
  const pairHistoricalData: Record<string, any[]> = {};

  // Parallel data fetching and processing
  await Promise.all(
    DASHBOARD_PAIRS.map(async (pair) => {
      const pairStartTime = performance.now();

      try {
        // Fetch 5min data for box processing
        const boxCandleData = await fetchApiData(
          pair,
          session.data.session.access_token,
          hasSubscription,
          "5min"
        );

        if (boxCandleData.length > 0) {
          // Process box data with 5min data
          const { histogramBoxes } = processInitialBoxData(boxCandleData, pair);
          pairHistoricalData[pair] = histogramBoxes;

          // Console log the latest histogram data point
          if (histogramBoxes.length > 0) {
            const latestFrame = histogramBoxes[histogramBoxes.length - 1];
            console.log(`📊 ${pair} Latest Histogram Frame (5min data):`, {
              timestamp: latestFrame.timestamp,
              boxCount: latestFrame.progressiveValues?.length || 0,
              firstFewBoxes:
                latestFrame.progressiveValues?.slice(0, 3).map((box) => ({
                  high: box.high,
                  low: box.low,
                  value: box.value,
                })) || [],
              candleDataLength: boxCandleData.length,
              latestCandle: {
                timestamp: boxCandleData[boxCandleData.length - 1]?.timestamp,
                close: boxCandleData[boxCandleData.length - 1]?.close,
              },
            });
          }

          const pairEndTime = performance.now();
          const pairDuration = pairEndTime - pairStartTime;
        } else {
          console.warn(`❌ ${pair}: No 5min candle data available`);
        }
      } catch (error) {
        console.error(`❌ ${pair}: Error processing data:`, error);
      }
    })
  );

  const totalDashboardTime = performance.now() - dashboardStartTime;

  return <DashboardClient pairHistoricalData={pairHistoricalData} />;
}
