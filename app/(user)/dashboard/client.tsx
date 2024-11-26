'use client';
import React, { useState } from 'react';
import { ResoBox } from '@/components/Charts/ResoBox';
import { SettingsBar } from '@/components/Accessibility/SettingsBar';
import { useDashboard } from '@/providers/DashboardProvider';
import { BoxSlice, OHLC } from '@/types/types';
import { BoxDetailsRow } from '@/components/Charts/BoxDetailsRow';

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { pairData, selectedPairs, isLoading, isAuthenticated, boxColors } =
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
              <PairResoBox
                key={`${pair}-${index}`}
                pair={pair}
                boxSlice={boxSlice}
                currentOHLC={data.currentOHLC}
              />
            ));
          })}
        </div>

        {/* Box Details Section */}
        <div className="mt-8 rounded-lg border border-[#181818] p-4">
          <h2 className="mb-4 text-sm font-bold text-white">Pattern Details</h2>
          <div className="flex flex-col gap-2">
            {selectedPairs.map((pair, pairIndex) => {
              const data = pairData[pair];
              if (!data?.boxes?.length) return null;
              return data.boxes.map((boxSlice, index) => (
                <BoxDetailsRow
                  key={`details-${pair}-${index}`}
                  boxes={boxSlice.boxes}
                  maxBoxCount={boxColors.styles?.maxBoxCount ?? 10}
                  pairName={pair}
                  showSizes={pairIndex === 0 && index === 0}
                />
              ));
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

const PairResoBox = ({
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
    <div className="m-auto flex flex-col items-center justify-center gap-5 rounded-lg border border-[#222] bg-linear-to-b from-[#121314] to-[#0B0C0D] p-4 text-center text-white shadow-md">
      <div className="mb-2 flex w-full items-center justify-between">
        <div className="font-outfit text-lg font-bold tracking-wider">
          {pair.toUpperCase()}
        </div>
        <div className="font-outfit text-sm font-medium text-[#44FBC7]">
          {closePrice}
        </div>
      </div>
      <div className="mb-2 w-full">
        <ResoBox slice={boxSlice} isLoading={false} />
      </div>
    </div>
  );
};
