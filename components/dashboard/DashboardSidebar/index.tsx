'use client';
import React, { useState } from 'react';
import { SelectedPairs } from '@/components/Accessibility/SelectedPairs';
import { LuLayers, LuSettings, LuBell, LuLineChart } from 'react-icons/lu';
import { SettingsBar } from '@/components/Accessibility/SettingsBar';

import { IconType } from 'react-icons';

interface SidebarHeaderProps {
  title: string;
  icon: IconType;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title,
  icon: Icon
}) => {
  return (
    <div className="mb-4 flex items-center gap-2 p-2">
      <Icon size={14} className="text-[#818181]" />
      <h2 className="font-outfit text-xs font-medium text-[#818181] uppercase">
        {title}
      </h2>
    </div>
  );
};

type Panel = 'pairs' | 'settings' | 'alerts' | 'patterns' | null;

export const DashboardSidebar = () => {
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const togglePanel = (panel: Panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'pairs':
        return (
          <>
            <SidebarHeader title="Selected Pairs" icon={LuLayers} />
            <SelectedPairs />
          </>
        );
      case 'settings':
        return (
          <div className="relative">
            <SidebarHeader title="Settings" icon={LuSettings} />
            <div className="relative">
              <SettingsBar
                isOpen={isSettingsOpen}
                onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
              />
            </div>
          </div>
        );
      case 'alerts':
        return <SidebarHeader title="Alerts Panel" icon={LuBell} />;
      case 'patterns':
        return <SidebarHeader title="Patterns Panel" icon={LuLineChart} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-0 left-0 z-90 mt-14 flex h-screen">
      <div className="y-10 flex h-full w-14 flex-col items-center border-r border-[#222] bg-black pt-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => togglePanel('pairs')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-[#181818] ${
              activePanel === 'pairs'
                ? 'bg-[#181818] text-white'
                : 'text-[#818181]'
            }`}
          >
            <LuLayers size={18} />
          </button>
          <button
            onClick={() => togglePanel('patterns')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-[#181818] ${
              activePanel === 'patterns'
                ? 'bg-[#181818] text-white'
                : 'text-[#818181]'
            }`}
          >
            <LuLineChart size={18} />
          </button>
          <button
            onClick={() => togglePanel('alerts')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-[#181818] ${
              activePanel === 'alerts'
                ? 'bg-[#181818] text-white'
                : 'text-[#818181]'
            }`}
          >
            <LuBell size={18} />
          </button>
          <button
            onClick={() => togglePanel('settings')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-[#181818] ${
              activePanel === 'settings'
                ? 'bg-[#181818] text-white'
                : 'text-[#818181]'
            }`}
          >
            <LuSettings size={18} />
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {activePanel && (
        <div className="h-full w-60 border-r border-[#222] bg-black backdrop-blur-sm">
          <div className="relative p-2">{renderPanel()}</div>
        </div>
      )}
    </div>
  );
};
