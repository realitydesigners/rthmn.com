"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { MobilePanelWrapper } from "@/components/Panels/MobilePanelWrapper";
import { cn } from "@/utils/cn";
import type { IconType } from "react-icons";

interface NavButton {
  id: string;
  icon: IconType;
  tourContent: React.ReactNode;
  panelContent: React.ReactNode;
}

interface MobileNavbarContentProps {
  buttons: NavButton[];
}

export const MobileNavbarContent = ({ buttons }: MobileNavbarContentProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | undefined>();
  const navRef = useRef<HTMLDivElement>(null);
  const { currentStepId, isStepCompleted } = useOnboardingStore();

  const handlePanelToggle = (panel: string) => {
    const newIsOpen = activePanel !== panel || !isOpen;
    const newActivePanel = newIsOpen ? panel : undefined;

    setIsOpen(newIsOpen);
    setActivePanel(newActivePanel);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActivePanel(undefined);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname === "/account" || pathname === "/pricing") return null;

  const renderPanelContent = () => {
    const activeButton = buttons.find((button) => button.id === activePanel);
    return activeButton?.panelContent || null;
  };

  return (
    <div className="lg:hidden " ref={navRef}>
      <div className="fixed bottom-4 left-1/2 z-[2060] flex -translate-x-1/2 transform">
        <div className="flex h-full gap-2 rounded-full border border-[#0A0B0D] bg-black/80 backdrop-blur-md px-2 py-2">
          {buttons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={() => handlePanelToggle(button.id)}
                className="group relative flex items-center"
              >
                <div
                  className={cn(
                    "group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b p-[1px] transition-all duration-200",
                    activePanel === button.id
                      ? "from-[#32353C] to-[#282828]"
                      : "from-[#32353C] to-[#1C1E23] hover:from-[#32353C] hover:to-[#282828]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#1C1E23]",
                      activePanel === button.id ? "text-white" : "text-[#818181]"
                    )}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <MobilePanelWrapper
        isOpen={isOpen && !!activePanel}
        title={activePanel}
        onClose={handleClose}
        isCurrentTourStep={currentStepId === activePanel}
        isCompleted={isStepCompleted(activePanel)}
      >
        {renderPanelContent()}
      </MobilePanelWrapper>
    </div>
  );
}; 