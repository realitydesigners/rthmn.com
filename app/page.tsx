import { client } from '@/sanity/lib/client';
import { postsQuery } from '@/sanity/lib/queries';
import ClientPage from './client';
import { getProducts, getSubscription } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const posts = await client.fetch(postsQuery);

  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  let products = null;
  let subscription = null;

  if (session) {
    [products, subscription] = await Promise.all([
      getProducts(supabase),
      getSubscription(supabase)
    ]);
  }
  console.log(session);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <ClientPage
      posts={posts}
      products={products}
      subscription={subscription}
      session={session}
    />
  );
}
