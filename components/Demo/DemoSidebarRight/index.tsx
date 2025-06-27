"use client";

import { DemoSidebarWrapper } from "@/components/Demo/DemoSidebarPanelWrapper";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { memo, useEffect, useState, useCallback } from "react";
import {
  LuGraduationCap,
  LuSettings,
  LuUser,
  LuPalette,
  LuBox,
  LuSliders,
  LuBell,
  LuShield,
} from "react-icons/lu";
import { cn } from "@/utils/cn";
import { DemoSettingsPanel } from "../DemoPanelContent/DemoSettingsPanel";

interface DemoSidebarRightProps {
  x?: MotionValue<number>;
  opacity?: MotionValue<number>;
  scrollYProgress?: MotionValue<number>;
}

// Demo Color Preset Component

// Mock Demo Sidebar Right Component
export const DemoSidebarRight = memo(
  ({ x, opacity, scrollYProgress }: DemoSidebarRightProps) => {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [sidebarLoaded, setSidebarLoaded] = useState(false);

    // Auto-close panel when scrolling significantly back up
    useEffect(() => {
      if (!scrollYProgress || !activePanel) return;

      let lastScrollValue = scrollYProgress.get();
      let scrollStartPosition = lastScrollValue;

      const unsubscribe = scrollYProgress.onChange((currentValue) => {
        // If scrolling back up (decreasing scroll value) and panel is open
        if (currentValue < lastScrollValue && activePanel) {
          // Calculate how much we've scrolled back up
          const scrollDistance = scrollStartPosition - currentValue;

          // Close panel after scrolling back up a significant amount (equivalent to ~60px)
          // Mobile-optimized threshold - more responsive on touch devices
          const isMobile =
            typeof window !== "undefined" &&
            (window.innerWidth < 1024 || "ontouchstart" in window);
          const closeThreshold = isMobile ? 0.03 : 0.05; // Even more responsive on mobile

          if (scrollDistance > closeThreshold) {
            setActivePanel(null);
          }
        } else if (currentValue > lastScrollValue) {
          // Reset start position when scrolling down
          scrollStartPosition = currentValue;
        }

        lastScrollValue = currentValue;
      });

      return unsubscribe;
    }, [scrollYProgress, activePanel]);

    // Simulate sidebar loading completion after animation
    useEffect(() => {
      const timer = setTimeout(() => {
        setSidebarLoaded(true);
      }, 1000); // Wait for sidebar animation to complete

      return () => clearTimeout(timer);
    }, []);

    const mockButtons = [
      // {
      //   id: "onboarding",
      //   icon: LuGraduationCap,
      //   label: "Tutorial",
      //   panelContent: <DemoSettingsPanel />,
      // },
      {
        id: "settings",
        icon: LuSettings,
        label: "Settings",
        panelContent: <DemoSettingsPanel />,
      },
    ];

    const handleButtonClick = (buttonId: string) => {
      if (!sidebarLoaded) {
        return;
      }

      if (activePanel === buttonId) {
        setActivePanel(null);
      } else {
        setActivePanel(buttonId);
      }
    };

    const activePanelData = mockButtons.find(
      (button) => button.id === activePanel
    );

    return (
      <>
        <motion.div
          style={{ x, opacity }}
          className="absolute right-0 top-14 bottom-0 z-[150] flex w-16 flex-col items-center justify-between border-l border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] py-4 pointer-events-auto"
        >
          {/* Top buttons */}
          <div className="relative flex flex-col gap-2">
            {mockButtons.slice(0, 1).map((button, index) => {
              const IconComponent = button.icon;
              const isActive = activePanel === button.id;

              return (
                <button
                  key={button.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleButtonClick(button.id);
                  }}
                  disabled={!sidebarLoaded}
                  className={cn(
                    "group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded transition-all duration-200 z-[160] pointer-events-auto",
                    isActive
                      ? "bg-[#1C1E23]"
                      : "bg-transparent hover:bg-[#1C1E23]/60",
                    !sidebarLoaded ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  <IconComponent
                    size={20}
                    className={cn(
                      "transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-[#B0B0B0] group-hover:text-white"
                    )}
                  />

                  {/* Tooltip */}
                  <div className="absolute right-full mr-2 hidden group-hover:block">
                    <div className="whitespace-nowrap rounded-md bg-[#1C1E23] px-2 py-1 text-xs text-white shadow-lg border border-[#32353C]">
                      {button.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom buttons - Settings and Account */}
          <div className="mb-2 flex flex-col gap-2">
            {mockButtons.slice(1).map((button) => {
              const IconComponent = button.icon;
              const isActive = activePanel === button.id;

              return (
                <button
                  key={button.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleButtonClick(button.id);
                  }}
                  disabled={!sidebarLoaded}
                  className={cn(
                    "group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded transition-all duration-200 z-[160] pointer-events-auto",
                    isActive
                      ? "bg-[#1C1E23]"
                      : "bg-transparent hover:bg-[#1C1E23]/60",
                    !sidebarLoaded ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  <IconComponent
                    size={20}
                    className={cn(
                      "transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-[#B0B0B0] group-hover:text-white"
                    )}
                  />

                  {/* Tooltip */}
                  <div className="absolute right-full mr-2 hidden group-hover:block">
                    <div className="whitespace-nowrap rounded-md bg-[#1C1E23] px-2 py-1 text-xs text-white shadow-lg border border-[#32353C]">
                      {button.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Demo Panel Wrapper */}
        {activePanelData && (
          <DemoSidebarWrapper
            isOpen={!!activePanel}
            title={activePanelData.label}
            position="right"
            onClose={() => setActivePanel(null)}
            opacity={opacity}
          >
            {activePanelData.panelContent}
          </DemoSidebarWrapper>
        )}
      </>
    );
  }
);

DemoSidebarRight.displayName = "DemoSidebarRight";
