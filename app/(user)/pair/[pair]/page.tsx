import { processInitialBoxData } from '@/utils/boxDataProcessor';
import { processInitialChartData } from '@/utils/chartDataProcessor';
import { getSubscription } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import PairClient from './client';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

async function fetchApiData(pair: string, token: string) {
    const CANDLE_LIMIT = 120;
    const INTERVAL = '1min';
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/getCandles?pair=${pair.toUpperCase()}&limit=${CANDLE_LIMIT}&interval=${INTERVAL}&token=${encodeURIComponent(token)}`;
        const response = await fetch(apiUrl, {
            cache: 'no-store',
        });

        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error('Error in fetchApiData:', error);
        return [];
    }
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

    if (!rawCandleData.length) {
        return null;
    }

    const { processedCandles, initialVisibleData } = processInitialChartData(rawCandleData);
    const { histogramBoxes, histogramPreProcessed } = processInitialBoxData(rawCandleData, pair);

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
