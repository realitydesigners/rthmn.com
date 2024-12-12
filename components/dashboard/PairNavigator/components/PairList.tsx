import { PairItem } from '../PairItem';
import { PairListProps } from '../types';

export const PairList = ({
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
    <div key={category} className="relative">
      <div className="sticky top-2 z-[99] bg-black/80 px-4 py-2 backdrop-blur-sm">
        <div className="font-kodemono flex items-center gap-3 text-xs font-medium tracking-wider text-gray-400">
          <span className="h-[1px] flex-1 bg-white/5" />
          {category}
          <span className="h-[1px] flex-1 bg-white/5" />
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
