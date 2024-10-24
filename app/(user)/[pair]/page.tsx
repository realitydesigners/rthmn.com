import Client from './client';
import { getLatestBoxSlices } from '@/utils/boxSlices';

interface PageProps {
  params: {
    pair: string;
  };
}

export default async function PairPage({ params }: PageProps) {
  const { pair } = params;

  return (
    <div className="w-full">
      <Client pair={pair} />
    </div>
  );
}
