'use client';
import { useState, useEffect } from 'react';
import type { CandleData } from '@/types/types';
import { FaStar, FaSearch, FaBell, FaChevronRight } from 'react-icons/fa';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface MarketNavigatorProps {
  marketData: MarketData[];
  selectedPair: string;
  onPairSelect: (pair: string) => void;
}

interface SavedAlert {
  pair: string;
  type: 'price' | 'volatility' | 'pattern';
  condition: string;
  value: number;
}

export function MarketNavigator({
  marketData,
  selectedPair,
  onPairSelect
}: MarketNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['EUR_USD', 'GBP_USD']);
  const [alerts, setAlerts] = useState<SavedAlert[]>([
    {
      pair: 'EUR_USD',
      type: 'price',
      condition: 'above',
      value: 1.085
    },
    {
      pair: 'GBP_USD',
      type: 'volatility',
      condition: 'above',
      value: 0.5
    }
  ]);

  const getLatestPrice = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      return parseFloat(data[data.length - 1].mid.c);
    } catch (e) {
      return null;
    }
  };

  const toggleFavorite = (pair: string) => {
    setFavorites((prev) =>
      prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]
    );
  };

  const filteredPairs = marketData.filter((item) =>
    item.pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search pairs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/5 bg-black/40 py-2 pl-10 pr-4 font-outfit text-sm text-white placeholder-white/40 outline-hidden focus:border-white/10"
        />
      </div>

      {/* Market Categories */}
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-lg border border-white/5 bg-black/40 p-3 text-left hover:border-white/10">
          <span className="font-outfit text-sm font-medium text-white">
            Favorites
          </span>
          <div className="mt-1 text-xs text-white/40">
            {favorites.length} pairs
          </div>
        </button>
      </div>

      {/* Market List */}
      <div className="scrollbar-thin scrollbar-track-white/5 flex-1 overflow-y-auto rounded-lg border border-white/5 bg-black/40 p-2">
        <div className="space-y-1">
          {filteredPairs.map((item) => {
            const price = getLatestPrice(item.candleData);
            const isFavorite = favorites.includes(item.pair);
            const hasAlerts = alerts.some((alert) => alert.pair === item.pair);

            return (
              <div
                key={item.pair}
                onClick={() => onPairSelect(item.pair)}
                className={`group flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-3 transition-all hover:border-white/10 hover:bg-white/5 ${
                  selectedPair === item.pair ? 'border-white/10 bg-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.pair);
                    }}
                    className={`transition-colors ${
                      isFavorite
                        ? 'text-yellow-500'
                        : 'text-white/20 hover:text-yellow-500'
                    }`}
                  >
                    <FaStar className="h-4 w-4" />
                  </button>
                  <div>
                    <div className="font-outfit text-sm font-medium text-white">
                      {item.pair.replace('_', '/')}
                    </div>
                    <div className="text-xs text-white/40">
                      {price?.toFixed(item.pair.includes('JPY') ? 3 : 5)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasAlerts && <FaBell className="h-3 w-3 text-emerald-500" />}
                  <FaChevronRight className="h-3 w-3 text-white/20 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
