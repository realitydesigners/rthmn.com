import { client } from '@/sanity/lib/client';
import { postsQuery } from '@/sanity/lib/queries';
import ClientPage from './client';
import { getProducts, getSubscription } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const posts = await client.fetch(postsQuery);

  const supabase = await createClient();
  const [products, subscription] = await Promise.all([
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <ClientPage posts={posts} products={products} subscription={subscription} />
  );
}
