'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import PairUniverse from './PairUniverse';
import { useDashboard } from '@/providers/DashboardProvider';
import App from '@/app/(user)/test/SplineScene';

export default function TestPage() {
  const { selectedPairs, pairData } = useDashboard();

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* <App /> */}
      <PairUniverse selectedPairs={selectedPairs} pairData={pairData} />
    </main>
  );
}
