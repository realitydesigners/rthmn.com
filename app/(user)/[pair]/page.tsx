import { redirect } from 'next/navigation';
import PairClient from './PairClient';
import {
  getBoxSlicesSocket,
  getLatestBoxSlicesSocket
} from '@/utils/boxSlicesSocket';
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
