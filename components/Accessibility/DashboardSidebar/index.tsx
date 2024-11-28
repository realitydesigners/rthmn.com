'use client';
import { useState } from 'react';
import { SelectedPairs } from '@/components/Accessibility/SelectedPairs';
import { FaChartBar, FaCog, FaLayerGroup, FaBell } from 'react-icons/fa';
import { SettingsBar } from '@/components/Accessibility/SettingsBar';

type Panel = 'pairs' | 'settings' | 'alerts' | 'patterns' | null;

export const DashboardSidebar = () => {
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true); // Always open in panel

  const togglePanel = (panel: Panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'pairs':
        return (
          <>
            <h2 className="mb-4 font-mono text-xs font-medium text-[#818181] uppercase">
              Selected Pairs
            </h2>
            <SelectedPairs />
          </>
        );
      case 'settings':
        return (
          <div className="relative">
            <h2 className="mb-4 font-mono text-xs font-medium text-[#818181] uppercase">
              Settings
            </h2>
            <div className="relative">
              <SettingsBar
                isOpen={isSettingsOpen}
                onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
              />
            </div>
          </div>
        );
      case 'alerts':
        return (
          <h2 className="mb-4 font-mono text-xs font-medium text-[#818181] uppercase">
            Alerts Panel
          </h2>
        );
      case 'patterns':
        return (
          <h2 className="mb-4 font-mono text-xs font-medium text-[#818181] uppercase">
            Patterns Panel
          </h2>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-0 left-0 z-10 mt-14 flex h-screen">
      {/* Main Sidebar with Icons */}
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
            <FaLayerGroup size={18} />
          </button>
          <button
            onClick={() => togglePanel('patterns')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-[#181818] ${
              activePanel === 'patterns'
                ? 'bg-[#181818] text-white'
                : 'text-[#818181]'
            }`}
          >
            <FaChartBar size={18} />
          </button>
          <button
            onClick={() => togglePanel('alerts')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-[#181818] ${
              activePanel === 'alerts'
                ? 'bg-[#181818] text-white'
                : 'text-[#818181]'
            }`}
          >
            <FaBell size={18} />
          </button>
          <button
            onClick={() => togglePanel('settings')}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-all hover:bg-[#181818] ${
              activePanel === 'settings'
                ? 'bg-[#181818] text-white'
                : 'text-[#818181]'
            }`}
          >
            <FaCog size={18} />
          </button>
        </div>
      </div>

      {/* Panel Content */}
      {activePanel && (
        <div className="h-full w-60 border-r border-[#222] bg-[#0A0A0A]/95 backdrop-blur-sm">
          <div className="relative p-4">{renderPanel()}</div>
        </div>
      )}
    </div>
  );
};
