import { client } from '@/lib/sanity/lib/client';
import { allMarketDataQuery, postsQuery } from '@/lib/sanity/lib/queries';
import { getProducts } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import HomeClient from './client';

export default async function HomePage() {
    const [posts, marketData] = await Promise.all([client.fetch(postsQuery), client.fetch(allMarketDataQuery)]);

    const supabase = await createClient();
    const products = await getProducts(supabase);

    const url = 'https://prod.spline.design/FhwJgKysWOeoB4hh/scene.splinecode';

    return <HomeClient url={url} posts={posts} marketData={marketData} products={products} />;
}
