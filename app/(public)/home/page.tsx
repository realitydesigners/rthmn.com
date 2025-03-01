import { client } from '@/sanity/lib/client';
import { allMarketDataQuery, postsQuery } from '@/sanity/lib/queries';
import { getProducts } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import HomeClient from './client';

export default async function HomePage() {
    const [posts, marketData] = await Promise.all([client.fetch(postsQuery), client.fetch(allMarketDataQuery)]);

    const supabase = await createClient();
    const products = await getProducts(supabase);

    const url = 'https://prod.spline.design/FhwJgKysWOeoB4hh/scene.splinecode';

    return <HomeClient url={url} posts={posts} marketData={marketData} products={products} />;
}
