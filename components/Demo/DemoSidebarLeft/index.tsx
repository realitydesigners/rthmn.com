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
import { cn } from "@/utils/cn";

interface DemoSidebarLeftProps {
  x?: MotionValue<number>;
  opacity?: MotionValue<number>;
  scrollYProgress?: MotionValue<number>;
  shouldOpen?: boolean;
}

// Enhanced button component matching the real FeatureTour design
const DemoSidebarButton = ({
  icon: Icon,
  onClick,
  isActive,
  isOpen,
  label,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  onClick: () => void;
  isActive: boolean;
  isOpen: boolean;
  label: string;
}) => {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        className="group/button relative z-[120] flex h-10 w-10 items-center justify-center transition-all duration-300 overflow-hidden"
        style={{ borderRadius: "4px" }}
        title={label}
      >
        {/* Active state background */}
        {isActive && (
          <div
            className="absolute inset-0"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          />
        )}

        {/* Hover background for inactive buttons */}
        {!isActive && (
          <div
            className="absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300"
            style={{
              borderRadius: "4px",
              background:
                "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
            }}
          />
        )}

        {/* Icon */}
        <Icon
          size={20}
          className={cn(
            "relative z-10 transition-colors duration-300",
            isActive
              ? "text-[#B0B0B0]"
              : "text-[#818181] group-hover/button:text-white"
          )}
        />

        {/* Compact balanced indicator - shows when button is active */}
        {isActive && (
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
            style={{
              width: "20px",
              height: "3px",
              transform: "translateY(-50%) rotate(-90deg)",
              filter: "blur(6px)",
              transformOrigin: "center",
            }}
          />
        )}
      </button>
    </div>
  );
};

// Mock Demo Sidebar Left Component - matching the real Sidebar design
export const DemoSidebarLeft = memo(
  ({
    x,
    opacity,
    scrollYProgress,
    shouldOpen = false,
  }: DemoSidebarLeftProps) => {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Auto-open the instruments panel when shouldOpen becomes true
    useEffect(() => {
      if (shouldOpen && !activePanel) {
        setActivePanel("instruments"); // Open the instruments panel
      } else if (!shouldOpen && activePanel) {
        setActivePanel(null); // Close when shouldOpen becomes false
      }
    }, [shouldOpen, activePanel]);

    // Auto-close panel when scrolling significantly back up (only when not controlled by parent)
    useEffect(() => {
      if (!scrollYProgress || !activePanel || shouldOpen) return; // Don't auto-close when controlled by parent

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
    }, [scrollYProgress, activePanel, shouldOpen]);

    const mockButtons = [
      {
        id: "instruments",
        icon: LuLineChart,
        label: "Instruments",
        panelContent: <DemoInstrumentsPanel />,
      },
      // {
      //   id: "visualizer",
      //   icon: LuLayoutGrid,
      //   label: "Visualizer",
      //   panelContent: <DemoVisualizerPanel />,
      // },
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

    const isOpen = !!activePanel;

    if (!mounted) return null;

    return (
      <>
        <motion.div
          style={{
            x,
            opacity,
            // Subtle glow effect when no panels are active
            filter: !isOpen
              ? "drop-shadow(0 0 10px rgba(255, 255, 255, 0.02))"
              : "none",
            // Use marginLeft to move icons to panel edge without conflicting with x motion value
            marginLeft: isOpen && activePanel ? "280px" : "0px",
            transition: "margin-left 0.4s cubic-bezier(0.23, 1, 0.280, 1)",
          }}
          className={cn(
            "absolute left-0 top-14 bottom-0 z-[150] flex w-16 flex-col items-center justify-between py-4 transition-all duration-200 pointer-events-auto"
          )}
        >
          {/* Top buttons */}
          <div className="relative flex flex-col gap-2">
            {mockButtons.map((button, index) => (
              <DemoSidebarButton
                key={button.id}
                icon={button.icon}
                onClick={() => handleButtonClick(button.id)}
                isActive={activePanel === button.id}
                isOpen={isOpen}
                label={button.label}
              />
            ))}
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
