'use client';
import { MotionDiv } from '@/components/MotionDiv';

interface CandleData {
  complete: boolean;
  volume: number;
  time: string;
  mid: {
    o: string;
    h: string;
    l: string;
    c: string;
  };
}

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface SectionMarketTickerProps {
  marketData: MarketData[];
}

export function SectionMarketTicker({ marketData }: SectionMarketTickerProps) {
  // Sort pairs alphabetically
  const sortedPairs = [...marketData].sort((a, b) =>
    a.pair.localeCompare(b.pair)
  );

  const getLatestPrice = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      return parseFloat(data[data.length - 1].mid.c);
    } catch (e) {
      return null;
    }
  };

  const getSparklinePoints = (
    candleData: string,
    width: number,
    height: number
  ) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const prices = data.map((d) => parseFloat(d.mid.c));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const range = max - min;

      if (range === 0) return null;

      return prices
        .map((price, i) => {
          const x = (i / (prices.length - 1)) * width;
          const y = height - ((price - min) / range) * height;
          return `${x},${y}`;
        })
        .join(' ');
    } catch (e) {
      return null;
    }
  };

  return (
    <section className="relative z-[1000] border-y border-white/10 bg-black/20 py-4">
      <div className="container mx-auto px-4">
        <div className="scrollbar-hide overflow-x-auto">
          <div
            className="animate-scroll flex gap-4"
            style={{ minWidth: 'max-content' }}
          >
            {sortedPairs.map((item) => {
              const latestPrice = getLatestPrice(item.candleData);

              return (
                <MotionDiv
                  key={item.pair}
                  className="flex h-16 w-48 items-center justify-between rounded-lg bg-black/40 px-3 transition-colors hover:bg-black/60"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex flex-col">
                    <h4 className="text-xs font-medium text-white/80">
                      {item.pair.replace('_', '/')}
                    </h4>
                    <div className="text-sm font-bold text-white">
                      {latestPrice
                        ? latestPrice.toFixed(item.pair.includes('JPY') ? 3 : 5)
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="h-12 w-20">
                    {getSparklinePoints(item.candleData, 80, 40) && (
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 80 40"
                        preserveAspectRatio="none"
                        className="overflow-visible"
                      >
                        <polyline
                          points={
                            getSparklinePoints(item.candleData, 80, 40) || ''
                          }
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    )}
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
