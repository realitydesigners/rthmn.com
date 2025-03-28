import { processInitialBoxData } from '@/utils/boxDataProcessor';
import { processInitialChartData } from '@/utils/chartDataProcessor';
import { getSubscription } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import AuthClient from './AuthClient';
import Client from './client';
import { processProgressiveBoxValues } from '@/utils/boxDataProcessor';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

async function fetchApiData(pair: string, token: string) {
    const CANDLE_LIMIT = 1000;
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { data } = await response.json();
    return [...data].reverse().map((candle) => ({
        timestamp: new Date(candle.timestamp).getTime(),
        close: Number(candle.close),
        high: Number(candle.high),
        low: Number(candle.low),
        open: Number(candle.open),
        volume: 0,
    }));
}

export default async function PairPage(props: PageProps) {
    const params = await props.params;
    const { pair } = params;
    const supabase = await createClient();
    const session = await supabase.auth.getSession();
    const subscription = await getSubscription(supabase);
    const hasSubscription = subscription?.status === 'active';

    if (!session.data.session?.access_token) {
        throw new Error('No access token available');
    }

    const rawCandleData = await fetchApiData(pair, session.data.session.access_token);
    const { processedCandles, initialVisibleData } = processInitialChartData(rawCandleData);
    const { histogramBoxes, histogramPreProcessed } = processInitialBoxData(processedCandles, pair);

    const chartData = {
        processedCandles,
        initialVisibleData,
        histogramBoxes,
        histogramPreProcessed,
    };

    if (hasSubscription) {
        return <AuthClient pair={pair} chartData={chartData} />;
    }

    return null;
}
