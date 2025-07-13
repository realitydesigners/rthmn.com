import React from "react";
import { processInitialBoxData } from "@/utils/boxDataProcessor";
import { getSubscription } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { getUnixTimestamp } from "@/utils/dateUtils";
import DashboardClient from "./client";

const DASHBOARD_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "EURJPY", "AUDUSD"];

async function fetchApiData(
  pair: string,
  token: string,
  hasSubscription: boolean
) {
  const CANDLE_LIMIT = 500; // Same as pair page

  try {
    const timestamp = Date.now();
    const endpoint = hasSubscription
      ? `/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}&interval=1min&recent=true&_t=${timestamp}`
      : `/public/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}&interval=1min&recent=true&_t=${timestamp}`;

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

    // Process data exactly like pair page
    const processedData = data
      .map((candle) => {
        const timestamp = getUnixTimestamp(candle.timestamp);

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
      );

    // Sort by timestamp (oldest to newest)
    return processedData.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error(`Error fetching candle data for ${pair}:`, error);
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

  // Fetch historical data for all pairs
  const pairHistoricalData: Record<string, any[]> = {};

  await Promise.all(
    DASHBOARD_PAIRS.map(async (pair) => {
      const rawCandleData = await fetchApiData(
        pair,
        session.data.session.access_token,
        hasSubscription
      );

      if (rawCandleData.length > 0) {
        // Process box data exactly like pair page
        const { histogramBoxes } = processInitialBoxData(rawCandleData, pair);
        pairHistoricalData[pair] = histogramBoxes || [];
      } else {
        pairHistoricalData[pair] = [];
      }
    })
  );

  return <DashboardClient pairHistoricalData={pairHistoricalData} />;
}
