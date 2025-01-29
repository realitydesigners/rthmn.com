import { createClient } from '@/utils/supabase/server';
import Client from './client';
import { getSubscription } from '@/utils/supabase/queries';
import { pairSnapshotQuery } from '@/utils/sanity/lib/queries';
import { sanityFetch } from '@/utils/sanity/lib/client';
import { processInitialChartData } from '@/utils/chartDataProcessor';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

async function fetchSanityData(pair: string) {
    const snapshot = await sanityFetch<{ pair: string; candleData: string; lastUpdated: string }>({
        query: pairSnapshotQuery,
        qParams: { pair: pair.toUpperCase() },
        tags: ['pairSnapshot'],
    });

    const parsedData = JSON.parse(snapshot.candleData);
    return parsedData;
}

export default async function PairPage(props: PageProps) {
    const params = await props.params;
    const { pair } = params;
    const supabase = await createClient();
    const subscription = await getSubscription(supabase);
    const hasSubscription = subscription?.status === 'active';
    const rawCandleData = hasSubscription ? [] : await fetchSanityData(pair);
    const { processedCandles, initialVisibleData } = processInitialChartData(rawCandleData);

    return (
        <div className='w-full'>
            <Client
                pair={pair}
                chartData={{
                    processedCandles,
                    initialVisibleData,
                }}
            />
        </div>
    );
}
