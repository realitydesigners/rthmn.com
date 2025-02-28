import { client } from '@/utils/sanity/client';
import { allMarketDataQuery, postsQuery } from '@/utils/sanity/queries';
import { getProducts } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import ClientPage from './client';

export default async function Page() {
    const [posts, marketData] = await Promise.all([client.fetch(postsQuery), client.fetch(allMarketDataQuery)]);

    const supabase = await createClient();
    const products = await getProducts(supabase);

    return <ClientPage posts={posts} products={products} marketData={marketData} />;
}
