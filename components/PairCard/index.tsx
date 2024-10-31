import React from 'react';
import ShiftedBox from '@/components/Reso/Shifted';
import { BoxSlice, OHLC } from '@/types';

type PairCardProps = {
  pair: string;
  boxSlice: BoxSlice;
  currentOHLC: OHLC;
};

const PairCard: React.FC<PairCardProps> = ({ pair, boxSlice, currentOHLC }) => {
  const closePrice = currentOHLC?.close || 'N/A';

  return (
    <div className="m-auto flex flex-col items-center justify-center gap-5 rounded-lg border border-[#222] bg-gradient-to-b from-[#121314] to-[#0B0C0D] p-4 text-center text-white shadow-md">
      {/* Top Container */}
      <div className="mb-2 flex w-full justify-between text-sm">
        <div className="text-lg font-bold">{pair.toUpperCase()}</div>
        <div>{closePrice}</div>
      </div>

      {/* Middle Container */}
      <div className="mb-2">
        <ShiftedBox slice={boxSlice} isLoading={false} />
      </div>
    </div>
  );
};

export default PairCard;
