"use client";

import { DemoInstrumentsPanel } from "@/components/Demo/DemoPanelContent/DemoInstrumentsPanel";
import { DemoSidebarWrapper } from "@/components/Demo/DemoSidebarPanelWrapper";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { LuLineChart } from "react-icons/lu";

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

  label,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  onClick: () => void;
  isActive: boolean;

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
    const [manualOverride, setManualOverride] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Only let animation system control if user hasn't manually interacted
    useEffect(() => {
      if (manualOverride) return; // Don't override user's manual choice

      if (shouldOpen && !activePanel) {
        setActivePanel("instruments");
      } else if (!shouldOpen && activePanel) {
        setActivePanel(null);
      }
    }, [shouldOpen, activePanel, manualOverride]);

    useEffect(() => {
      if (!scrollYProgress) return;

      let lastScrollValue = scrollYProgress.get();
      let scrollStartPosition = lastScrollValue;

      const unsubscribe = scrollYProgress.onChange((currentValue) => {
        // Reset manual override if user scrolls significantly (allows animation to take control again)
        if (manualOverride) {
          const scrollDistance = Math.abs(currentValue - scrollStartPosition);
          if (scrollDistance > 0.1) {
            // Significant scroll distance
            setManualOverride(false);
            scrollStartPosition = currentValue;
          }
        }

        // Original scroll-to-close logic (only when not shouldOpen and not manual override)
        if (!shouldOpen && !manualOverride && activePanel) {
          if (currentValue < lastScrollValue) {
            const scrollDistance = scrollStartPosition - currentValue;

            const isMobile =
              typeof window !== "undefined" &&
              (window.innerWidth < 1024 || "ontouchstart" in window);
            const closeThreshold = isMobile ? 0.03 : 0.05;

            if (scrollDistance > closeThreshold) {
              setActivePanel(null);
            }
          } else if (currentValue > lastScrollValue) {
            scrollStartPosition = currentValue;
          }
        }

        lastScrollValue = currentValue;
      });

      return unsubscribe;
    }, [scrollYProgress, activePanel, shouldOpen, manualOverride]);

    const mockButtons = [
      {
        id: "instruments",
        icon: LuLineChart,
        label: "Instruments",
        panelContent: <DemoInstrumentsPanel />,
      },
    ];

    const handleButtonClick = (buttonId: string) => {
      setManualOverride(true); // User is manually controlling the sidebar
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
            filter: !isOpen
              ? "drop-shadow(0 0 10px rgba(255, 255, 255, 0.02))"
              : "none",
            marginLeft: isOpen && activePanel ? "280px" : "0px",
            transition: "margin-left 0.4s cubic-bezier(0.23, 1, 0.280, 1)",
          }}
          className={cn(
            "absolute left-0 top-14 bottom-0 z-[150] flex w-16 flex-col items-center justify-between py-4 transition-all duration-200 pointer-events-auto"
          )}
        >
          <div className="relative flex flex-col gap-2">
            {mockButtons.map((button, index) => (
              <DemoSidebarButton
                key={button.id}
                icon={button.icon}
                onClick={() => handleButtonClick(button.id)}
                isActive={activePanel === button.id}
                label={button.label}
              />
            ))}
          </div>
        </motion.div>

        {activePanelData && (
          <DemoSidebarWrapper
            isOpen={!!activePanel}
            title={activePanelData.label}
            position="left"
            onClose={() => {
              setManualOverride(true); // User manually closed
              setActivePanel(null);
            }}
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
