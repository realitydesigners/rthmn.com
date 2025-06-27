"use client";

import { useUser } from "@/providers/UserProvider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import { useGridStore } from "@/stores/gridStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/utils/cn";
import {
  CRYPTO_PAIRS,
  EQUITY_PAIRS,
  ETF_PAIRS,
  FOREX_PAIRS,
} from "@/utils/instruments";
import { formatPrice } from "@/utils/instruments";
import { Reorder, useDragControls } from "framer-motion";
import { motion } from "framer-motion";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
  useCallback,
} from "react";
import { FaSearch, FaStar, FaTimes } from "react-icons/fa";

interface LoadingSpinnerProps {
  color?: string;
  itemId: string;
}

const LoadingSpinner = ({ color = "#3b82f6" }: LoadingSpinnerProps) => {
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (showFallback) {
    return (
      <span className="font-mono text-[11px] tracking-wider opacity-50">
        N/A
      </span>
    );
  }

  return (
    <div className="relative h-3 w-3">
      <div
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: `${color}20` }}
      />
      <div
        className="absolute inset-0 animate-spin rounded-full border-t-2"
        style={{ borderColor: color }}
      />
    </div>
  );
};

interface PairItemProps {
  item: string;
  isSelected?: boolean;
  onToggle: () => void;
  price?: number;
}

const PairItem = memo(
  ({ item, isSelected = false, onToggle }: Omit<PairItemProps, "price">) => {
    const { currentStepId } = useOnboardingStore();
    const { boxColors } = useUser();
    const { priceData } = useWebSocket();
    const isOnboardingActive = currentStepId === "instruments"; // ??
    const price = priceData[item]?.price;

    return (
      <div
        className={cn(
          "group/item relative flex h-10 w-full items-center transition-all duration-300 select-none overflow-hidden",
          isSelected
            ? "bg-gradient-to-b from-[#191B1F] to-[#131618] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            : ""
        )}
        style={{ borderRadius: "4px" }}
      >
        {/* Hover background for non-selected items */}
        {!isSelected && (
          <div
            className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
              boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
            }}
          />
        )}
        <div className="relative flex w-full items-center px-3">
          {/* Instrument name */}
          <span
            className={cn(
              "font-outfit flex-1 text-sm font-bold tracking-wide transition-colors",
              isSelected
                ? "text-white"
                : "text-[#32353C] group-hover/item:text-[#545963]"
            )}
          >
            {item}
          </span>

          {/* Price */}
          <div className="flex items-center">
            <span
              className={cn(
                "font-kodemono  w-[70px] text-right text-sm tracking-wider transition-colors",
                isSelected
                  ? "text-[#545963]"
                  : "text-[#32353C] group-hover/item:text-[#32353C]"
              )}
            >
              {price ? (
                formatPrice(price, item)
              ) : (
                <LoadingSpinner
                  key={`${item}-loading`}
                  itemId={item}
                  color={isSelected ? boxColors.positive : "#444"}
                />
              )}
            </span>
            <div className="z-90 ml-2 flex w-6 justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className={cn(
                  "relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
                  "opacity-0 group-hover/item:opacity-100",
                  isSelected
                    ? [
                        "border-[#111215] bg-[#111215] text-white/40",
                        "hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
                      ]
                    : [
                        "border-[#111215] bg-[#111215] text-white/40",
                        "hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
                      ]
                )}
              >
                {isSelected ? (
                  <FaTimes size={8} />
                ) : (
                  <span className="text-[9px] font-medium">+</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

interface PairGroupProps {
  label: string;
  items: React.ReactNode;
  count: number;
  isSelected?: boolean;
}

const PairGroup = memo(
  ({ label, items, count, isSelected = false }: PairGroupProps) => {
    return (
      <div className="mb-8">
        <div className="space-y-1 animate-in fade-in duration-300">{items}</div>
      </div>
    );
  }
);

// Component to highlight search terms within text
const HighlightedText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span
            key={index}
            className="bg-[#4EFF6E] text-[#111316] px-1 rounded-sm font-medium"
          >
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

// Search result item with highlighting
const SearchPairItem = memo(
  ({
    item,
    searchQuery,
    isSelected = false,
    onToggle,
  }: {
    item: string;
    searchQuery: string;
    isSelected?: boolean;
    onToggle: () => void;
  }) => {
    const { boxColors } = useUser();
    const { priceData } = useWebSocket();
    const price = priceData[item]?.price;

    return (
      <div
        className={cn(
          "group/item relative flex h-10 w-full items-center transition-all duration-300 select-none overflow-hidden",
          isSelected
            ? "rounded bg-gradient-to-b from-[#191B1F] to-[#131618] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            : "rounded-lg"
        )}
        style={isSelected ? { borderRadius: "4px" } : {}}
      >
        {/* Hover background for non-selected items */}
        {!isSelected && (
          <div
            className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
              boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
            }}
          />
        )}
        <div className="relative flex w-full items-center px-3">
          {/* Instrument name with highlighting */}
          <span
            className={cn(
              "font-outfit flex-1 text-sm font-bold tracking-wide transition-colors",
              isSelected
                ? "text-white"
                : "text-[#32353C] group-hover/item:text-[#545963]"
            )}
          >
            <HighlightedText text={item} highlight={searchQuery} />
          </span>

          {/* Price */}
          <div className="flex items-center">
            <span
              className={cn(
                "font-kodemono w-[70px] text-right text-sm tracking-wider transition-colors",
                isSelected
                  ? "text-[#545963]"
                  : "text-[#32353C] group-hover/item:text-[#32353C]"
              )}
            >
              {price ? (
                formatPrice(price, item)
              ) : (
                <LoadingSpinner
                  key={`${item}-loading`}
                  itemId={item}
                  color={isSelected ? boxColors.positive : "#444"}
                />
              )}
            </span>
            <div className="z-90 ml-2 flex w-6 justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className={cn(
                  "relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
                  "opacity-0 group-hover/item:opacity-100",
                  isSelected
                    ? [
                        "border-[#111215] bg-[#111215] text-white/40",
                        "hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
                      ]
                    : [
                        "border-[#111215] bg-[#111215] text-white/40",
                        "hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60",
                      ]
                )}
              >
                {isSelected ? (
                  <FaTimes size={8} />
                ) : (
                  <span className="text-[9px] font-medium">+</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Memoized filtered pairs calculation
const useFilteredPairs = (searchQuery: string, selectedPairs: string[]) => {
  return useMemo(() => {
    if (!searchQuery) return [];

    const allPairs = [
      ...FOREX_PAIRS,
      ...CRYPTO_PAIRS,
      ...EQUITY_PAIRS,
      ...ETF_PAIRS,
    ];
    return allPairs
      .filter((pair) => pair.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const aSelected = selectedPairs.includes(a);
        const bSelected = selectedPairs.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });
  }, [searchQuery, selectedPairs]);
};

const SearchBar = memo(
  ({
    searchQuery,
    onSearchChange,
    onFocus,
    onBlur,
    isFocused,
  }: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    isFocused: boolean;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut to focus search
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "/" && !isFocused) {
          e.preventDefault();
          inputRef.current?.focus();
        }
        if (e.key === "Escape" && isFocused) {
          inputRef.current?.blur();
          onSearchChange("");
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isFocused, onSearchChange]);

    return (
      <div className="relative">
        {/* Search Input */}
        <div
          className="group/search relative flex h-10 items-center overflow-hidden transition-all duration-300"
          style={{
            borderRadius: "4px",
            background:
              "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Search Icon */}
          <div
            className={cn(
              "relative ml-3 transition-colors duration-300",
              isFocused ? "text-[#4EFF6E]" : "text-[#32353C]"
            )}
          >
            <FaSearch size={12} />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            spellCheck={false}
            placeholder="Search instruments..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().replace(/\s/g, "");
              onSearchChange(value);
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            className="font-outfit relative h-full flex-1 bg-transparent px-3 text-[13px] font-medium text-white placeholder-[#545963] transition-colors outline-none"
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="relative mr-3 flex h-5 w-5 items-center justify-center rounded-md border border-[#111215] bg-[#111215] text-white/40 transition-all hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
            >
              <FaTimes size={8} />
            </button>
          )}

          {/* Keyboard hint */}
          {!isFocused && !searchQuery && (
            <div className="absolute right-3 text-[10px] text-[#32353C] font-outfit">
              /
            </div>
          )}
        </div>
      </div>
    );
  }
);

// DraggableItem component to handle individual drag controls
const DraggableItem = memo(
  ({ item, onToggle }: { item: string; onToggle: () => void }) => {
    const { boxColors } = useUser();
    const { priceData } = useWebSocket();
    const dragControls = useDragControls();

    return (
      <Reorder.Item
        value={item}
        id={item}
        dragListener={false}
        dragControls={dragControls}
        className="group/drag mb-1"
        whileDrag={{ zIndex: 50 }}
        style={{ position: "relative", zIndex: 0 }}
      >
        <motion.div
          className="relative flex w-full items-center overflow-hidden"
          layout="position"
          transition={{ duration: 0.15 }}
          whileDrag={{ zIndex: 50 }}
          style={{ borderRadius: "4px" }}
        >
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#4EFF6E] z-10"
            style={{
              width: "30px",
              height: "4px",
              transform: "translateY(-50%) rotate(-90deg)",
              filter: "blur(10px)",
              transformOrigin: "center",
            }}
          />
          <div className="w-full">
            {/* Drag Handle */}
            <motion.button
              type="button"
              className="absolute top-1/2 left-0 z-[100] -translate-y-1/2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dragControls.start(e);
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center opacity-0 transition-all duration-200 group-hover/drag:opacity-60">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="pointer-events-none"
                  role="img"
                  aria-label="Drag handle"
                >
                  <title>Drag handle</title>
                  <path d="M7 3H5V5H7V3Z" fill="#666" />
                  <path d="M7 7H5V9H7V7Z" fill="#666" />
                  <path d="M7 11H5V13H7V11Z" fill="#666" />
                  <path d="M11 3H9V5H11V3Z" fill="#666" />
                  <path d="M11 7H9V9H11V7Z" fill="#666" />
                  <path d="M11 11H9V13H11V11Z" fill="#666" />
                </svg>
              </div>
            </motion.button>

            {/* Item Content */}
            <div
              className="group/item relative flex h-10 w-full items-center transition-all duration-300 select-none"
              style={{
                borderRadius: "4px",
                background:
                  "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="relative flex w-full items-center px-3">
                {/* Green indicator for selected items */}

                {/* Instrument name */}
                <span className="ml-4 font-outfit flex-1 text-sm font-bold tracking-wide text-white transition-colors">
                  {item}
                </span>

                {/* Price */}
                <div className="flex items-center">
                  <span className="font-kodemono  w-[70px] text-right text-sm tracking-wider text-white transition-colors">
                    {priceData[item]?.price ? (
                      formatPrice(priceData[item].price, item)
                    ) : (
                      <LoadingSpinner
                        key={`${item}-loading`}
                        itemId={item}
                        color={boxColors.positive}
                      />
                    )}
                  </span>

                  {/* Toggle button */}
                  <div className="z-90 ml-2 flex w-6 justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-200",
                        "opacity-0 group-hover/item:opacity-100",
                        "border-[#111215] bg-[#111215] text-white/40 hover:border-[#1C1E23] hover:bg-[#1C1E23] hover:text-white/60"
                      )}
                    >
                      <FaTimes size={8} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Reorder.Item>
    );
  }
);

DraggableItem.displayName = "DraggableItem";

// Add the filter buttons component
const FilterButton = ({
  isActive,
  onClick,
  label,
}: {
  isActive: boolean;
  onClick: () => void;
  label: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-full px-4 relative w-auto flex flex h-7 min-w-7 justify-center items-center px-2",
        "transition-all duration-300 ease-in-out overflow-hidden"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <>
          <div
            className="absolute inset-0"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          />
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#4EFF6E] z-10"
            style={{
              width: "30px",
              height: "4px",
              transform: "translateY(-50%) rotate(-90deg)",
              filter: "blur(10px)",
              transformOrigin: "center",
            }}
          />
        </>
      )}

      {/* Inactive background */}
      {!isActive && (
        <>
          <div
            className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          />
        </>
      )}

      {/* Label */}
      <span
        className={cn(
          "relative z-10 font-outfit text-[12px] font-medium tracking-wide whitespace-nowrap flex items-center justify-center",
          "transition-colors duration-300 ease-in-out",
          "text-white"
        )}
      >
        {label}
      </span>
    </button>
  );
};

export const InstrumentsPanel = () => {
  const { selectedPairs, togglePair } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("selected");
  const reorderPairs = useGridStore((state) => state.reorderPairs);
  const contentRef = useRef<HTMLDivElement>(null);

  const isSearching = !!searchQuery;

  const scrollToSection = useCallback((filter: string) => {
    setActiveFilter(filter);

    // Give time for the DOM to update
    setTimeout(() => {
      const element = document.querySelector(`[data-section="${filter}"]`);
      if (element && contentRef.current) {
        const headerHeight = 200; // Approximate height of search + filters
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition - headerHeight;

        contentRef.current.scrollTo({
          top: contentRef.current.scrollTop + offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  }, []);

  // Memoized selected pairs items
  const selectedPairsItems = useMemo(
    () =>
      selectedPairs.map((item) => (
        <DraggableItem
          key={item}
          item={item}
          onToggle={() => togglePair(item)}
        />
      )),
    [selectedPairs, togglePair]
  );

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!isSearching) return [];

    const allPairs = [
      ...FOREX_PAIRS,
      ...CRYPTO_PAIRS,
      ...EQUITY_PAIRS,
      ...ETF_PAIRS,
    ];

    return allPairs
      .filter((pair) => pair.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const aSelected = selectedPairs.includes(a);
        const bSelected = selectedPairs.includes(b);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.localeCompare(b);
      });
  }, [searchQuery, selectedPairs, isSearching]);

  // Memoized available pairs groups
  const availablePairsGroups = useMemo(() => {
    if (isSearching) return [];

    return [
      { label: "FX", items: FOREX_PAIRS },
      { label: "CRYPTO", items: CRYPTO_PAIRS },
      { label: "STOCKS", items: EQUITY_PAIRS },
      { label: "ETF", items: ETF_PAIRS },
    ]
      .map((group) => {
        const availablePairs = group.items.filter(
          (item) => !selectedPairs.includes(item)
        );
        if (availablePairs.length === 0) return null;

        const items = availablePairs.map((item) => (
          <PairItem
            key={item}
            item={item}
            isSelected={false}
            onToggle={() => togglePair(item)}
          />
        ));

        return (
          <PairGroup
            key={group.label}
            label={group.label}
            items={items}
            count={availablePairs.length}
          />
        );
      })
      .filter(Boolean);
  }, [selectedPairs, togglePair, isSearching]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="w-full flex gap-2 w-auto ">
        <div className="w-auto overflow-x-auto flex flex-wrap gap-2 py-2">
          <FilterButton
            isActive={activeFilter === "selected"}
            onClick={() => scrollToSection("selected")}
            label={<FaStar size={10} />}
          />
          <FilterButton
            isActive={activeFilter === "fx"}
            onClick={() => scrollToSection("fx")}
            label="FX"
          />
          <FilterButton
            isActive={activeFilter === "crypto"}
            onClick={() => scrollToSection("crypto")}
            label="Crypto"
          />
          <FilterButton
            isActive={activeFilter === "stocks"}
            onClick={() => scrollToSection("stocks")}
            label="Stocks"
          />
          <FilterButton
            isActive={activeFilter === "etf"}
            onClick={() => scrollToSection("etf")}
            label="ETF"
          />
        </div>
      </div>
      <div className="flex-none overflow-hidden w-full mb-2">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          isFocused={isSearchFocused}
        />
      </div>

      {/* Scrollable content section */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="space-y-4">
          {/* Search Results */}
          {isSearching && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="pl-1 flex items-center gap-2">
                  <h3 className="font-outfit text-xs font-medium text-white">
                    Search Results
                  </h3>
                </div>
                <div
                  className="px-2 py-1 text-xs font-outfit font-medium text-white rounded-full"
                  style={{
                    background:
                      "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                    boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {searchResults.length} found
                </div>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((pair) => (
                    <PairItem
                      key={pair}
                      item={pair}
                      isSelected={false}
                      onToggle={() => togglePair(pair)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 text-3xl opacity-50">🔍</div>
                  <div className="font-outfit text-sm text-[#545963] mb-2">
                    No instruments found matching
                  </div>
                  <div
                    className="font-outfit text-sm font-medium px-3 py-1 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                      color: "#4EFF6E",
                    }}
                  >
                    "{searchQuery}"
                  </div>
                  <div className="font-outfit text-xs text-[#32353C] mt-3">
                    Try searching for forex pairs, crypto, stocks, or ETFs
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regular Content */}
          {!isSearching && (
            <>
              {selectedPairs.length > 0 && (
                <div data-section="selected">
                  <PairGroup
                    label="Selected Pairs"
                    items={
                      <Reorder.Group
                        axis="y"
                        values={selectedPairs}
                        onReorder={reorderPairs}
                      >
                        {selectedPairsItems}
                      </Reorder.Group>
                    }
                    count={selectedPairs.length}
                    isSelected={true}
                  />
                </div>
              )}
              {availablePairsGroups.map((group) => (
                <div
                  key={group.props.label}
                  data-section={group.props.label.toLowerCase()}
                >
                  {group}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
