'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconType } from 'react-icons';
import { LuSettings, LuBeaker, LuSearch } from 'react-icons/lu';
import { SelectedPairs } from '@/components/Accessibility/SelectedPairs';
import { SettingsBar } from '@/components/Accessibility/SettingsBar';
import { PairNavigator } from '@/components/dashboard/PairNavigator';
import { useScrollDirection } from '../../../hooks/useScrollDirection';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useDashboard } from '@/providers/DashboardProvider';

type Panel = 'pairs' | 'settings' | 'alerts' | null;

export const DashboardNavigation = () => {
  const router = useRouter();
  const { selectedPairs } = useDashboard();
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const scrollDirection = useScrollDirection();

  useScrollLock(activePanel === 'pairs');

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
          <div className="relative">
            <PairNavigator />
          </div>
        );
      case 'settings':
        return (
          <div className="fixed inset-0 z-[85]">
            <div className="relative">
              <SettingsBar
                isOpen={true}
                onToggle={() => setActivePanel(null)}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {activePanel === 'pairs' && (
        <div className="fixed inset-0 z-[85] bg-black/80" />
      )}
      <div className="relative z-[999]">{activePanel && renderPanel()}</div>
      <div
        className={`fixed bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 transform transition-transform duration-300 ${
          scrollDirection === 'down' ? 'translate-y-24' : 'translate-y-0'
        }`}
      >
        <div className="flex h-full gap-2 rounded-full border border-[#222] bg-black px-2 py-2">
          <SidebarIconButton
            icon={LuSearch}
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
    </>
  );
};

const SidebarIconButton = ({
  icon: Icon,
  isActive,
  onClick
}: {
  icon: IconType;
  isActive: boolean;
  onClick: () => void;
}) => {
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
          <Icon size={20} />
        </div>
      </div>
    </button>
  );
};
