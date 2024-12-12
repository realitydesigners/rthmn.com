import { useLongPress } from '@/hooks/useLongPress';
import Link from 'next/link';
import { LuExternalLink, LuPlus, LuBookmark } from 'react-icons/lu';
import { useState } from 'react';
import { PairItemProps } from './types';

export const PairItem = ({
  pair,
  index,
  isActive,
  isFavorite,
  currentPrice,
  showRemove,
  onIndexChange,
  onRemove,
  onCancelRemove,
  setShowRemoveForPair,
  toggleFavorite,
  viewMode
}: PairItemProps) => {
  const { isPressed, handlers } = useLongPress(() => {
    if (isFavorite) {
      setShowRemoveForPair(pair);
    } else if (viewMode !== 'favorites') {
      setShowAddForPair(true);
    }
  });

  const [showAddForPair, setShowAddForPair] = useState<boolean>(false);

  return (
    <div
      data-index={index}
      className={`pair-item relative shrink-0 cursor-pointer px-2 py-4 transition-all duration-300 ${
        isActive ? 'bg-white/5' : ''
      } ${isPressed ? 'scale-[0.98]' : ''}`}
      style={{ scrollSnapAlign: 'center' }}
      onClick={() => !showRemove && !showAddForPair && onIndexChange(index)}
      {...handlers}
    >
      <div className="relative z-10 flex flex-col">
        <div className="group flex w-full items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h3
              className={`font-outfit text-2xl font-bold tracking-tight transition-all duration-300 ${
                isActive ? 'scale-110 text-white' : 'scale-90 text-gray-500/40'
              } ${showRemove ? 'text-red-400' : ''} ${
                showAddForPair ? 'text-green-400' : ''
              }`}
            >
              {isFavorite && viewMode !== 'favorites' && (
                <LuBookmark
                  size={12}
                  className="mr-2 ml-2 inline-block text-blue-400/70"
                  style={{ transform: 'translateY(-2px)' }}
                />
              )}
              {pair.replace('_', '/')}
            </h3>

            {isActive && currentPrice && !showRemove && !showAddForPair && (
              <div className="font-kodemono text-sm text-gray-400">
                {currentPrice.toFixed(pair.includes('JPY') ? 3 : 5)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isActive && !showRemove && !showAddForPair && (
              <Link
                href={`/chart/${pair}`}
                onClick={(e) => e.stopPropagation()}
                className="group relative flex items-center"
              >
                <div className="group flex h-8 w-full items-center justify-center rounded-full bg-gradient-to-b from-[#444444] to-[#282828] pt-[1.5px] transition-all duration-200">
                  <div className="font-outfit flex h-full w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-3.5 py-1.5 text-xs font-bold text-gray-200 transition-all hover:text-white">
                    View
                    <LuExternalLink size={12} className="opacity-50" />
                  </div>
                </div>
              </Link>
            )}

            {showAddForPair && (
              <div className="animate-in fade-in slide-in-from-right flex items-center gap-2 duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddForPair(false);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite?.();
                    setShowAddForPair(false);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3.5 py-1.5 text-xs font-medium text-green-400 transition-all hover:bg-green-500/20"
                >
                  <LuPlus size={12} className="opacity-50" />
                  Add
                </button>
              </div>
            )}

            {showRemove && (
              <div className="animate-in fade-in slide-in-from-right flex items-center gap-2 duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelRemove();
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3.5 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add subtle indicator line */}
        {isActive && !showRemove && !showAddForPair && (
          <div className="absolute top-1/2 -left-4 h-[2px] w-3 -translate-y-1/2 bg-gradient-to-r from-white/20 to-transparent" />
        )}

        {/* Add remove mode indicator */}
        {showRemove && (
          <div className="absolute top-1/2 -left-4 h-[2px] w-3 -translate-y-1/2 animate-pulse bg-gradient-to-r from-red-400/20 to-transparent" />
        )}

        {/* Add favorite mode indicator */}
        {showAddForPair && (
          <div className="absolute top-1/2 -left-4 h-[2px] w-3 -translate-y-1/2 animate-pulse bg-gradient-to-r from-green-400/20 to-transparent" />
        )}
      </div>
    </div>
  );
};
