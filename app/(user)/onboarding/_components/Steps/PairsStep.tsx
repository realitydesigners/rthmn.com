"use client";

import { useUser } from "@/providers/UserProvider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import {
  CRYPTO_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
  FOREX_PAIRS,
  INSTRUMENTS,
} from "@/utils/instruments";
import { setSelectedPairs as saveToLocalStorage } from "@/utils/localStorage";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface Props {
  favorites: string[];
  setSelectedPairs: (pairs: string[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const MIN_PAIRS_REQUIRED = 4;

const formatPrice = (price: number, instrument: string) => {
  let digits = 2; // default
  for (const category of Object.values(INSTRUMENTS)) {
    if (instrument in category) {
      digits = category[instrument].digits;
      break;
    }
  }
  return price.toFixed(digits);
};

export default function PairsStep({
  favorites,
  setSelectedPairs,
  onValidationChange,
}: Props) {
  const { togglePair } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const { priceData } = useWebSocket();

  // Update validation whenever selected pairs change
  useEffect(() => {
    onValidationChange?.(favorites.length >= MIN_PAIRS_REQUIRED);
  }, [favorites, onValidationChange]);

  const handlePairClick = (pair: string) => {
    const newSelectedPairs = favorites.includes(pair)
      ? favorites.filter((p) => p !== pair)
      : [...favorites, pair];

    setSelectedPairs(newSelectedPairs);
    saveToLocalStorage(newSelectedPairs);
    togglePair(pair);
  };

  const groups = [
    { label: "FX", items: FOREX_PAIRS },
    { label: "CRYPTO", items: CRYPTO_PAIRS },
    { label: "STOCKS", items: EQUITY_PAIRS },
    { label: "ETF", items: ETF_PAIRS },
  ];

  const getFilteredGroups = () => {
    if (!searchQuery) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  };

  return (
    <div className="flex h-[60vh] flex-col">
      <div className="flex-shrink-0 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-russo text-2xl sm:text-3xl font-bold text-white"
          >
            Select Trading Instruments
          </motion.h2>
          <div className="flex items-center justify-between">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-kodemono pr-4 text-sm sm:text-base text-white/60"
            >
              Choose your favorite trading pairs, you can always add more later
            </motion.p>

            {/* Refined Selection Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(MIN_PAIRS_REQUIRED)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1 w-4 sm:w-6 rounded-full transition-all duration-300 ${i < favorites.length ? "bg-[#24FF66]" : "bg-[#32353C]"}`}
                    initial={false}
                    animate={{
                      scale: i < favorites.length ? 1 : 0.95,
                    }}
                  />
                ))}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium transition-all duration-300 ${favorites.length >= MIN_PAIRS_REQUIRED ? "text-[#24FF66]" : "text-[#32353C]"}`}
              >
                {favorites.length}/{MIN_PAIRS_REQUIRED}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-xl border border-[#1C1E23]/60 bg-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-[#24FF66]/50 focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            {/* Top highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

            <div className="flex h-8 sm:h-10 w-full items-center">
              <FaSearch className="ml-3 sm:ml-4 text-sm sm:text-base text-white/60" />
              <input
                type="text"
                placeholder="Search instruments..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value.replace(/\s/g, "").toUpperCase()
                  )
                }
                className="font-kodemono w-full bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scrollable Pairs Grid */}
      <div
        className="mt-3 sm:mt-4 flex-1 space-y-2 overflow-y-auto pr-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#333 transparent",
        }}
      >
        {/* Scrollbar Styles */}
        <style jsx global>{`
          .overflow-y-auto::-webkit-scrollbar {
            width: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: transparent;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background-color: #333;
            border-radius: 20px;
          }
        `}</style>

        {getFilteredGroups().map((group, groupIndex) => {
          const pairs = group.items;
          if (pairs.length === 0) return null;

          return (
            <div key={group.label}>
              <h3 className="font-kodemono sticky top-0 z-90 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium tracking-wider text-white/50 uppercase">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {pairs.map((item, index) => {
                  const isSelected = favorites.includes(item);

                  return (
                    <button
                      key={item}
                      onClick={() => handlePairClick(item)}
                      className={`group relative w-full overflow-hidden rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? "border-[#24FF66]/50 bg-black shadow-[0_0_20px_rgba(36,255,102,0.2)]"
                          : "border-[#1C1E23]/60 bg-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#24FF66]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                      }`}
                    >
                      {/* Top highlight */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

                      {/* Selection highlight - no opacity transitions */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#24FF66]/10 to-transparent" />
                      )}

                      <div className="relative flex items-center justify-between rounded-xl p-2.5 sm:p-4">
                        <div className="flex items-center">
                          <span
                            className={`font-russo text-xs sm:text-[13px] font-bold tracking-wider ${isSelected ? "text-white" : "text-white/80"}`}
                          >
                            {item}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`font-kodemono mr-2 sm:mr-3 text-xs sm:text-[13px] font-medium tracking-wider group-hover:mr-3 sm:group-hover:mr-4 ${isSelected ? "text-[#24FF66]" : "text-white/50"}`}
                          >
                            {priceData[item]?.price
                              ? formatPrice(priceData[item].price, item)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
