'use client';
import React, { useState } from 'react';
import { SelectedPairs } from '@/components/Accessibility/SelectedPairs';
import {
  LuLayers,
  LuSettings,
  LuBell,
  LuLineChart,
  LuBeaker
} from 'react-icons/lu';
import { SettingsBar } from '@/components/Accessibility/SettingsBar';
import { useRouter } from 'next/navigation';
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

type Panel = 'pairs' | 'settings' | 'alerts' | null;

interface SidebarIconButtonProps {
  icon: IconType;
  isActive: boolean;
  onClick: () => void;
}

const SidebarIconButton = ({
  icon: Icon,
  isActive,
  onClick
}: SidebarIconButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`group flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-b p-[1px] transition-all duration-200 ${
        isActive
          ? 'from-[#444444] to-[#282828]'
          : 'from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]'
      }`}
    >
      <div
        className={`flex h-full w-full items-center justify-center rounded-md bg-gradient-to-b from-[#0A0A0A] to-[#181818] ${
          isActive ? 'text-white' : 'text-[#818181]'
        }`}
      >
        <Icon size={18} />
      </div>
    </button>
  );
};

export const DashboardSidebar = () => {
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
        return (
          <>
            {/* <SidebarHeader title="My Instruments" icon={LuLayers} /> */}
            <SelectedPairs />
          </>
        );
      case 'settings':
        return (
          <div className="relative">
            {/* <SidebarHeader title="Settings" icon={LuSettings} /> */}
            <div className="relative">
              <SettingsBar
                isOpen={isSettingsOpen}
                onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed top-0 left-0 z-[1000] mt-14 flex h-screen">
      <div className="y-10 flex h-full w-14 flex-col items-center border-r border-[#222] bg-black pt-4">
        <div className="flex flex-col gap-2">
          <SidebarIconButton
            icon={LuLayers}
            isActive={activePanel === 'pairs'}
            onClick={() => handleButtonClick('pairs')}
          />
          <SidebarIconButton
            icon={LuSettings}
            isActive={activePanel === 'settings'}
            onClick={() => handleButtonClick('settings')}
          />
          {process.env.NODE_ENV === 'development' && (
            <SidebarIconButton
              icon={LuBeaker}
              isActive={false}
              onClick={() => handleButtonClick(null, '/test')}
            />
          )}
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
