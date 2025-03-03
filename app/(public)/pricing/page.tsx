import { client } from '@/lib/sanity/lib/client';
import { allMarketDataQuery, postsQuery } from '@/lib/sanity/lib/queries';
import { getProducts } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import ClientPage from './client';

export default async function Page() {
    const [posts, marketData] = await Promise.all([client.fetch(postsQuery), client.fetch(allMarketDataQuery)]);

    const supabase = await createClient();
    const products = await getProducts(supabase);

    return <ClientPage posts={posts} products={products} marketData={marketData} />;
}
