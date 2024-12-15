import HomeClient from './client';
import { client } from '@/utils/sanity/lib/client';
import { postsQuery, allMarketDataQuery } from '@/utils/sanity/lib/queries';
import { getProducts } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {
    const [posts, marketData] = await Promise.all([client.fetch(postsQuery), client.fetch(allMarketDataQuery)]);

    const supabase = await createClient();
    const products = await getProducts(supabase);

    const url = 'https://prod.spline.design/FhwJgKysWOeoB4hh/scene.splinecode';

    return <HomeClient url={url} posts={posts} marketData={marketData} products={products} />;
}
