import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PairClient from './PairClient';
import { getBoxSlices, getLatestBoxSlices } from '@/utils/boxSlices';
import {
  getBoxSlicesSocket,
  getLatestBoxSlicesSocket
} from '@/utils/boxSlicesSocket';
import { getURL } from '@/utils/helpers';

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
    data: { user },
    error
  } = await supabase.auth.getUser();

  console.log('User:', user);
  console.log('Auth error:', error);

  if (error || !user) {
    console.log('Redirecting to signin');
    return redirect(getURL('signin'));
  }

  const initialData = await getBoxSlicesSocket(pair, undefined, 500);
  const allPairsData = await getLatestBoxSlicesSocket();

  return (
    <div className="w-full">
      <PairClient
        initialData={initialData}
        pair={pair}
        allPairsData={allPairsData}
      />
    </div>
  );
}
