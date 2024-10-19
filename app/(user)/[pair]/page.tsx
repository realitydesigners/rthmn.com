import { redirect } from 'next/navigation';
import PairClient from './PairClient';
import { getBoxSlices, getLatestBoxSlices } from '@/utils/boxSlices';
import { getURL } from '@/utils/helpers';
import { getServerClient } from '@/utils/supabase/server';

interface PageProps {
  params: {
    pair: string;
  };
}

export default async function PairPage({ params }: PageProps) {
  const { pair } = params;
  const supabase = getServerClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect(getURL('signin'));
  }

  const initialData = await getBoxSlices(pair, undefined, 500);

  if (initialData.length === 0) {
    console.error(`No data received for ${pair}`);
    return <div>Error: No data available for {pair}</div>;
  }

  const allPairsData = await getLatestBoxSlices();

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
