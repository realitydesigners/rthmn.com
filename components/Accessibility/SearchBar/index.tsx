'use client';
import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaStar, FaChevronRight } from 'react-icons/fa';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { useDashboard } from '@/providers/DashboardProvider';

interface SearchBarProps {
  selectedPairs: string[];
}

interface InstrumentGroup {
  label: string;
  items: readonly string[];
  color: string;
}

// Simplified group definition using our constants
const instrumentGroups: readonly InstrumentGroup[] = [
  { label: 'FX', items: FOREX_PAIRS, color: '#818181' },
  { label: 'CRYPTO', items: CRYPTO_PAIRS, color: '#818181' }
] as const;

export const SearchBar: React.FC<SearchBarProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [hoveredPair, setHoveredPair] = useState<string | null>(null);
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

  const handlePairToggle = (pair: string) => {
    togglePair(pair);
    setSearchQuery('');
    const filteredGroups = getFilteredGroups();
    if (filteredGroups.length === 0) {
      setShowResults(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(price >= 100 ? 2 : 3);
  };

  return (
    <div className="relative flex-1 px-32" ref={searchRef}>
      <div className="relative mx-auto max-w-70">
        <div className="flex items-center rounded-full bg-linear-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]">
          <div className="flex h-10 w-full items-center rounded-full bg-linear-to-b from-[#0A0A0A] to-[#181818]">
            <FaSearch className="ml-4 text-[#818181]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="font-outfit w-full bg-transparent px-3 py-2 text-sm text-white placeholder-[#818181] focus:outline-none"
            />
          </div>
        </div>

        {showResults && (
          <div className="absolute left-1/2 mt-2 w-[500px] -translate-x-1/2 overflow-hidden rounded-lg border border-[#222] bg-[#111]/95 shadow-lg backdrop-blur-sm">
            <div className="flex max-h-[300px] divide-x divide-[#222]">
              {getFilteredGroups().map((group) => (
                <div key={group.label} className="flex-1 px-2">
                  <div
                    className="sticky top-0 z-10 bg-[#111]/95 px-2 py-2 text-xs font-medium backdrop-blur-sm"
                    style={{ color: group.color }}
                  >
                    {group.label}
                  </div>
                  <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#333] h-[270px] overflow-y-auto">
                    {group.items.map((item) => {
                      const isSelected = selectedPairs.includes(item);
                      const currentPrice = pairData[item]?.currentOHLC?.close;

                      return (
                        <button
                          key={item}
                          onClick={() => handlePairToggle(item)}
                          onMouseEnter={() => setHoveredPair(item)}
                          onMouseLeave={() => setHoveredPair(null)}
                          className={`group flex w-full items-center justify-between rounded-md px-4 py-2 text-sm transition-all hover:bg-linear-to-b hover:from-[#333333] hover:to-[#181818] ${
                            hoveredPair === item ? 'bg-white/5' : ''
                          } ${
                            isSelected
                              ? 'text-white'
                              : 'text-white hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{item}</span>
                            {currentPrice && (
                              <span className="text-xs text-[#818181]">
                                {formatPrice(currentPrice)}
                              </span>
                            )}
                            {hoveredPair === item && !isSelected && (
                              <FaChevronRight className="text-xs text-[#818181] opacity-0 transition-opacity group-hover:opacity-100" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <FaStar
                              className={`transition-colors ${
                                isSelected
                                  ? 'text-white'
                                  : 'text-[#818181] opacity-0 group-hover:opacity-100'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
