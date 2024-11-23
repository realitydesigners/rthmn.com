'use client';
import React from 'react';
import PairGrid from '@/components/PairGrid';
import SettingsBar from '@/components/Accessibility/SettingsBar';
import { useState } from 'react';
import { useDashboard } from '@/providers/DashboardProvider';

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isAuthenticated } = useDashboard();

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  if (!isAuthenticated) {
    return <div>Loading session...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col bg-black">
      <SettingsBar isOpen={isSettingsOpen} onToggle={toggleSettings} />
      <div className="flex-1 overflow-hidden p-8 pt-24">
        <PairGrid />
      </div>
    </main>
  );
}
