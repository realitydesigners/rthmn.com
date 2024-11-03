'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface SectionMarketDisplayProps {
  marketData: MarketData[];
}

export function SectionMarketDisplay({
  marketData
}: SectionMarketDisplayProps) {
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  // Sort pairs alphabetically
  const sortedPairs = [...marketData].sort((a, b) =>
    a.pair.localeCompare(b.pair)
  );

  const getLatestPrice = (candleData: string) => {
    try {
      const data = JSON.parse(candleData);
      return data[data.length - 1].close;
    } catch (e) {
      return null;
    }
  };

  const getPriceChange = (candleData: string) => {
    try {
      const data = JSON.parse(candleData);
      const firstPrice = data[0].open;
      const lastPrice = data[data.length - 1].close;
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      return change;
    } catch (e) {
      return null;
    }
  };

  return (
    <section className="bg-black py-24">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold text-white">Market Overview</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedPairs.map((item) => {
            const latestPrice = getLatestPrice(item.candleData);
            const priceChange = getPriceChange(item.candleData);

            return (
              <motion.div
                key={item.pair}
                className="cursor-pointer rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPair(item.pair)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-lg font-medium text-white">
                    {item.pair.replace('_', '/')}
                  </h4>
                  <span
                    className={`text-sm ${
                      priceChange && priceChange >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {priceChange ? `${priceChange.toFixed(2)}%` : 'N/A'}
                  </span>
                </div>
                <div className="mb-2 text-2xl font-bold text-white">
                  {latestPrice
                    ? latestPrice.toFixed(item.pair.includes('JPY') ? 3 : 5)
                    : 'N/A'}
                </div>
                <div className="text-xs text-white/60">
                  Last updated: {new Date(item.lastUpdated).toLocaleString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
