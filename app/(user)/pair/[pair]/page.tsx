import { processInitialBoxData } from "@/utils/boxDataProcessor";
import { processInitialChartData } from "@/utils/chartDataProcessor";
import { getSubscription } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import PairClient from "./client";
import { getUnixTimestamp } from "@/utils/dateUtils";

async function fetchApiData(
  pair: string,
  token: string,
  hasSubscription: boolean
) {
  try {
    const upperPair = pair.toUpperCase();
    const timestamp = Date.now();
    const endpoint = hasSubscription
      ? `/candles/${upperPair}?limit=200&interval=1min&recent=true&_t=${timestamp}`
      : `/public/candles/${upperPair}?limit=200&interval=1min&recent=true&_t=${timestamp}`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data } = await response.json();

    const processedData = data.map((candle) => ({
      timestamp: getUnixTimestamp(candle.timestamp),
      open: Number(candle.open),
      high: Number(candle.high),
      low: Number(candle.low),
      close: Number(candle.close),
    }));

    return processedData;
  } catch (error) {
    console.error("Error fetching candle data:", error);
    return [];
  }
}

export default async function PairPage({
  params,
}: {
  params: { pair: string };
}) {
  const { pair } = params;
  const supabase = await createClient();
  const session = await supabase.auth.getSession();
  const subscription = await getSubscription(supabase);
  const hasSubscription = subscription?.status === "active";

  if (!session.data.session?.access_token) {
    throw new Error("No access token available");
  }

  const upperPair = pair.toUpperCase();
  const rawCandleData = await fetchApiData(
    upperPair,
    session.data.session.access_token,
    hasSubscription
  );

  if (!rawCandleData.length) {
    console.error("No candle data available");
    return null;
  }

  const { processedCandles, initialVisibleData } = processInitialChartData(
    rawCandleData,
    1000,
    undefined,
    undefined,
    upperPair
  );

  const { histogramBoxes, histogramPreProcessed } = processInitialBoxData(
    rawCandleData,
    upperPair
  );

  const chartData = {
    processedCandles,
    initialVisibleData,
    histogramBoxes,
    histogramPreProcessed,
  };

  return <PairClient pair={upperPair} chartData={chartData} />;
}
