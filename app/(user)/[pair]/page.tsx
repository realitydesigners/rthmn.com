import { marketDataQuery } from '@/sanity/lib/queries';
import { client } from '@/sanity/lib/client';
import { MarketDataDisplay } from '@/components/MarketDataDisplay/index';

export default async function PairPage({
  params
}: {
  params: { pair: string };
}) {
  const marketData = await client.fetch(marketDataQuery, { pair: params.pair });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">{params.pair}</h1>
      <MarketDataDisplay
        pair={params.pair}
        lastUpdated={marketData?.lastUpdated}
        candleData={
          marketData?.candleData ? JSON.parse(marketData.candleData) : []
        }
      />
    </div>
  );
}
