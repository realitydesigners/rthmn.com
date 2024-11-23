'use client';
import React, { useState } from 'react';
import ShiftedBox from '@/components/Charts/Reso/Shifted';
import SettingsBar from '@/components/Accessibility/SettingsBar';
import { useDashboard } from '@/providers/DashboardProvider';
import { BoxSlice, OHLC } from '@/types/types';

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { pairData, selectedPairs, isLoading, isAuthenticated } =
    useDashboard();

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  if (!isAuthenticated) {
    return <div>Loading session...</div>;
  }

  if (isLoading) return <p>Loading...</p>;

  return (
    <main className="flex min-h-screen flex-col bg-black">
      <SettingsBar isOpen={isSettingsOpen} onToggle={toggleSettings} />
      <div className="flex-1 overflow-hidden p-8 pt-24">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] justify-center gap-4">
          {selectedPairs.map((pair) => {
            const data = pairData[pair];
            if (!data?.boxes?.length) return null;
            return data.boxes.map((boxSlice, index) => (
              <PairCard
                key={`${pair}-${index}`}
                pair={pair}
                boxSlice={boxSlice}
                currentOHLC={data.currentOHLC}
              />
            ));
          })}
        </div>
      </div>
    </main>
  );
}

const PairCard = ({
  pair,
  boxSlice,
  currentOHLC
}: {
  pair: string;
  boxSlice: BoxSlice;
  currentOHLC: OHLC;
}) => {
  const closePrice = currentOHLC?.close || 'N/A';

  return (
    <div className="m-auto flex flex-col items-center justify-center gap-5 rounded-lg border border-[#222] bg-gradient-to-b from-[#121314] to-[#0B0C0D] p-4 text-center text-white shadow-md">
      <div className="mb-2 flex w-full items-center justify-between">
        <div className="font-outfit text-lg font-bold tracking-wider">
          {pair.toUpperCase()}
        </div>
        <div className="font-outfit text-sm font-medium text-[#44FBC7]">
          {closePrice}
        </div>
      </div>
      <div className="mb-2 w-full">
        <ShiftedBox slice={boxSlice} isLoading={false} />
      </div>
    </div>
  );
};
