"use client";

import type { CandleData } from "@/types/types";
import { useState } from "react";
import { FaBell, FaChevronRight, FaSearch, FaStar } from "react-icons/fa";

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
  type: "price" | "volatility" | "pattern";
  condition: string;
  value: number;
}

export function MarketNavigator({
  marketData,
  selectedPair,
  onPairSelect,
}: MarketNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["EUR_USD", "GBP_USD"]);
  const [alerts, setAlerts] = useState<SavedAlert[]>([
    {
      pair: "EUR_USD",
      type: "price",
      condition: "above",
      value: 1.085,
    },
    {
      pair: "GBP_USD",
      type: "volatility",
      condition: "above",
      value: 0.5,
    },
  ]);

  const getLatestPrice = (candleData: string) => {
    try {
      const data = JSON.parse(candleData) as CandleData[];
      return Number.parseFloat(data[data.length - 1].mid.c);
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
        <FaSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#818181]" />
        <input
          type="text"
          placeholder="Search pairs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="font-russo w-full rounded-lg border py-2 pr-4 pl-10 text-sm text-white placeholder-[#818181] outline-hidden focus:border-[#1C1E23]"
          style={{
            background:
              "linear-gradient(180deg, #0A0B0D -10.71%, #070809 100%)",
            borderColor: "#111215",
          }}
        />
      </div>

      {/* Market Categories */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className="rounded-lg border p-3 text-left hover:opacity-80 transition-opacity"
          style={{
            background:
              "linear-gradient(180deg, #0A0B0D -10.71%, #070809 100%)",
            borderColor: "#111215",
          }}
        >
          <span className="font-russo text-sm font-medium text-white">
            Favorites
          </span>
          <div className="mt-1 text-xs text-[#818181]">
            {favorites.length} pairs
          </div>
        </button>
      </div>

      {/* Market List */}
      <div
        className="scrollbar-thin flex-1 overflow-y-auto rounded-lg border p-2"
        style={{
          background: "linear-gradient(180deg, #0A0B0D -10.71%, #070809 100%)",
          borderColor: "#111215",
        }}
      >
        <div className="space-y-1">
          {filteredPairs.map((item) => {
            const price = getLatestPrice(item.candleData);
            const isFavorite = favorites.includes(item.pair);
            const hasAlerts = alerts.some((alert) => alert.pair === item.pair);

            return (
              <div
                key={item.pair}
                onClick={() => onPairSelect(item.pair)}
                className={`group flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-3 transition-all overflow-hidden ${
                  selectedPair === item.pair
                    ? "bg-gradient-to-b from-[#191B1F] to-[#131618] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                    : "hover:bg-gradient-to-b hover:from-[#1A1D22] hover:to-[#0F1114]"
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
                        ? "text-[#4EFF6E]"
                        : "text-[#818181] hover:text-[#4EFF6E]"
                    }`}
                  >
                    <FaStar className="h-4 w-4" />
                  </button>
                  <div>
                    <div className="font-russo text-sm font-medium text-white">
                      {item.pair.replace("_", "/")}
                    </div>
                    <div className="text-xs text-[#818181]">
                      {price?.toFixed(item.pair.includes("JPY") ? 3 : 5)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasAlerts && <FaBell className="h-3 w-3 text-[#4EFF6E]" />}
                  <FaChevronRight className="h-3 w-3 text-[#818181] transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
