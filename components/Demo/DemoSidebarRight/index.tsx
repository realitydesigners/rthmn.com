"use client";

import { DemoSidebarWrapper } from "@/components/Demo/DemoSidebarPanelWrapper";
import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { LuSettings } from "react-icons/lu";
import { cn } from "@/utils/cn";
import { DemoSettingsPanel } from "../DemoPanelContent/DemoSettingsPanel";

interface DemoSidebarRightProps {
  x?: MotionValue<number>;
  opacity?: MotionValue<number>;
  scrollYProgress?: MotionValue<number>;
  shouldOpen?: boolean;
}

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

        {isActive && (
          <div
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
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

export const DemoSidebarRight = memo(
  ({
    x,
    opacity,
    scrollYProgress,
    shouldOpen = false,
  }: DemoSidebarRightProps) => {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (shouldOpen && !activePanel) {
        setActivePanel("settings");
      } else if (!shouldOpen && activePanel) {
        setActivePanel(null);
      }
    }, [shouldOpen, activePanel]);

    useEffect(() => {
      if (!scrollYProgress || !activePanel || shouldOpen) return;

      let lastScrollValue = scrollYProgress.get();
      let scrollStartPosition = lastScrollValue;

      const unsubscribe = scrollYProgress.onChange((currentValue) => {
        if (currentValue < lastScrollValue && activePanel) {
          const scrollDistance = scrollStartPosition - currentValue;

          const isMobile =
            typeof window !== "undefined" &&
            (window.innerWidth < 1024 || "ontouchstart" in window);
          const closeThreshold = isMobile ? 0.03 : 0.05; // Even more responsive on mobile

          if (scrollDistance > closeThreshold) {
            setActivePanel(null);
          }
        } else if (currentValue > lastScrollValue) {
          scrollStartPosition = currentValue;
        }

        lastScrollValue = currentValue;
      });

      return unsubscribe;
    }, [scrollYProgress, activePanel, shouldOpen]);

    const mockButtons = [
      {
        id: "settings",
        icon: LuSettings,
        label: "Settings",
        panelContent: <DemoSettingsPanel />,
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
            marginRight: isOpen && activePanel ? "280px" : "0px",
            transition: "margin-right 0.4s cubic-bezier(0.23, 1, 0.280, 1)",
          }}
          className={cn(
            "absolute right-0 top-14 bottom-0 z-[150] flex w-16 flex-col items-center justify-between py-4 transition-all duration-200 pointer-events-auto"
          )}
        >
          <div className="mb-2 flex flex-col gap-2">
            {mockButtons.map((button) => (
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
