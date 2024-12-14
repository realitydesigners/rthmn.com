'use client';

import { BoxSlice, OHLC } from '@/types/types';
import { ResoBox } from '@/components/ResoBox';

interface PairResoBoxProps {
  pair: string;
  boxSlice: BoxSlice;
  currentOHLC: OHLC;
}

export const PairResoBox = ({
  pair,
  boxSlice,
  currentOHLC
}: PairResoBoxProps) => {
  const closePrice = currentOHLC?.close || 'N/A';

  return (
    <div className="group m-auto flex w-full flex-col items-center justify-center gap-4 p-12 text-center text-white shadow-md transition-all duration-500 ease-in-out lg:p-16">
      <div className="w-full transition-transform duration-300 ease-in-out">
        <ResoBox
          key={`${pair}-${boxSlice.timestamp}`}
          slice={boxSlice}
          className="h-full w-full"
        />
      </div>
      <div className="flex w-full items-center gap-4">
        <div className="font-outfit text-lg font-bold tracking-wider">
          {pair.toUpperCase()}
        </div>
        <div className="font-kodemono text-sm font-medium text-gray-200">
          {closePrice}
        </div>
      </div>
    </div>
  );
};
