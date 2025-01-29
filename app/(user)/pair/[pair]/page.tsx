import { createClient } from '@/utils/supabase/server';
import Client from './client';
import { getSubscription } from '@/utils/supabase/queries';
import { pairSnapshotQuery } from '@/utils/sanity/lib/queries';
import { sanityFetch } from '@/utils/sanity/lib/client';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

interface SanityPairSnapshot {
    _type: 'pairSnapshot';
    pair: string;
    candleData: string;
    lastUpdated: string;
}

async function fetchSanityData(pair: string) {
    const snapshot = await sanityFetch<SanityPairSnapshot>({
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
    const candleData = hasSubscription ? [] : await fetchSanityData(pair);

    return (
        <div className='w-full'>
            <Client pair={pair} initialCandleData={candleData} />
        </div>
    );
}
