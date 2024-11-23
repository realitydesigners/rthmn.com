'use client';
import { MotionDiv } from '@/components/MotionDiv';
import { CandleData } from '@/types/types';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface MarketCardProps {
  item: MarketData;
  prefix: string;
}

const MarketCard = ({ item, prefix }: MarketCardProps) => {
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

  const getPriceChange = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const firstPrice = parseFloat(data[0].mid.o);
      const lastPrice = parseFloat(data[data.length - 1].mid.c);
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      return change;
    } catch (e) {
      return null;
    }
  };

  const latestPrice = getLatestPrice(item.candleData);
  const priceChange = getPriceChange(item.candleData);

  return (
    <MotionDiv
      key={`${prefix}-${item.pair}`}
      className="flex h-12 w-36 items-center justify-between rounded-[4px] border border-white/10 bg-black/40 px-1.5 shadow-lg backdrop-blur-sm transition-all hover:border-white/20 hover:bg-black/60"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex flex-col gap-[2px]">
        <div className="flex items-center gap-1">
          <h4 className="text-[10px] font-medium text-white/70">
            {item.pair.replace('_', '/')}
          </h4>
          <span
            className={`text-[8px] ${
              priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {priceChange ? `${priceChange.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div className="text-[11px] font-bold tracking-tight text-white">
          {latestPrice
            ? latestPrice.toFixed(item.pair.includes('JPY') ? 3 : 5)
            : 'N/A'}
        </div>
      </div>

      <div className="h-7 w-12 pr-1">
        {getSparklinePoints(item.candleData, 48, 28) && (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 48 28"
            preserveAspectRatio="none"
            className="overflow-visible opacity-80"
          >
            <polyline
              points={getSparklinePoints(item.candleData, 48, 28) || ''}
              fill="none"
              stroke={priceChange >= 0 ? '#4ade80' : '#f87171'}
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>
    </MotionDiv>
  );
};

interface SectionMarketTickerProps {
  marketData: MarketData[];
}

export function SectionMarketTicker({ marketData }: SectionMarketTickerProps) {
  const sortedPairs = [...marketData].sort((a, b) =>
    a.pair.localeCompare(b.pair)
  );

  return (
    <section className="absolute left-0 right-0 z-100 mt-20 w-full overflow-hidden bg-black/20 backdrop-blur-[2px]">
      <div className="animate-marquee flex gap-2 p-1.5">
        {/* First set of cards */}
        {sortedPairs.map((item) => (
          <MarketCard key={`first-${item.pair}`} item={item} prefix="first" />
        ))}

        {/* Duplicate set for seamless loop */}
        {sortedPairs.map((item) => (
          <MarketCard key={`second-${item.pair}`} item={item} prefix="second" />
        ))}
      </div>
    </section>
  );
}
