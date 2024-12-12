'use client';
import { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/providers/DashboardProvider';
import { useSwipeable } from 'react-swipeable';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { LuDollarSign, LuBitcoin, LuList, LuBookmark } from 'react-icons/lu';
import { NavigationButton } from './NavigationButton';
import { PairItem } from './PairItem';
import { ViewMode, GroupedPairs, PairListProps } from './types';

const navigationButtons = [
  { mode: 'favorites' as ViewMode, label: 'Favorites', icon: LuBookmark },
  { mode: 'fx' as ViewMode, label: 'FX', icon: LuDollarSign },
  { mode: 'crypto' as ViewMode, label: 'Crypto', icon: LuBitcoin },
  { mode: 'all' as ViewMode, label: 'All', icon: LuList }
];

const useKeyboardNavigation = (
  activeIndex: number,
  currentPairs: string[],
  handleIndexChange: (index: number) => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        const prevIndex = Math.max(activeIndex - 1, 0);
        handleIndexChange(prevIndex);
      } else if (e.key === 'ArrowDown') {
        const nextIndex = Math.min(activeIndex + 1, currentPairs.length - 1);
        handleIndexChange(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, currentPairs.length, handleIndexChange]);
};

const useIntersectionObserver = (
  scrollRef: React.RefObject<HTMLDivElement>,
  currentPairs: string[],
  setActiveIndex: (index: number) => void
) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
            const index = parseInt(
              entry.target.getAttribute('data-index') || '0'
            );
            setActiveIndex(index);
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.7,
        rootMargin: '-35% 0px -35% 0px'
      }
    );

    const pairElements = document.querySelectorAll('.pair-item');
    pairElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [currentPairs, scrollRef, setActiveIndex]);
};

const EmptyFavorites = ({
  viewMode,
  setViewMode
}: {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}) => (
  <div className="fixed bottom-24 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 border-t border-[#222] bg-black backdrop-blur-sm">
    <div className="flex h-full flex-col px-3">
      <div className="flex flex-1 flex-col items-center justify-center text-sm text-[#818181]">
        <span>No instruments added to watchlist</span>
        <span className="mt-1 text-xs">Use the search bar to add pairs</span>
      </div>

      <NavigationButtons viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  </div>
);

const NavigationButtons = ({
  viewMode,
  setViewMode
}: {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}) => (
  <div className="absolute right-0 bottom-32 left-0 z-10 flex items-center justify-center gap-2 py-2">
    {navigationButtons.map((button) => (
      <NavigationButton
        key={button.mode}
        icon={button.icon}
        isActive={viewMode === button.mode}
        onClick={() => setViewMode(button.mode)}
        label={button.label}
      />
    ))}
  </div>
);

export const PairNavigator = () => {
  const { selectedPairs, togglePair, pairData } = useDashboard();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('favorites');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRemoveForPair, setShowRemoveForPair] = useState<string | null>(
    null
  );

  const groupedPairs: GroupedPairs = {
    FX: FOREX_PAIRS,
    CRYPTO: CRYPTO_PAIRS
  };

  const currentPairs =
    viewMode === 'favorites'
      ? selectedPairs
      : viewMode === 'fx'
        ? [...FOREX_PAIRS]
        : viewMode === 'crypto'
          ? [...CRYPTO_PAIRS]
          : ([...FOREX_PAIRS, ...CRYPTO_PAIRS] as string[]);

  const handleIndexChange = (index: number) => {
    setActiveIndex(index);
    const element = document.querySelector(`[data-index="${index}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlers = useSwipeable({
    onSwipedUp: () => {
      const nextIndex = Math.min(activeIndex + 1, currentPairs.length - 1);
      handleIndexChange(nextIndex);
    },
    onSwipedDown: () => {
      const prevIndex = Math.max(activeIndex - 1, 0);
      handleIndexChange(prevIndex);
    },
    trackMouse: true,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    delta: 50
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [viewMode]);

  useKeyboardNavigation(activeIndex, currentPairs, handleIndexChange);
  useIntersectionObserver(scrollRef, currentPairs, setActiveIndex);

  if (viewMode === 'favorites' && selectedPairs.length === 0) {
    return <EmptyFavorites viewMode={viewMode} setViewMode={setViewMode} />;
  }

  return (
    <div className="fixed bottom-0 left-1/2 z-0 h-[60vh] w-screen -translate-x-1/2 border-t border-[#222] bg-black pb-24">
      <div className="flex h-full flex-col">
        <div className="absolute top-0 right-0 left-0 z-90 h-20 bg-gradient-to-b from-black via-black/60 to-transparent" />

        <div
          ref={scrollRef}
          className="w-full flex-1 overflow-hidden px-3"
          {...handlers}
        >
          <div
            className="scrollbar-none flex h-full touch-pan-y flex-col overflow-y-scroll scroll-smooth"
            style={{
              scrollSnapType: 'y mandatory'
            }}
          >
            <div className="py-[30vh]">
              <PairList
                viewMode={viewMode}
                currentPairs={currentPairs}
                groupedPairs={groupedPairs}
                activeIndex={activeIndex}
                pairData={pairData}
                selectedPairs={selectedPairs}
                showRemoveForPair={showRemoveForPair}
                handleIndexChange={handleIndexChange}
                togglePair={togglePair}
                setShowRemoveForPair={setShowRemoveForPair}
              />
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-24 left-0 z-10 h-30 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <NavigationButtons viewMode={viewMode} setViewMode={setViewMode} />
      </div>
    </div>
  );
};

const PairList = ({
  viewMode,
  currentPairs,
  groupedPairs,
  activeIndex,
  pairData,
  selectedPairs,
  showRemoveForPair,
  handleIndexChange,
  togglePair,
  setShowRemoveForPair
}: PairListProps) => {
  if (viewMode === 'favorites') {
    return currentPairs.map((pair, index) => (
      <PairItem
        key={pair}
        pair={pair}
        index={index}
        isActive={activeIndex === index}
        isFavorite={selectedPairs.includes(pair)}
        currentPrice={pairData[pair]?.currentOHLC?.close}
        showRemove={showRemoveForPair === pair}
        onIndexChange={handleIndexChange}
        onRemove={() => {
          togglePair(pair);
          setShowRemoveForPair(null);
        }}
        onCancelRemove={() => setShowRemoveForPair(null)}
        setShowRemoveForPair={setShowRemoveForPair}
        toggleFavorite={() => togglePair(pair)}
        viewMode={viewMode}
      />
    ));
  }

  return Object.entries(groupedPairs).map(([category, pairs]) => (
    <div key={category}>
      <div className="sticky top-4 z-100 px-4 py-2">
        <div className="font-kodemono flex items-center gap-2 text-xs font-medium tracking-wider text-gray-500">
          <span className="h-[1px] flex-1 bg-gray-500/20" />
          {category}
          <span className="h-[1px] flex-1 bg-gray-500/20" />
        </div>
      </div>
      {pairs.map((pair, index) => (
        <PairItem
          key={pair}
          pair={pair}
          index={index}
          isActive={activeIndex === index}
          isFavorite={selectedPairs.includes(pair)}
          currentPrice={pairData[pair]?.currentOHLC?.close}
          showRemove={showRemoveForPair === pair}
          onIndexChange={handleIndexChange}
          onRemove={() => {
            togglePair(pair);
            setShowRemoveForPair(null);
          }}
          onCancelRemove={() => setShowRemoveForPair(null)}
          setShowRemoveForPair={setShowRemoveForPair}
          toggleFavorite={() => togglePair(pair)}
          viewMode={viewMode}
        />
      ))}
    </div>
  ));
};
