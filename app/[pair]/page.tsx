import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PairClient from './PairClient';
import { getBoxSlices } from '@/app/utils/getBoxSlices';

interface PageProps {
  params: {
    pair: string;
  };
}

export default async function PairPage({ params }: PageProps) {
  const { pair } = params;
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch only the last 250 items for the given pair
  const initialData = await getBoxSlices(pair, undefined, 250);
  console.log('Initial data length:', initialData.length);

  return (
    <div className="w-full">
      <PairClient initialData={initialData} pair={pair} />
    </div>
  );
}
