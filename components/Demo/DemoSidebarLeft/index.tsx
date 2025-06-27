"use client";

import { DemoInstrumentsPanel } from "@/components/Demo/DemoPanelContent/DemoInstrumentsPanel";
import { DemoVisualizerPanel } from "@/components/Demo/DemoPanelContent/DemoVisualizerPanel";
import { DemoSidebarWrapper } from "@/components/Demo/DemoSidebarPanelWrapper";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { memo, useEffect, useState } from "react";
import {
  LuBarChart3,
  LuLayoutGrid,
  LuLineChart,
  LuTrendingUp,
} from "react-icons/lu";

interface DemoSidebarLeftProps {
  x?: MotionValue<number>;
  opacity?: MotionValue<number>;
  scrollYProgress?: MotionValue<number>;
}

// Mock Demo Sidebar Left Component
export const DemoSidebarLeft = memo(
  ({ x, opacity, scrollYProgress }: DemoSidebarLeftProps) => {
    const [activePanel, setActivePanel] = useState<string | null>(null);

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

    const mockButtons = [
      {
        id: "instruments",
        icon: LuLineChart,
        label: "Instruments",
        panelContent: <DemoInstrumentsPanel />,
      },
      {
        id: "visualizer",
        icon: LuLayoutGrid,
        label: "Visualizer",
        panelContent: <DemoVisualizerPanel />,
      },
    ];

    const handleButtonClick = (buttonId: string) => {
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
          className="absolute left-0 top-14 bottom-0 z-[150] flex w-16 flex-col items-center justify-between border-r border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] py-4 pointer-events-auto"
        >
          {/* Top buttons */}
          <div className="relative flex flex-col gap-2">
            {mockButtons.map((button, index) => {
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
                  className={`group relative z-[160] flex h-10 w-10 items-center justify-center transition-all duration-200 rounded pointer-events-auto ${
                    isActive
                      ? "bg-[#1C1E23]"
                      : "bg-transparent hover:bg-[#1C1E23]/60"
                  }`}
                >
                  <IconComponent
                    size={20}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-[#B0B0B0] group-hover:text-white"
                    }`}
                  />

                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 hidden group-hover:block">
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
            position="left"
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

DemoSidebarLeft.displayName = "DemoSidebarLeft";
