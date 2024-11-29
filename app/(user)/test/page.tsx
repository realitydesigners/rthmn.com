'use client';
import React from 'react';
import PairUniverse from './PairUniverse';
import { useDashboard } from '@/providers/DashboardProvider';

export default function TestPage() {
  const { selectedPairs } = useDashboard();

  return (
    <main className="h-screen w-screen overflow-hidden">
      <PairUniverse selectedPairs={selectedPairs} />
    </main>
  );
}
