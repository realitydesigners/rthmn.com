'use client';
import { useState } from 'react';
import { LineChart } from './LineChart';
import { MotionDiv } from '@/components/MotionDiv';
import styles from './stykes.module.css';

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
      className={`group relative flex h-[52px] w-full cursor-pointer items-center justify-between rounded-md border px-3 backdrop-blur-sm transition-all duration-200 ${
        isSelected
          ? 'border-[#22c55e]/50 bg-[#22c55e]/10'
          : 'border-white/5 bg-black/40 hover:border-white/10 hover:bg-black/60'
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-md bg-[#22c55e]" />
      )}

      <div className="flex flex-col gap-[2px]">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-medium text-white/90">
            {item.pair.replace('_', '/')}
          </h4>
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
        <div className="text-sm font-bold tracking-tight text-white group-hover:text-white/90">
          {latestPrice
            ? latestPrice.toFixed(item.pair.includes('JPY') ? 3 : 5)
            : 'N/A'}
        </div>
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

export function SectionChart({ marketData }: SectionChartProps) {
  const [selectedPair, setSelectedPair] = useState<string>(
    marketData[0]?.pair || ''
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [selectedTab, setSelectedTab] = useState('market');

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

  return (
    <section className="relative z-[100] bg-gradient-to-b from-black/40 to-black/20 py-24">
      <div className="container mx-auto px-4">
        <div className="flex gap-4">
          {/* Updated Left Sidebar */}
          <div className="flex w-64 flex-col gap-4">
            <div className="rounded-xl border border-white/5 bg-black/40 p-3 backdrop-blur-sm">
              <h3 className="mb-3 text-sm font-medium text-white/80">
                Market Analysis
              </h3>
              <div className="flex flex-col gap-4">
                <MarketStructure />
              </div>
            </div>
          </div>

          {/* Main Chart Area - keep existing code but update styling */}
          <div className="flex-1">
            {/* Chart Controls */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">
                  {selectedPair.replace('_', '/')}
                </h2>
                <div className="flex items-center rounded-lg border border-white/10 bg-black/20 p-1">
                  {['5M', '15M', '1H', '4H', '1D'].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedTimeframe === timeframe
                          ? 'rounded-md bg-[#22c55e] text-black'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Updated Chart Container */}
            <div className="relative h-[600px] overflow-hidden rounded-xl border border-white/5 bg-black/40 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
              {candles.length > 0 && (
                <LineChart pair={selectedPair} candles={candles} />
              )}
            </div>

            {/* Updated Bottom Panel */}
          </div>

          {/* Right Sidebar - Market Data */}
          <div className="flex w-52 flex-col rounded-xl border border-white/5 bg-black/40 shadow-2xl backdrop-blur-sm">
            <div className="border-b border-white/5 p-3">
              <h3 className="mb-2 text-sm font-medium text-white/80">
                Markets
              </h3>
              <input
                type="text"
                placeholder="Search pairs..."
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
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
        </div>
      </div>
    </section>
  );
}
