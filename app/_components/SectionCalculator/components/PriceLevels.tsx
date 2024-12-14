import { memo } from 'react';
import { Direction } from './TradeDirection';

interface PriceLevelsProps {
  direction: Direction;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
}

export const PriceLevels = memo(
  ({ direction, entryPrice, stopLoss, takeProfit }: PriceLevelsProps) => {
    const height = 200;
    const maxPrice = Math.max(entryPrice, stopLoss, takeProfit);
    const minPrice = Math.min(entryPrice, stopLoss, takeProfit);
    const range = maxPrice - minPrice;

    const getYPosition = (price: number) => {
      return ((maxPrice - price) / range) * height;
    };

    return (
      <div className="relative h-[200px] w-[60px]">
        <div className="absolute inset-0 flex flex-col justify-between">
          {/* Price levels */}
          <div
            className="absolute w-full"
            style={{ top: `${getYPosition(takeProfit)}px` }}
          >
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-full bg-emerald-400" />
              <span className="text-xs text-emerald-400">
                ${takeProfit.toFixed(2)}
              </span>
            </div>
          </div>

          <div
            className="absolute w-full"
            style={{ top: `${getYPosition(entryPrice)}px` }}
          >
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-full bg-white" />
              <span className="text-xs text-white">
                ${entryPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div
            className="absolute w-full"
            style={{ top: `${getYPosition(stopLoss)}px` }}
          >
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-full bg-red-400" />
              <span className="text-xs text-red-400">
                ${stopLoss.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Direction arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `${getYPosition(entryPrice)}px` }}
          >
            <div
              className={`h-20 w-1 ${
                direction === 'long' ? 'bg-emerald-400/20' : 'bg-red-400/20'
              }`}
            />
          </div>
        </div>
      </div>
    );
  }
);
