import { client } from '@/utils/sanity/lib/client';
import { postsQuery, allMarketDataQuery } from '@/utils/sanity/lib/queries';
import ClientPage from './client';
import { getProducts } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

export default async function Page() {
    const [posts, marketData] = await Promise.all([client.fetch(postsQuery), client.fetch(allMarketDataQuery)]);

    const supabase = await createClient();
    const products = await getProducts(supabase);

    return <ClientPage posts={posts} products={products} marketData={marketData} />;
}
