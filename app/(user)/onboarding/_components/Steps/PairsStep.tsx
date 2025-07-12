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

const MIN_PAIRS_REQUIRED = 3;

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
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-kodemono text-sm sm:text-base text-white/60 mb-4"
          >
            Choose your favorite trading pairs, you can always add more later
          </motion.p>

          {/* Enhanced Requirement Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden"
            style={{
              borderRadius: "10px",
              background:
                favorites.length >= MIN_PAIRS_REQUIRED
                  ? "linear-gradient(180deg, #0F1114 -10.71%, #080A0D 100%)"
                  : "linear-gradient(180deg, #0F1114 -10.71%, #080A0D 100%)",
              border:
                favorites.length >= MIN_PAIRS_REQUIRED
                  ? "1px solid #24FF66/50"
                  : "1px solid #FF6B6B/30",
            }}
          >
            {/* Outer glow ring */}
            <div
              className="absolute -inset-px rounded-xl opacity-30"
              style={{
                background:
                  favorites.length >= MIN_PAIRS_REQUIRED
                    ? "linear-gradient(180deg, #24FF66/20 0%, transparent 50%)"
                    : "linear-gradient(180deg, #FF6B6B/20 0%, transparent 50%)",
                filter: "blur(0.5px)",
              }}
            />

            {/* Top highlight gradient */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
              style={{
                background:
                  favorites.length >= MIN_PAIRS_REQUIRED
                    ? "linear-gradient(90deg, transparent, #4EFF6E/15, transparent)"
                    : "linear-gradient(90deg, transparent, #FF6B6B/15, transparent)",
              }}
            />

            {/* Bottom subtle shadow line */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />

            {/* Subtle inner glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                borderRadius: "10px",
                background:
                  "linear-gradient(180deg, #32353C/15 0%, transparent 50%)",
              }}
            />

            <div className="relative flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                    favorites.length >= MIN_PAIRS_REQUIRED
                      ? "bg-[#24FF66]/20 text-[#24FF66]"
                      : "bg-[#FF6B6B]/20 text-[#FF6B6B]"
                  }`}
                >
                  {favorites.length >= MIN_PAIRS_REQUIRED ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 8v4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 16h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Status Message */}
                <div className="flex flex-col">
                  <span
                    className={`font-outfit text-sm font-medium transition-all duration-300 ${
                      favorites.length >= MIN_PAIRS_REQUIRED
                        ? "text-[#24FF66]"
                        : "text-[#FF6B6B]"
                    }`}
                  >
                    {favorites.length >= MIN_PAIRS_REQUIRED
                      ? "Perfect! You can continue"
                      : "Select at least 3 instruments to continue"}
                  </span>
                  <span className="font-kodemono text-xs text-white/50">
                    {favorites.length >= MIN_PAIRS_REQUIRED
                      ? "All requirements met"
                      : `${MIN_PAIRS_REQUIRED - favorites.length} more needed`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div
            className="group/search relative flex h-12 items-center rounded-lg border transition-all duration-300 border-[#1C1E23]/40 hover:border-[#32353C]/60"
            style={{
              background:
                "linear-gradient(180deg, #0F1114 -10.71%, #080A0D 100%)",
            }}
          >
            {/* Search Icon */}
            <div className="relative ml-3 transition-colors duration-300 text-[#818181]">
              <FaSearch size={12} />
            </div>

            {/* Input */}
            <input
              type="text"
              spellCheck={false}
              placeholder="Search instruments..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/\s/g, "");
                setSearchQuery(value);
              }}
              className="font-outfit relative h-full flex-1 bg-transparent px-3 text-[13px] font-medium text-white placeholder-[#818181] transition-colors outline-none"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="relative mr-3 flex h-5 w-5 items-center justify-center rounded text-[#818181] transition-all hover:text-white hover:bg-[#1C1E23]/50"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
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
                      className="group relative w-full overflow-hidden transition-all duration-300"
                      style={{
                        borderRadius: "8px",
                        background:
                          "linear-gradient(180deg, #0F1114 -10.71%, #080A0D 100%)",
                        border: isSelected
                          ? "1px solid #24FF66/50"
                          : "1px solid #16181C",
                      }}
                    >
                      {/* Outer glow ring */}
                      <div
                        className="absolute -inset-px rounded-lg opacity-30"
                        style={{
                          background:
                            "linear-gradient(180deg, #32353C/20 0%, transparent 50%)",
                          filter: "blur(0.5px)",
                        }}
                      />

                      {/* Top highlight gradient */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4EFF6E]/15 to-transparent" />

                      {/* Bottom subtle shadow line */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />

                      {/* Subtle inner glow */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                          borderRadius: "8px",
                          background:
                            "linear-gradient(180deg, #32353C/15 0%, transparent 50%)",
                        }}
                      />

                      {/* Inner border for depth */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)",
                        }}
                      />

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
