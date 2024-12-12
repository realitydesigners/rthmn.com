'use client';
import { useState, useRef, useEffect } from 'react';
import { LuSearch, LuX, LuChevronDown } from 'react-icons/lu';
import { FaTimes } from 'react-icons/fa';
import { useDashboard } from '@/providers/DashboardProvider';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';

interface InstrumentGroup {
  label: string;
  items: readonly string[];
}

const instrumentGroups: readonly InstrumentGroup[] = [
  { label: 'FX', items: FOREX_PAIRS },
  { label: 'CRYPTO', items: CRYPTO_PAIRS }
] as const;

const GroupHeader = ({ label }: { label: string }) => (
  <div className="font-kodemono flex h-8 items-center justify-between border-b border-[#222] px-4 text-xs font-medium tracking-wider text-[#818181]">
    <div className="flex items-center gap-2">
      <span className="uppercase">{label}</span>
      <LuChevronDown size={8} className="opacity-50" />
    </div>
  </div>
);

export const MobileSearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { selectedPairs, togglePair, pairData } = useDashboard();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredGroups = () => {
    if (!searchQuery) return instrumentGroups;

    return instrumentGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter((group) => group.items.length > 0);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(price >= 100 ? 2 : 5);
  };

  const renderPairRow = (item: string) => {
    const isSelected = selectedPairs.includes(item);
    const currentPrice = pairData[item]?.currentOHLC?.close;

    return (
      <div
        key={item}
        className="group flex h-9 cursor-default items-center justify-between border-l-2 border-transparent px-2 transition-all select-none hover:border-[#333] hover:bg-[#111]"
      >
        <div className="flex w-[140px] items-center">
          <span className="font-outfit text-[13px] font-bold tracking-wider text-white">
            {item}
          </span>
        </div>
        <div className="flex items-center">
          <span className="font-kodemono text-[13px] font-medium tracking-wider text-[#666] transition-all group-hover:mr-3">
            {currentPrice ? formatPrice(currentPrice) : 'N/A'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePair(item);
            }}
            className={`flex h-5 w-5 items-center justify-center rounded border opacity-0 transition-all group-hover:opacity-100 ${
              isSelected
                ? 'border-red-400 bg-red-400/80 hover:text-white'
                : 'border-emerald-400 bg-emerald-400/80 hover:text-white'
            }`}
          >
            {isSelected ? (
              <FaTimes size={10} className="text-black" />
            ) : (
              <span className="text-[12px] font-bold text-black">+</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-[1001] bg-black">
        <div className="relative flex h-full flex-col" ref={searchRef}>
          {/* Search input */}
          <div className="fixed top-0 right-0 left-0 z-[1002] border-b border-[#222] bg-black/95 p-4 backdrop-blur-sm">
            <div className="relative flex items-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]">
              <div className="flex h-9 w-full items-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
                <LuSearch className="ml-4 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search instruments..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="font-outfit w-full bg-transparent px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-[1003] rounded-full bg-white/5 p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <LuX size={20} />
          </button>

          {/* Search results */}
          <div className="flex-1 overflow-y-auto pt-20 pb-32">
            {/* Selected Pairs Section */}
            {selectedPairs.length > 0 && (
              <div className="border-b border-[#222]">
                <GroupHeader label="My Symbols" />
                <div className="max-h-[180px] overflow-y-auto p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {selectedPairs.map((item) => (
                      <div
                        key={item}
                        className="group flex h-9 cursor-default items-center justify-between rounded border border-transparent bg-[#111] px-2 transition-all select-none hover:border-[#333]"
                      >
                        <div className="flex items-center overflow-hidden">
                          <span className="font-outfit truncate text-[13px] font-bold tracking-wider text-white">
                            {item}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center">
                          <span className="font-kodemono text-[13px] font-medium tracking-wider text-[#666] transition-all group-hover:mr-3">
                            {pairData[item]?.currentOHLC?.close
                              ? formatPrice(pairData[item]?.currentOHLC?.close)
                              : 'N/A'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePair(item);
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded border border-red-400 bg-red-400/80 opacity-0 transition-all group-hover:opacity-100 hover:text-white"
                          >
                            <FaTimes size={10} className="text-black" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Available Pairs Section */}
            <div className="flex flex-col divide-y divide-[#222] pb-20">
              {getFilteredGroups().map((group) => {
                const availablePairs = group.items.filter(
                  (item) => !selectedPairs.includes(item)
                );

                if (availablePairs.length === 0) return null;

                return (
                  <div key={group.label}>
                    <GroupHeader label={group.label} />
                    <div className="overflow-y-auto px-2">
                      {availablePairs.map(renderPairRow)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="group relative flex items-center"
    >
      <div className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#444444] to-[#282828] p-[1px] transition-all duration-200">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] text-[#818181] transition-all group-hover:text-white">
          <LuSearch size={18} />
        </div>
      </div>
      <span className="absolute left-full ml-2 hidden rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        Search
      </span>
    </button>
  );
};
