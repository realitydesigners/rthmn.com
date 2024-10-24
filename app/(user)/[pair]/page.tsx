import { redirect } from 'next/navigation';
import Client from './client';
import { getBoxSlices, getLatestBoxSlices } from '@/utils/boxSlices';
import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/server';

interface PageProps {
  params: {
    pair: string;
  };
}

export default async function PairPage({ params }: PageProps) {
  const { pair } = params;
  const supabase = createClient();

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session) {
    return redirect(getURL('signin'));
  }

  const token = session.access_token;

  if (!token) {
    console.error('No token available for server-side request');
    return <div>Error: No token available</div>;
  }

  const initialData = await getBoxSlices(pair, undefined, 500, token);
  const allPairsData = await getLatestBoxSlices(token);

  return (
    <div className="w-full">
      <Client
        initialData={initialData}
        pair={pair}
        allPairsData={allPairsData}
      />
    </div>
  );
}
