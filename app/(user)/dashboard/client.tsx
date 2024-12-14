'use client';
import React from 'react';
import { useDashboard } from '@/providers/DashboardProvider';
import { BoxDetailsRow } from '@/components/BoxDetailsRow';
import { PairResoBox } from './PairResoBox';
import { NoInstruments } from './LoadingSkeleton';

export default function Dashboard() {
  const { pairData, selectedPairs, isLoading, isAuthenticated, boxColors } =
    useDashboard();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-32 animate-pulse bg-gray-200" />
      </div>
    );
  }

  const filteredPairData = selectedPairs
    .map((pair) => {
      const data = pairData[pair];
      if (!data?.boxes?.length) {
        return null;
      }
      return data.boxes.map((boxSlice, index) => ({
        pair,
        boxSlice,
        currentOHLC: data.currentOHLC,
        boxes: boxSlice.boxes,
        index
      }));
    })
    .filter(Boolean)
    .flat();

  return (
    <main className="w-full">
      <div className="flex-overflow-hidden">
        <div className="pt-13">
          {selectedPairs.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] justify-center">
              {filteredPairData.map(({ pair, boxSlice, currentOHLC }) => (
                <PairResoBox
                  key={`${pair}-${boxSlice.timestamp}`}
                  pair={pair}
                  boxSlice={boxSlice}
                  currentOHLC={currentOHLC}
                />
              ))}
            </div>
          ) : (
            <NoInstruments />
          )}
        </div>
        {/* {selectedPairs.length > 0 && (
          <div className="mx-8 mt-8 rounded-lg border border-[#181818] p-4">
            <div className="flex flex-col gap-2">
              {filteredPairData.map(({ pair, boxes, index }, pairIndex) => (
                <BoxDetailsRow
                  key={`details-${pair}-${index}`}
                  boxes={boxes}
                  maxBoxCount={boxColors.styles?.maxBoxCount ?? 10}
                  pairName={pair}
                  showSizes={pairIndex === 0 && index === 0}
                />
              ))}
            </div>
          </div>
        )} */}
      </div>
    </main>
  );
}
