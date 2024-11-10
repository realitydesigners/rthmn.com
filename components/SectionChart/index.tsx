'use client';
import { useState } from 'react';
import { LineChart } from './LineChart';
import { MotionDiv } from '@/components/MotionDiv';
import { CandleData } from '@/types/types';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface SectionChartProps {
  marketData: MarketData[];
}

const MarketCard = ({
  item,
  isSelected,
  onClick
}: {
  item: MarketData;
  isSelected: boolean;
  onClick: () => void;
}) => {
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

  const latestPrice = getLatestPrice(item.candleData);
  const priceChange = getPriceChange(item.candleData);

  return (
    <MotionDiv
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`group relative flex h-[40px] cursor-pointer items-center justify-between rounded-md border px-3 backdrop-blur-sm transition-all duration-200 ${
        isSelected
          ? 'border-[#22c55e]/50 bg-[#22c55e]/10'
          : 'border-white/5 bg-black/40 hover:border-white/10 hover:bg-black/60'
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-md bg-[#22c55e]" />
      )}

      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-medium text-white/90">
          {item.pair.replace('_', '/')}
        </span>
        <span className="text-xs font-medium text-white/90">
          {latestPrice
            ? latestPrice.toFixed(item.pair.includes('JPY') ? 3 : 5)
            : 'N/A'}
        </span>
        <span
          className={`rounded-sm px-1.5 py-0.5 text-[9px] font-semibold ${
            priceChange >= 0
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {priceChange ? `${priceChange.toFixed(1)}%` : 'N/A'}
        </span>
      </div>
    </MotionDiv>
  );
};

const MarketStructure = () => (
  <div className="rounded-lg border border-white/5 bg-black/20 p-3">
    <h4 className="mb-2 text-xs font-medium text-white/70">Market Structure</h4>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'Trend Phase', value: 'Distribution' },
        { label: 'Volatility', value: 'Medium' },
        { label: 'Momentum', value: 'Decreasing' },
        { label: 'Volume Profile', value: 'Above Avg' }
      ].map((item) => (
        <div
          key={item.label}
          className="rounded border border-white/10 bg-black/20 p-2"
        >
          <div className="text-[10px] text-white/40">{item.label}</div>
          <div className="font-mono text-xs text-white/90">{item.value}</div>
        </div>
      ))}
    </div>
  </div>
);

const MarketStats = ({ candles }: { candles: any[] }) => {
  const getStats = () => {
    if (candles.length === 0) return { high: 0, low: 0, range: 0 };
    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));
    return {
      high: high.toFixed(5),
      low: low.toFixed(5),
      range: (((high - low) / low) * 100).toFixed(2)
    };
  };

  const stats = getStats();

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-green-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50">High</span>
          <span className="font-mono text-xs text-white">{stats.high}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-red-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50">Low</span>
          <span className="font-mono text-xs text-white">{stats.low}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/50">Range</span>
          <span className="font-mono text-xs text-white">{stats.range}%</span>
        </div>
      </div>
    </div>
  );
};

export function SectionChart({ marketData }: SectionChartProps) {
  const [selectedPair, setSelectedPair] = useState<string>(
    marketData[0]?.pair || ''
  );

  // Convert candleData string to Candle array format required by LineChart
  const processCandles = (candleDataString: string) => {
    try {
      const data = JSON.parse(candleDataString) as CandleData[];
      return data.map((candle) => ({
        time: candle.time,
        open: parseFloat(candle.mid.o),
        high: parseFloat(candle.mid.h),
        low: parseFloat(candle.mid.l),
        close: parseFloat(candle.mid.c),
        volume: candle.volume
      }));
    } catch (e) {
      return [];
    }
  };

  // Sort pairs alphabetically
  const sortedPairs = [...marketData].sort((a, b) =>
    a.pair.localeCompare(b.pair)
  );

  const selectedMarketData = marketData.find(
    (item) => item.pair === selectedPair
  );
  const candles = selectedMarketData
    ? processCandles(selectedMarketData.candleData)
    : [];

  // Add a helper function at the component level to avoid duplication
  const getPriceInfo = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      const firstPrice = parseFloat(data[0].mid.o);
      const lastPrice = parseFloat(data[data.length - 1].mid.c);
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      return {
        price: lastPrice,
        change: change
      };
    } catch (e) {
      return { price: null, change: null };
    }
  };

  return (
    <section className="relative z-[100] px-16 py-24 xl:px-32">
      <div className="rounded-md border border-white/5 bg-black/90 p-4 backdrop-blur-sm">
        <div className="flex gap-4">
          {/* Main Chart Area */}
          <div className="flex-1">
            {/* Chart Header */}
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">
                    {selectedPair.replace('_', '/')}
                  </h2>
                  {selectedMarketData && (
                    <>
                      <span className="font-mono text-lg text-white">
                        {getPriceInfo(
                          selectedMarketData.candleData
                        ).price?.toFixed(selectedPair.includes('JPY') ? 3 : 5)}
                      </span>
                      <span
                        className={`rounded-sm px-2 py-1 text-xs font-semibold ${
                          getPriceInfo(selectedMarketData.candleData).change >=
                          0
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {getPriceInfo(
                          selectedMarketData.candleData
                        ).change?.toFixed(1)}
                        %
                      </span>
                    </>
                  )}
                </div>
                <MarketStats candles={candles} />
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative overflow-hidden rounded-lg border border-white/5 bg-black/40 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
              {candles.length > 0 && (
                <div className="h-[600px]">
                  <LineChart pair={selectedPair} candles={candles} />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[250px] flex-shrink-0 space-y-4">
            <div className="rounded-lg border border-white/5 bg-black/40 p-3 backdrop-blur-sm">
              <h3 className="mb-3 text-sm font-medium text-white/70">
                Market Overview
              </h3>
              <div className="max-h-[500px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {sortedPairs.map((item) => (
                    <MarketCard
                      key={item.pair}
                      item={item}
                      isSelected={selectedPair === item.pair}
                      onClick={() => setSelectedPair(item.pair)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <MarketStructure />
          </div>
        </div>
      </div>
    </section>
  );
}
