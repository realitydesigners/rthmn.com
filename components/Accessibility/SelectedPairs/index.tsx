'use client';
import { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import { useDashboard } from '@/providers/DashboardProvider';

export const SelectedPairs = () => {
  const { selectedPairs, togglePair, pairData } = useDashboard();
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveRow(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(price >= 100 ? 2 : 5);
  };

  const handleContextMenu = (e: React.MouseEvent, pair: string) => {
    e.preventDefault();
    setActiveRow(activeRow === pair ? null : pair);
  };

  if (selectedPairs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-sm text-[#818181]">
        <span>No instruments added to watchlist</span>
        <span className="mt-1 text-xs">Use the search bar to add pairs</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      {/* Header */}
      <div className="font-kodemono flex h-8 items-center justify-between border-b border-[#222] px-4 text-xs font-medium tracking-wider text-[#818181]">
        <div className="flex w-[140px] items-center gap-2">
          <span className="uppercase">Symbol</span>
          <FaChevronDown size={8} className="opacity-50" />
        </div>
        <div className="w-[100px] text-right uppercase">Price</div>
      </div>

      {/* Pairs List */}
      <div className="custom-scrollbar flex flex-col overflow-y-auto">
        {selectedPairs.map((pair) => {
          const currentPrice = pairData[pair]?.currentOHLC?.close;
          const isActive = activeRow === pair;

          return (
            <div
              key={pair}
              onContextMenu={(e) => handleContextMenu(e, pair)}
              className="group flex h-9 cursor-default items-center justify-between border-l-2 border-transparent px-2 transition-all select-none hover:border-[#333] hover:bg-[#111]"
            >
              {isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click from bubbling
                    togglePair(pair);
                    setActiveRow(null);
                  }}
                  className="mr-2 flex min-h-4 min-w-4 items-center justify-center rounded border border-red-400 bg-red-400/80 text-[10px] text-black transition-colors hover:text-white"
                >
                  <FaTimes />
                </button>
              )}
              <div className="flex w-[140px] items-center">
                <span className="font-outfit text-[13px] font-bold tracking-wider text-white">
                  {pair}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-kodemono text-[13px] font-medium tracking-wider text-[#666]">
                  {currentPrice ? formatPrice(currentPrice) : '0'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
