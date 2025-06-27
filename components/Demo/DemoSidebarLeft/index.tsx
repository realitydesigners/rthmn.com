"use client";

import {
  DemoAnalyticsPanel,
  DemoInstrumentsPanel,
  DemoVisualizerPanel,
} from "@/components/Demo/DemoPanelContent";
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
}

// Mock Demo Sidebar Left Component
export const DemoSidebarLeft = memo(({ x, opacity }: DemoSidebarLeftProps) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

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
    console.log("Button clicked:", buttonId, "activePanel:", activePanel);

    if (activePanel === buttonId) {
      console.log("Closing panel");
      setActivePanel(null);
    } else {
      console.log("Opening panel:", buttonId);
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
                  console.log("Button click event fired for:", button.id);
                  handleButtonClick(button.id);
                }}
                className="group relative z-[160] flex h-10 w-10 items-center justify-center transition-all duration-200 overflow-hidden pointer-events-auto"
                style={{
                  borderRadius: "4px",
                  background: isActive
                    ? "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)"
                    : undefined,
                  boxShadow: isActive
                    ? "0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
                    : undefined,
                }}
              >
                {/* Green indicator for active panel */}
                {isActive && (
                  <div
                    className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#4EFF6E] z-10"
                    style={{
                      width: "30px",
                      height: "4px",
                      transform: "translateY(-50%) rotate(-90deg)",
                      filter: "blur(10px)",
                      transformOrigin: "center",
                    }}
                  />
                )}

                {/* Hover background for non-active buttons */}
                {!isActive && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      borderRadius: "4px",
                      background:
                        "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                    }}
                  />
                )}

                <IconComponent
                  size={20}
                  className={`relative z-10 transition-colors duration-200 ${
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
          onClose={() => {
            console.log("Panel close clicked");
            setActivePanel(null);
          }}
        >
          {activePanelData.panelContent}
        </DemoSidebarWrapper>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-4 left-20 z-[200] bg-black/80 text-white p-2 text-xs rounded">
          <div>Active Panel: {activePanel || "none"}</div>
          <div>Panel Data: {activePanelData ? "exists" : "null"}</div>
          <button
            onClick={() => {
              console.log("Test button clicked!");
              setActivePanel("instruments");
            }}
            className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
          >
            Test Click
          </button>
        </div>
      )}
    </>
  );
});

DemoSidebarLeft.displayName = "DemoSidebarLeft";
