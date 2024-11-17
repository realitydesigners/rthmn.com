'use client';
import { useState } from 'react';
import { MotionDiv } from '@/components/MotionDiv';
import { CandleData } from '@/types/types';

// interface CandleData {
//   complete: boolean;
//   volume: number;
//   time: string;
//   mid: {
//     o: string;
//     h: string;
//     l: string;
//     c: string;
//   };
// }

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface SectionMarketDisplayProps {
  marketData: MarketData[];
}

export function MarketDisplay({ marketData }: SectionMarketDisplayProps) {
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

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

  const getVolume = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      return data[data.length - 1].volume;
    } catch (e) {
      return null;
    }
  };

  const getDayHighLow = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const highPrices = data.map((candle) => parseFloat(candle.mid.h));
      const lowPrices = data.map((candle) => parseFloat(candle.mid.l));
      return {
        high: Math.max(...highPrices),
        low: Math.min(...lowPrices)
      };
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

      // Create points for the sparkline
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
    <section className="relative z-[100]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedPairs.map((item) => {
          const latestPrice = getLatestPrice(item.candleData);
          const priceChange = getPriceChange(item.candleData);
          const volume = getVolume(item.candleData);

          return (
            <MotionDiv
              key={item.pair}
              className="border-gray cursor-pointer rounded-lg bg-black/50 p-4 transition-colors"
              onClick={() => setSelectedPair(item.pair)}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-outfit text-lg font-medium text-white">
                    {item.pair.replace('_', '/')}
                  </h4>
                </div>
                <span
                  className={`font-kodemono text-xs ${
                    priceChange && priceChange >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {priceChange ? `${priceChange.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div className="mb-2 font-kodemono text-2xl font-bold text-white">
                {latestPrice
                  ? latestPrice.toFixed(item.pair.includes('JPY') ? 3 : 5)
                  : 'N/A'}
              </div>
              {getDayHighLow(item.candleData) && (
                <div className="mb-6 flex justify-between font-kodemono text-xs text-white/60">
                  <span>
                    High:{' '}
                    {getDayHighLow(item.candleData)?.high.toFixed(
                      item.pair.includes('JPY') ? 3 : 5
                    )}
                  </span>
                  <span>
                    Low:{' '}
                    {getDayHighLow(item.candleData)?.low.toFixed(
                      item.pair.includes('JPY') ? 3 : 5
                    )}
                  </span>
                </div>
              )}
              <div className="mb-2 h-16 w-full">
                {getSparklinePoints(item.candleData, 200, 60) && (
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 60"
                    preserveAspectRatio="none"
                    className="overflow-visible"
                  >
                    <polyline
                      points={
                        getSparklinePoints(item.candleData, 200, 60) || ''
                      }
                      fill="none"
                      stroke={
                        getPriceChange(item.candleData) >= 0
                          ? '#4ade80'
                          : '#f87171'
                      }
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
    </section>
  );
}
