"use client";

import { memo, useState } from "react";
import { LuBox, LuLayoutGrid, LuLineChart, LuLock } from "react-icons/lu";
import { cn } from "@/utils/cn";

// Demo Visualizer Panel Content
export const DemoVisualizerPanel = memo(() => {
  const [activeChartStyle, setActiveChartStyle] = useState("box");
  const [timeframePosition, setTimeframePosition] = useState(15);
  const [timeframeWidth, setTimeframeWidth] = useState(8);

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

  const chartStyles = [
    {
      id: "box",
      title: "Box",
      icon: SquareIcon,
      locked: false,
      description: "Classic box visualization",
    },
    {
      id: "3d",
      title: "3D",
      icon: LuBox,
      locked: false,
      description: "3D visualization of boxes",
    },
    {
      id: "line",
      title: "Line",
      icon: LuLineChart,
      locked: true,
      description: "Traditional line chart view",
      comingSoon: true,
    },
  ];

  const timeIntervals = [
    { label: "1D", minutes: 1440 },
    { label: "12H", minutes: 720 },
    { label: "6H", minutes: 360 },
    { label: "4H", minutes: 240 },
    { label: "2H", minutes: 120 },
    { label: "1H", minutes: 60 },
    { label: "30m", minutes: 30 },
    { label: "15m", minutes: 15 },
    { label: "5m", minutes: 5 },
    { label: "1m", minutes: 1 },
  ];

  // Demo Chart Style Option Component
  const DemoChartStyleOption = ({
    id,
    title,
    icon: Icon,
    locked,
    onClick,
  }: {
    id: string;
    title: string;
    icon: React.ComponentType<{ size: number; className?: string }>;
    locked: boolean;
    onClick?: () => void;
  }) => {
    const isActive = activeChartStyle === id;

    return (
      <button
        type="button"
        onClick={locked ? undefined : onClick}
        className={cn(
          "group relative flex h-[72px] flex-col items-center justify-center gap-2 rounded-lg border transition-all duration-300",
          isActive
            ? [
                "border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
                "shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                "hover:border-[#1C1E23] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
              ]
            : [
                "border-[#111215] bg-gradient-to-b from-[#0A0B0D]/80 to-[#070809]/80",
                "hover:border-[#1C1E23] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
              ],
          locked ? "pointer-events-none opacity-90" : "cursor-pointer"
        )}
      >
        {/* Background glow effect */}
        {isActive && !locked && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]" />
        )}

        {/* Diagonal stripes for locked state */}
        {locked && (
          <>
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  135deg,
                  #000,
                  #000 1px,
                  transparent 1.5px,
                  transparent 6px
                )`,
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  #000,
                  #000 1px,
                  transparent 1.5px,
                  transparent 6px
                )`,
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  135deg,
                  #fff,
                  #fff 1px,
                  transparent 1.5px,
                  transparent 6px
                )`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/5" />
          </>
        )}

        {/* Lock icon */}
        {locked && (
          <div className="pointer-events-none absolute -top-1 -right-1 flex items-center">
            <div className="flex h-5 items-center gap-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#1C1E23] bg-gradient-to-b from-black/90 to-black/95 shadow-[0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-[1px]">
                <LuLock className="h-2.5 w-2.5 text-white/80" />
              </div>
            </div>
          </div>
        )}

        {/* Icon container */}
        <div
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b transition-all duration-300",
            locked
              ? "from-[#0A0B0D]/70 to-[#070809]/70 shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
              : isActive
                ? [
                    "from-[#0A0B0D] to-[#070809]",
                    "shadow-[0_2px_4px_rgba(0,0,0,0.4)]",
                    "group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)]",
                  ]
                : [
                    "from-[#0A0B0D] to-[#070809]",
                    "shadow-[0_2px_4px_rgba(0,0,0,0.2)]",
                    "group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
                  ]
          )}
        >
          {!locked && isActive && (
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
          )}
          <Icon
            size={20}
            className={cn(
              "relative transition-all duration-300",
              isActive
                ? "text-[#545963] group-hover:text-white"
                : "text-[#32353C] group-hover:text-[#545963]",
              locked ? "text-[#32353C] opacity-40" : "group-hover:scale-105"
            )}
          />
        </div>

        {/* Title */}
        <span
          className={cn(
            "font-outfit text-[13px] font-medium tracking-wide transition-all duration-300",
            locked
              ? "text-[#32353C]/40"
              : isActive
                ? "text-[#545963]"
                : "text-[#32353C] group-hover:text-[#545963]"
          )}
        >
          {title}
        </span>
      </button>
    );
  };

  // Demo Timeframe Slider Component
  const DemoTimeframeSlider = () => {
    const selectionStyle = {
      transform: `translateX(${(timeframePosition / 38) * 100}%) scaleX(${timeframeWidth / 38})`,
      transformOrigin: "left",
      width: "100%",
    };

    return (
      <div className="relative h-full px-[7px] pb-6">
        {/* Main slider container */}
        <div className="group/bars relative flex h-12 items-center touch-none">
          {/* Base layer */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <title>Background Pattern</title>
              <defs>
                <pattern
                  id="diagonalLines"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diagonalLines)" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-[#070809] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.3)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/20" />

          {/* Selection area */}
          <div
            className="absolute h-full bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-[inset_0_0_30px_rgba(255,255,255,0.05),0_0_15px_rgba(0,0,0,0.8)]"
            style={selectionStyle}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,rgba(255,255,255,0.08),transparent_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-[#111215]" />
            </div>

            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#1C1E23] to-transparent" />
            <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/30 via-[#32353C] to-[#1C1E23]" />
            <div className="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-white/30 via-[#32353C] to-[#1C1E23]" />
          </div>
        </div>

        {/* Time intervals scale */}
        <div className="mt-2 w-full">
          <div className="flex w-full justify-between px-[7px]">
            {timeIntervals.map((interval, i) => {
              const position = (i / (timeIntervals.length - 1)) * 37;
              const isInRange =
                position >= timeframePosition &&
                position <= timeframePosition + timeframeWidth;

              return (
                <div
                  key={interval.label}
                  className="flex flex-col items-center"
                >
                  <div
                    className={cn(
                      "h-3 w-[1px] transition-all duration-200",
                      isInRange
                        ? "bg-gradient-to-b from-white/90 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                        : "bg-gradient-to-b from-white/20 to-transparent"
                    )}
                  />
                  <span
                    className={cn(
                      "mt-1 font-kodemono text-[9px] tracking-wider transition-all duration-200",
                      isInRange
                        ? "text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        : "text-white/30",
                      "whitespace-nowrap"
                    )}
                  >
                    {interval.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      {/* Chart Style Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuLineChart size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Chart Style
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {chartStyles.map((style) => (
            <DemoChartStyleOption
              key={style.id}
              {...style}
              onClick={() => !style.locked && setActiveChartStyle(style.id)}
            />
          ))}
        </div>
      </div>

      {/* Timeframe Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuLayoutGrid size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Timeframe
          </h3>
        </div>
        <div
          className="rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-3"
          style={{
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <DemoTimeframeSlider />
        </div>
        {/* CSS Styles for range inputs */}
        <style jsx global>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: var(--thumb-size);
            width: var(--thumb-size);
            border-radius: 50%;
            background: var(--thumb-color);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            cursor: grab;
            transition: all 0.15s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.25);
          }
          input[type="range"]::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(0.95);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.08);
          }
          input[type="range"]::-webkit-slider-runnable-track {
            background: transparent;
          }
        `}</style>
      </div>
    </div>
  );
});

DemoVisualizerPanel.displayName = "DemoVisualizerPanel";
