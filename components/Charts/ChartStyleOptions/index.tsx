"use client";

import { PanelSection } from "@/components/Panels/PanelComponents/PanelSection";
import { useColorStore } from "@/stores/colorStore";
import { cn } from "@/utils/cn";
import type React from "react";
import { memo, useState } from "react";
import { LuBox, LuBoxes, LuLineChart, LuLock } from "react-icons/lu";

// Custom Square icon component
const SquareIcon = ({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="Square box icon"
  >
    <title>Square box icon</title>
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

export const CHART_STYLES = {
  box: {
    id: "box",
    title: "Box",
    icon: SquareIcon,
    locked: false,
    isActive: true,
    description: "Classic box visualization",
  },

  threeD: {
    id: "3d",
    title: "3D",
    icon: LuBox,
    locked: false,
    isActive: false,
    description: "3D visualization of boxes",
  },
  line: {
    id: "line",
    title: "Line",
    icon: LuLineChart,
    locked: true,
    isActive: false,
    description: "Traditional line chart view",
    comingSoon: true,
  },
} as const;

interface IconProps {
  size: number;
  className?: string;
}

interface ChartStyleOptionProps {
  id: string;
  title: string;
  icon: React.ComponentType<IconProps>;
  locked: boolean;
  isActive: boolean;
  description: string;
  onClick?: () => void;
}

const ChartStyleOption: React.FC<ChartStyleOptionProps> = ({
  title,
  icon: Icon,
  locked,
  isActive,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      className={cn(
        "group relative flex h-20 flex-col items-center justify-center gap-2 rounded-xl border transition-all duration-300 overflow-hidden",
        isActive
          ? "border-[#545963]/40 bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)] ring-1 ring-white/10"
          : "border-[#111215] bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/80 hover:border-[#1C1E23]",
        locked ? "pointer-events-none opacity-60" : "cursor-pointer"
      )}
      style={{
        boxShadow: isActive
          ? "0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0 0 20px rgba(255, 255, 255, 0.05)"
          : undefined,
      }}
    >
      {/* Active state background effects */}
      {isActive && !locked && (
        <>
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
          </div>

          {/* Subtle animated glow */}
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
          </div>
        </>
      )}

      {/* Hover effects for inactive buttons */}
      {!isActive && !locked && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C3137]/50 via-[#16191D]/30 to-[#0A0B0D]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.03),transparent_70%)]" />
        </div>
      )}

      {/* Diagonal stripes pattern for locked state */}
      {locked && (
        <>
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                                135deg,
                                #000,
                                #000 1px,
                                transparent 1.5px,
                                transparent 8px
                            )`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/10" />
        </>
      )}

      {/* Enhanced lock icon */}
      {locked && (
        <div className="pointer-events-none absolute -top-1 -right-1 z-10">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-[#343A42] to-[#1F2328] border border-[#32353C]/60 shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
            <LuLock className="h-3 w-3 text-white/90" />
          </div>
        </div>
      )}

      {/* Enhanced icon container */}
      <div
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
          locked
            ? "bg-gradient-to-b from-[#0A0B0D]/50 to-[#070809]/50"
            : isActive
              ? "bg-gradient-to-b from-[#343A42] to-[#1F2328] shadow-[0_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-white/20"
              : "bg-gradient-to-b from-[#0A0B0D] to-[#070809] group-hover:from-[#2C3137] group-hover:to-[#16191D] shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        )}
      >
        {/* Active state inner glow */}
        {isActive && !locked && (
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_70%)]" />
        )}

        {/* Icon with enhanced effects */}
        <Icon
          size={22}
          className={cn(
            "relative transition-all duration-300",
            isActive && !locked
              ? "text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]"
              : locked
                ? "text-[#32353C] opacity-40"
                : "text-[#545963] group-hover:text-white group-hover:scale-110 group-hover:drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]"
          )}
        />
      </div>

      {/* Enhanced title */}
      <span
        className={cn(
          "font-russo text-[11px] font-medium tracking-wide transition-all duration-300",
          locked
            ? "text-[#32353C]/40"
            : isActive
              ? "text-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]"
              : "text-[#545963] group-hover:text-white"
        )}
      >
        {title}
      </span>

      {/* Subtle border animation for active state */}
      {isActive && !locked && (
        <div className="absolute inset-0 rounded-xl border border-white/20 animate-pulse" />
      )}
    </button>
  );
};

const ChartStyleOptionsContent = memo(() => {
  const boxColors = useColorStore((state) => state.boxColors);
  const updateStyles = useColorStore((state) => state.updateStyles);

  const handleStyleChange = (id: string) => {
    updateStyles({ viewMode: id === "3d" ? "3d" : "default" });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {Object.values(CHART_STYLES).map((style) => (
          <ChartStyleOption
            key={style.id}
            {...style}
            isActive={
              boxColors.styles?.viewMode ===
              (style.id === "3d" ? "3d" : "default")
            }
            onClick={() => handleStyleChange(style.id)}
          />
        ))}
      </div>
    </div>
  );
});

export const ChartStyleOptions = memo(() => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <PanelSection
      title="Chart Style"
      icon={LuLineChart}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-2">
        <ChartStyleOptionsContent />
      </div>
    </PanelSection>
  );
});

ChartStyleOptions.displayName = "ChartStyleOptions";
ChartStyleOptionsContent.displayName = "ChartStyleOptionsContent";
ChartStyleOption.displayName = "ChartStyleOption";
