'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ResoBox } from '@/components/ResoBox';
import { SettingsBar } from '@/components/SettingsBar';
import { SelectedPairs } from '@/components/SelectedPairs';
import { useDashboard } from '@/providers/DashboardProvider';
import { BoxSlice, OHLC, PairData } from '@/types/types';
import { BoxDetailsRow } from '@/components/BoxDetailsRow';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { pairData, selectedPairs, isLoading, isAuthenticated, boxColors } =
    useDashboard();

  if (!isAuthenticated) {
    return <div>Loading session...</div>;
  }

  if (isLoading) return <p>Loading...</p>;

  const filteredPairBoxes = selectedPairs
    .map((pair) => {
      const data = pairData[pair];
      if (!data?.boxes?.length) {
        return null;
      }
      return data.boxes.map((boxSlice, index) => ({
        pair,
        boxSlice,
        currentOHLC: data.currentOHLC
      }));
    })
    .filter(Boolean)
    .flat();

  const boxDetails = selectedPairs
    .map((pair) => {
      const data = pairData[pair];
      if (!data?.boxes?.length) return null;
      return data.boxes.map((boxSlice, index) => ({
        pair,
        boxes: boxSlice.boxes,
        index
      }));
    })
    .filter(Boolean)
    .flat();

  return (
    <main className="w-full">
      <div className="flex-overflow-hidden">
        {/* Trading Pairs Grid */}
        <div className="pt-13">
          {selectedPairs.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] justify-center">
              {filteredPairBoxes.map(({ pair, boxSlice, currentOHLC }) => (
                <PairResoBox
                  key={`${pair}-${boxSlice.timestamp}`}
                  pair={pair}
                  boxSlice={boxSlice}
                  currentOHLC={currentOHLC}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
              <p className="text-lg text-gray-400">No instruments selected</p>
              <p className="mt-2 text-sm text-gray-600">
                Use the search bar above to add trading pairs
              </p>
            </div>
          )}
        </div>
        {/* 
        {selectedPairs.length > 0 && (
          <div className="mx-8 mt-8 rounded-lg border border-[#181818] p-4">
            <h2 className="mb-4 text-sm font-bold text-white">
              Pattern Details
            </h2>
            <div className="flex flex-col gap-2">
              {boxDetails.map(({ pair, boxes, index }, pairIndex) => (
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
    <div className="group m-auto flex w-full flex-col items-center justify-center gap-4 p-12 text-center text-white shadow-md transition-all duration-500 ease-in-out lg:p-16">
      <div className="w-full transition-transform duration-300 ease-in-out">
        <ResoBox
          key={`${pair}-${boxSlice.timestamp}`}
          slice={boxSlice}
          isLoading={false}
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
