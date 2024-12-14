'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconType } from 'react-icons';
import { LuSettings, LuBeaker, LuSearch } from 'react-icons/lu';
import { SelectedPairs } from '@/components/SelectedPairs';
import { SettingsBar } from '@/components/DashboardNavigation/SettingsBar';
import { PairNavigator } from '@/components/DashboardNavigation/PairNavigator';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useDashboard } from '@/providers/DashboardProvider';
import Image from 'next/image';
import { useAuth } from '@/providers/SupabaseProvider';
import { ProfilePanel } from '@/components/DashboardNavigation/ProfilePanel';
import { useUser } from '@/providers/UserProvider';

type Panel = 'pairs' | 'settings' | 'alerts' | 'profile' | null;

const ProfileIcon = ({
  setActivePanel
}: {
  setActivePanel: (panel: Panel) => void;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut, user } = useAuth();
  const { userDetails } = useUser();

  const userInitial =
    user?.user_metadata?.full_name?.[0].toUpperCase() ||
    user?.email?.[0].toUpperCase() ||
    '?';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
          setActivePanel('profile');
        }}
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black">
            {userDetails?.avatar_url ? (
              <Image
                src={userDetails.avatar_url}
                alt="Profile"
                className="object-cover"
                width={80}
                height={80}
              />
            ) : (
              <span className="text-lg font-bold">{userInitial}</span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
};

export const DashboardNavigation = () => {
  const router = useRouter();
  const { selectedPairs } = useDashboard();
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const scrollDirection = useScrollDirection();
  const panelRef = useRef<HTMLDivElement>(null);

  useScrollLock(activePanel !== null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setActivePanel(null);
      }
    };

    if (activePanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePanel]);

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
          <div className="relative z-[90]">
            <div
              className="fixed inset-0 z-[85] backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActivePanel(null);
                }
              }}
            />
            <PairNavigator />
          </div>
        );
      case 'settings':
        return (
          <div className="relative z-[90]">
            <div
              className="fixed inset-0 z-[85] backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActivePanel(null);
                }
              }}
            />
            <SettingsBar isOpen={true} onToggle={() => setActivePanel(null)} />
          </div>
        );
      case 'profile':
        return (
          <div className="relative z-[90]">
            <div
              className="fixed inset-0 z-[85] backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActivePanel(null);
                }
              }}
            />
            <ProfilePanel />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {activePanel && (
        <div className="fixed inset-0 z-[85] bg-black/80">{renderPanel()}</div>
      )}
      <div
        className={`fixed bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 transform transition-transform duration-300 lg:hidden ${
          scrollDirection === 'down' ? 'translate-y-24' : 'translate-y-0'
        }`}
      >
        <div className="flex h-full gap-2 rounded-full border border-[#222] bg-black px-2 py-2">
          <ProfileIcon setActivePanel={setActivePanel} />
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

          {/* {process.env.NODE_ENV === 'development' && (
            <SidebarIconButton
              icon={LuBeaker}
              isActive={false}
              onClick={() => handleButtonClick(null, '/test')}
            />
          )} */}
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
