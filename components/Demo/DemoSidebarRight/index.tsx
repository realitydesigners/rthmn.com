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

interface DemoSidebarRightProps {
  x?: MotionValue<number>;
  opacity?: MotionValue<number>;
}

// Demo Color Preset Component
const DemoColorPreset = memo(
  ({
    name,
    positive,
    negative,
    isSelected,
    onClick,
  }: {
    name: string;
    positive: string;
    negative: string;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex h-[72px] flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-b p-2 transition-all duration-200",
        isSelected
          ? "border-[#1C1E23] from-[#1C1E23]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#32353C] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90"
          : "border-[#0A0B0D] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#1C1E23] hover:from-[#1C1E23]/40 hover:to-[#0F0F0F]/50"
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 30% 30%, ${positive}${isSelected ? "11" : "05"}, ${negative}${isSelected ? "22" : "08"})`,
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className={cn(
          "absolute inset-0",
          isSelected ? "opacity-50" : "opacity-20"
        )}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${positive}${isSelected ? "22" : "11"}, ${negative}${isSelected ? "33" : "15"})`,
        }}
      />

      <div className="relative h-8 w-8 overflow-hidden rounded-full shadow-xl">
        <div
          className="absolute inset-0 transition-transform duration-200 group-hover:scale-110"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${positive}, ${negative})`,
            boxShadow: `
						inset 0 0 15px ${positive}66,
						inset 2px 2px 4px ${positive}33,
						0 0 20px ${positive}22
					`,
          }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        <span className="font-kodemono text-[8px] font-medium tracking-widest text-[#32353C] uppercase transition-colors group-hover:text-[#818181]">
          {name}
        </span>
      </div>
    </button>
  )
);

// Demo Style Control Component
const DemoStyleControl = memo(
  ({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    unit = "",
    onChange,
  }: {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
  }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-kodemono text-[10px] font-medium tracking-wider text-[#32353C] uppercase">
            {label}
          </span>
          <span className="font-kodemono text-[10px] text-[#545963]">
            {value.toFixed(step < 1 ? 2 : 0)}
            {unit}
          </span>
        </div>
        <div className="relative">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#0A0B0D] to-[#1C1E23]"
            style={{
              background:
                "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
              boxShadow: "inset 0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          />
          <div
            className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#4EFF6E] to-[#4EFF6E]/80 transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    );
  }
);

// Demo Toggle Component
const DemoToggle = memo(
  ({
    title,
    isEnabled,
    onToggle,
  }: {
    title: string;
    isEnabled: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-center justify-between py-2">
      <span className="font-kodemono text-[10px] font-medium tracking-wider text-[#32353C] uppercase">
        {title}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
          isEnabled
            ? "bg-gradient-to-r from-[#4EFF6E] to-[#4EFF6E]/80"
            : "bg-gradient-to-r from-[#24282D] to-[#111316]"
        )}
      >
        <span
          className={cn(
            "inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200",
            isEnabled ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
    </div>
  )
);

// Demo Panel Section Component
const DemoPanelSection = memo(
  ({
    title,
    icon: Icon,
    children,
    isExpanded = true,
    onToggle,
  }: {
    title: string;
    icon: React.ComponentType<{ size: number; className?: string }>;
    children: React.ReactNode;
    isExpanded?: boolean;
    onToggle?: () => void;
  }) => (
    <div className="mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 transition-colors duration-200 hover:bg-[#1A1D22]/30"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-[#4EFF6E]" />
          <span className="font-outfit text-sm font-medium text-white">
            {title}
          </span>
        </div>
        {onToggle && (
          <div
            className={cn(
              "transition-transform duration-200",
              isExpanded ? "rotate-180" : ""
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="#545963"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </button>
      {isExpanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
);

// Demo Settings Panel Content
const DemoSettingsPanel = memo(() => {
  const [selectedPreset, setSelectedPreset] = useState("Default");
  const [animationSpeed, setAnimationSpeed] = useState(0.75);
  const [transparency, setTransparency] = useState(0.85);
  const [borderRadius, setBorderRadius] = useState(8);
  const [shadowIntensity, setShadowIntensity] = useState(0.25);
  const [showBorder, setShowBorder] = useState(true);
  const [showPriceLines, setShowPriceLines] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    colors: true,
    style: true,
    display: true,
    preferences: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const colorPresets = [
    { name: "Default", positive: "#E2E8F0", negative: "#2D3748" },
    { name: "Neon", positive: "#00FF88", negative: "#FF0066" },
    { name: "Ocean", positive: "#00D4FF", negative: "#0066CC" },
    { name: "Sunset", positive: "#FF6B35", negative: "#F7931E" },
    { name: "Forest", positive: "#4CAF50", negative: "#2E7D32" },
    { name: "Royal", positive: "#9C27B0", negative: "#673AB7" },
  ];

  return (
    <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-1">
        {/* Color Style Section */}
        <DemoPanelSection
          title="Color Style"
          icon={LuPalette}
          isExpanded={expandedSections.colors}
          onToggle={() => toggleSection("colors")}
        >
          <div className="space-y-4">
            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map((preset) => (
                <DemoColorPreset
                  key={preset.name}
                  name={preset.name}
                  positive={preset.positive}
                  negative={preset.negative}
                  isSelected={selectedPreset === preset.name}
                  onClick={() => setSelectedPreset(preset.name)}
                />
              ))}
            </div>
          </div>
        </DemoPanelSection>

        {/* Box Style Section */}
        <DemoPanelSection
          title="Box Style"
          icon={LuBox}
          isExpanded={expandedSections.style}
          onToggle={() => toggleSection("style")}
        >
          <div className="space-y-4">
            {/* Preview Box */}
            <div className="relative flex h-24 items-center justify-center rounded-lg bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]">
              <div
                className={cn(
                  "relative h-16 w-16 transition-all duration-300",
                  showBorder && "border border-[#111215]"
                )}
                style={{
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `
										inset 0 0 ${shadowIntensity * 50}px rgba(255, 255, 255, ${shadowIntensity * 0.3}),
										0 0 20px rgba(255, 255, 255, 0.05)
									`,
                  backgroundColor: `rgba(255, 255, 255, ${transparency * 0.1})`,
                }}
              />
            </div>

            {/* Style Controls */}
            <div className="space-y-3">
              <DemoStyleControl
                label="Border Radius"
                value={borderRadius}
                min={0}
                max={16}
                step={1}
                unit="px"
                onChange={setBorderRadius}
              />
              <DemoStyleControl
                label="Shadow Depth"
                value={shadowIntensity}
                min={0}
                max={1}
                step={0.05}
                onChange={setShadowIntensity}
              />
              <DemoStyleControl
                label="Transparency"
                value={transparency}
                min={0.1}
                max={1}
                step={0.05}
                onChange={setTransparency}
              />
            </div>

            {/* Toggles */}
            <div className="space-y-2 border-t border-[#1A1D22] pt-3">
              <DemoToggle
                title="Show Border"
                isEnabled={showBorder}
                onToggle={() => setShowBorder(!showBorder)}
              />
              <DemoToggle
                title="Show Price Lines"
                isEnabled={showPriceLines}
                onToggle={() => setShowPriceLines(!showPriceLines)}
              />
            </div>
          </div>
        </DemoPanelSection>

        {/* Display Settings Section */}
        <DemoPanelSection
          title="Display Settings"
          icon={LuSliders}
          isExpanded={expandedSections.display}
          onToggle={() => toggleSection("display")}
        >
          <div className="space-y-3">
            <DemoStyleControl
              label="Animation Speed"
              value={animationSpeed}
              min={0.1}
              max={2}
              step={0.05}
              unit="x"
              onChange={setAnimationSpeed}
            />
            <DemoStyleControl
              label="UI Transparency"
              value={transparency}
              min={0.5}
              max={1}
              step={0.05}
              onChange={setTransparency}
            />
          </div>
        </DemoPanelSection>

        {/* Preferences Section */}
        <DemoPanelSection
          title="Preferences"
          icon={LuSettings}
          isExpanded={expandedSections.preferences}
          onToggle={() => toggleSection("preferences")}
        >
          <div className="space-y-2">
            <DemoToggle
              title="Notifications"
              isEnabled={notifications}
              onToggle={() => setNotifications(!notifications)}
            />
            <DemoToggle
              title="Auto Save"
              isEnabled={autoSave}
              onToggle={() => setAutoSave(!autoSave)}
            />
          </div>
        </DemoPanelSection>
      </div>
    </div>
  );
});

// Mock Demo Sidebar Right Component
export const DemoSidebarRight = memo(
  ({ x, opacity }: DemoSidebarRightProps) => {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [sidebarLoaded, setSidebarLoaded] = useState(false);

    // Simulate sidebar loading completion after animation
    useEffect(() => {
      const timer = setTimeout(() => {
        setSidebarLoaded(true);
      }, 1000); // Wait for sidebar animation to complete

      return () => clearTimeout(timer);
    }, []);

    const mockButtons = [
      {
        id: "onboarding",
        icon: LuGraduationCap,
        label: "Tutorial",
        panelContent: <DemoSettingsPanel />,
      },
      {
        id: "settings",
        icon: LuSettings,
        label: "Settings",
        panelContent: <DemoSettingsPanel />,
      },
      {
        id: "account",
        icon: LuUser,
        label: "Account",
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
                    console.log("Top button click event fired for:", button.id);
                    e.preventDefault();
                    e.stopPropagation();
                    handleButtonClick(button.id);
                  }}
                  disabled={!sidebarLoaded}
                  className={cn(
                    "group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all duration-300 z-[160] pointer-events-auto",
                    !sidebarLoaded ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  {/* Active state background */}
                  {isActive && (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{
                          borderRadius: "4px",
                          background:
                            "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                      />
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
                    </>
                  )}

                  {/* Inactive hover state */}
                  {!isActive && (
                    <>
                      <div
                        className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                        style={{
                          borderRadius: "4px",
                          background:
                            "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          borderRadius: "4px",
                          background:
                            "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                      />
                    </>
                  )}

                  <IconComponent
                    size={20}
                    className={cn(
                      "relative z-10 transition-colors duration-300",
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
                    console.log(
                      "Bottom button click event fired for:",
                      button.id
                    );
                    e.preventDefault();
                    e.stopPropagation();
                    handleButtonClick(button.id);
                  }}
                  disabled={!sidebarLoaded}
                  className={cn(
                    "group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all duration-300 z-[160] pointer-events-auto",
                    !sidebarLoaded ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  {/* Active state background */}
                  {isActive && (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{
                          borderRadius: "4px",
                          background:
                            "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                      />
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
                    </>
                  )}

                  {/* Inactive hover state */}
                  {!isActive && (
                    <>
                      <div
                        className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                        style={{
                          borderRadius: "4px",
                          background:
                            "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          borderRadius: "4px",
                          background:
                            "linear-gradient(180deg, #2C3137 -10.71%, #16191D 100%)",
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                      />
                    </>
                  )}

                  <IconComponent
                    size={20}
                    className={cn(
                      "relative z-10 transition-colors duration-300",
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
          >
            {activePanelData.panelContent}
          </DemoSidebarWrapper>
        )}
      </>
    );
  }
);

DemoSidebarRight.displayName = "DemoSidebarRight";
