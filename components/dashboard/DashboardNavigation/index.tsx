'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconType } from 'react-icons';
import { LuLayers, LuSettings, LuBeaker } from 'react-icons/lu';
import { SelectedPairs } from '@/components/Accessibility/SelectedPairs';
import { SettingsBar } from '@/components/Accessibility/SettingsBar';
import { PairNavigator } from '@/components/dashboard/PairNavigator';

type Panel = 'pairs' | 'settings' | 'alerts' | null;

export const DashboardNavigation = () => {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const handleButtonClick = (panel: Panel, path?: string) => {
    if (path) {
      setActivePanel(null);
      router.push(path);
      return;
    }

    if (activePanel === panel) {
      setActivePanel(null);
      return;
    }
    setActivePanel(panel);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'pairs':
        return <PairNavigator />;
      case 'settings':
        return (
          <div className="relative">
            <SettingsBar
              isOpen={isSettingsOpen}
              onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Gradient backdrop */}
      <div className="fixed bottom-0 left-0 z-[1000] h-24 w-full bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Panel Content */}
      <div className="relative z-[999]">{activePanel && renderPanel()}</div>
      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 z-[1000] flex -translate-x-1/2 transform">
        <div className="flex h-full gap-2 rounded-full border border-[#222] bg-black/90 px-2 py-2 backdrop-blur-sm">
          <SidebarIconButton
            icon={LuLayers}
            isActive={activePanel === 'pairs'}
            onClick={() => handleButtonClick('pairs')}
            label="Instruments"
          />
          <SidebarIconButton
            icon={LuSettings}
            isActive={activePanel === 'settings'}
            onClick={() => handleButtonClick('settings')}
            label="Settings"
          />
          {process.env.NODE_ENV === 'development' && (
            <SidebarIconButton
              icon={LuBeaker}
              isActive={false}
              onClick={() => handleButtonClick(null, '/test')}
              label="Test Page"
            />
          )}
        </div>
      </div>
    </>
  );
};

interface SidebarIconButtonProps {
  icon: IconType;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

const SidebarIconButton = ({
  icon: Icon,
  isActive,
  onClick,
  label
}: SidebarIconButtonProps) => {
  return (
    <button onClick={onClick} className="group relative flex items-center">
      <div
        className={`group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b p-[1px] transition-all duration-200 ${
          isActive
            ? 'from-[#444444] to-[#282828]'
            : 'from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]'
        }`}
      >
        <div
          className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] ${
            isActive ? 'text-white' : 'text-[#818181]'
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
      <span className="absolute left-full ml-2 hidden rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        {label}
      </span>
    </button>
  );
};
