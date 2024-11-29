'use client';
import { FaTimes } from 'react-icons/fa';
import { useDashboard } from '@/providers/DashboardProvider';

export const SelectedPairs = () => {
  const { selectedPairs, togglePair, pairData } = useDashboard();

  const formatPrice = (price: number) => {
    return price.toFixed(price >= 100 ? 2 : 3);
  };

  if (selectedPairs.length === 0) {
    return (
      <div className="text-center text-sm text-[#818181]">
        No pairs selected
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {selectedPairs.map((pair) => {
        const currentPrice = pairData[pair]?.currentOHLC?.close;

        return (
          <div
            key={pair}
            className="group flex items-center gap-2 rounded-md bg-linear-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
          >
            <div className="flex w-full items-center justify-between rounded-md bg-linear-to-b from-[#0A0A0A] to-[#181818] px-4 py-2">
              <div className="flex flex-col">
                <span className="font-mono text-sm font-medium text-white">
                  {pair}
                </span>
                {currentPrice && (
                  <span className="font-mono text-xs text-[#818181]">
                    {formatPrice(currentPrice)}
                  </span>
                )}
              </div>
              <button
                onClick={() => togglePair(pair)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-xs text-[#818181] opacity-0 transition-all group-hover:opacity-100"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
