"use client";

import { useColorStore, usePresetStore } from "@/stores/colorStore";
import { cn } from "@/utils/cn";
import { memo, useEffect, useState } from "react";
import { LuBox, LuPalette } from "react-icons/lu";

// Demo Settings Panel Content
export const DemoSettingsPanel = memo(() => {
  const { boxColors, updateBoxColors, updateStyles } = useColorStore();
  const { presets, selectedPreset, selectPreset } = usePresetStore();
  const [customPositive, setCustomPositive] = useState(boxColors.positive);
  const [customNegative, setCustomNegative] = useState(boxColors.negative);
  const [boxStyle, setBoxStyle] = useState("gradient");

  const settings = [
    { label: "Dark Mode", enabled: true },
    { label: "Real-time Updates", enabled: true },
    { label: "Sound Alerts", enabled: false },
    { label: "Email Notifications", enabled: true },
  ];

  // Update custom colors when box colors change
  useEffect(() => {
    setCustomPositive(boxColors.positive);
    setCustomNegative(boxColors.negative);
  }, [boxColors.positive, boxColors.negative]);

  const handlePresetSelect = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (preset) {
      selectPreset(presetName);
      updateBoxColors({
        positive: preset.positive,
        negative: preset.negative,
        styles: preset.styles,
      });
    }
  };

  const handleCustomColorChange = (
    type: "positive" | "negative",
    color: string
  ) => {
    if (type === "positive") {
      setCustomPositive(color);
      updateBoxColors({ positive: color });
    } else {
      setCustomNegative(color);
      updateBoxColors({ negative: color });
    }
    // Clear preset selection when using custom colors
    selectPreset(null);
  };

  const boxStyles = [
    {
      id: "gradient",
      name: "Gradient",
      preview: "linear-gradient(135deg, #4EFF6E, #2DD4BF)",
    },
    { id: "solid", name: "Solid", preview: "#4EFF6E" },
    { id: "outline", name: "Outline", preview: "transparent" },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Color Style Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuPalette size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Color Style
          </h3>
        </div>
        <div
          className="rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-2 space-y-4"
          style={{
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Presets Grid */}
          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => {
              const isSelected = selectedPreset === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset.name)}
                  className={cn(
                    "group relative flex h-[72px] flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-b p-2 transition-all duration-200",
                    isSelected
                      ? "border-[#1C1E23] from-[#1C1E23]/80 to-[#0F0F0F]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[#32353C] hover:from-[#1c1c1c]/80 hover:to-[#141414]/90"
                      : "border-[#0A0B0D] from-[#141414]/30 to-[#0A0A0A]/40 hover:border-[#1C1E23] hover:from-[#1C1E23]/40 hover:to-[#0F0F0F]/50"
                  )}
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 30%, ${preset.positive}${isSelected ? "11" : "05"}, ${preset.negative}${isSelected ? "22" : "08"})`,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div
                    className={cn(
                      "absolute inset-0",
                      isSelected ? "opacity-50" : "opacity-20"
                    )}
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${preset.positive}${isSelected ? "22" : "11"}, ${preset.negative}${isSelected ? "33" : "15"})`,
                    }}
                  />

                  <div className="relative h-8 w-8 overflow-hidden rounded-full shadow-xl">
                    <div
                      className="absolute inset-0 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${preset.positive}, ${preset.negative})`,
                        boxShadow: `
                          inset 0 0 15px ${preset.positive}66,
                          inset 2px 2px 4px ${preset.positive}33,
                          0 0 20px ${preset.positive}22
                        `,
                      }}
                    />
                  </div>

                  <div className="relative flex flex-col items-center">
                    <span className="font-kodemono text-[8px] font-medium tracking-widest text-[#32353C] uppercase transition-colors group-hover:text-[#818181]">
                      {preset.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Color Inputs */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-kodemono text-[10px] font-medium tracking-wider text-[#32353C] uppercase">
                Custom Colors
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="group flex flex-col gap-2">
                <div className="relative h-10 w-full overflow-hidden rounded-lg border border-[#0A0B0D] bg-[#0C0C0C] transition-all duration-200 hover:border-[#1C1E23] hover:bg-[#111]">
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="font-kodemono text-[8px] font-medium tracking-wider text-[#32353C] uppercase">
                      Up Trend
                    </span>
                    <div
                      className="ml-auto h-6 w-6 rounded-full shadow-lg"
                      style={{
                        background: customPositive,
                        boxShadow: `0 0 10px ${customPositive}33`,
                      }}
                    />
                  </div>
                  <input
                    type="color"
                    value={customPositive}
                    onChange={(e) =>
                      handleCustomColorChange("positive", e.target.value)
                    }
                    className="h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>
              <div className="group flex flex-col gap-2">
                <div className="relative h-10 w-full overflow-hidden rounded-lg border border-[#0A0B0D] bg-[#0C0C0C] transition-all duration-200 hover:border-[#1C1E23] hover:bg-[#111]">
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="font-kodemono text-[8px] font-medium tracking-wider text-[#32353C] uppercase">
                      Dn Trend
                    </span>
                    <div
                      className="ml-auto h-6 w-6 rounded-full shadow-lg"
                      style={{
                        background: customNegative,
                        boxShadow: `0 0 10px ${customNegative}33`,
                      }}
                    />
                  </div>
                  <input
                    type="color"
                    value={customNegative}
                    onChange={(e) =>
                      handleCustomColorChange("negative", e.target.value)
                    }
                    className="h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Box Style Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LuBox size={16} className="text-white" />
          <h3 className="font-outfit text-sm font-medium text-white">
            Box Style
          </h3>
        </div>
        <div
          className="rounded-lg border border-[#111215] bg-gradient-to-b from-[#0A0B0D] to-[#070809] space-y-2"
          style={{
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="flex flex-col gap-2">
            {/* Preview Container */}
            <div className="group relative flex flex-col overflow-hidden rounded-lg transition-all duration-300">
              <div className="relative flex flex-col rounded-lg">
                {/* Grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />

                <div className="relative flex h-full items-center justify-center p-8">
                  {/* Preview Box */}
                  <div
                    className={cn(
                      "relative h-24 w-24 transition-all duration-300",
                      boxColors.styles?.showBorder && "border border-[#111215]"
                    )}
                    style={{
                      borderRadius: `${boxColors.styles?.borderRadius || 4}px`,
                      boxShadow: `
                        inset 0 0 ${(boxColors.styles?.shadowIntensity || 0.4) * 50}px rgba(255, 255, 255, ${(boxColors.styles?.shadowIntensity || 0.4) * 0.3}),
                        0 0 20px rgba(255, 255, 255, 0.05)
                      `,
                      backgroundColor: `rgba(255, 255, 255, ${(boxColors.styles?.opacity || 0.71) * 0.1})`,
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-300"
                      style={{
                        borderRadius: `${boxColors.styles?.borderRadius || 4}px`,
                        background: `
                          radial-gradient(circle at center, 
                            rgba(255, 255, 255, ${(boxColors.styles?.opacity || 0.71) * 0.05}),
                            transparent 70%
                          )
                        `,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Container */}
            <div className="flex flex-col gap-2 p-4">
              {/* StyleControl components */}
              <div className="group relative space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-russo text-[8px] font-medium tracking-wider text-[#BFC2CA] uppercase">
                      Border Radius
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-russo text-[8px] text-white/70">
                      {boxColors.styles?.borderRadius || 4}
                    </span>
                    <span className="font-russo text-[8px] tracking-wider text-white/30 uppercase">
                      px
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex w-full items-center px-2">
                    <div className="relative h-[1px] w-full bg-white/[0.06]">
                      <div
                        className="absolute h-full bg-gradient-to-r from-[#32353C] to-[#1C1E23]"
                        style={{
                          width: `${(((boxColors.styles?.borderRadius || 4) - 0) / (16 - 0)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={16}
                    step={1}
                    value={boxColors.styles?.borderRadius || 4}
                    onChange={(e) =>
                      updateStyles({
                        borderRadius: Number.parseInt(e.target.value),
                      })
                    }
                    className="relative h-6 w-full cursor-pointer appearance-none rounded-md bg-transparent transition-all hover:cursor-grab active:cursor-grabbing"
                    style={
                      {
                        "--thumb-size": "12px",
                        "--thumb-color": "#fff",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              <div className="group relative space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-russo text-[8px] font-medium tracking-wider text-[#BFC2CA] uppercase">
                      Shadow Depth
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-russo text-[8px] text-white/70">
                      {(boxColors.styles?.shadowIntensity || 0.4).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex w-full items-center px-2">
                    <div className="relative h-[1px] w-full bg-white/[0.06]">
                      <div
                        className="absolute h-full bg-gradient-to-r from-[#32353C] to-[#1C1E23]"
                        style={{
                          width: `${(boxColors.styles?.shadowIntensity || 0.4) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={boxColors.styles?.shadowIntensity || 0.4}
                    onChange={(e) =>
                      updateStyles({
                        shadowIntensity: Number.parseFloat(e.target.value),
                      })
                    }
                    className="relative h-6 w-full cursor-pointer appearance-none rounded-md bg-transparent transition-all hover:cursor-grab active:cursor-grabbing"
                    style={
                      {
                        "--thumb-size": "12px",
                        "--thumb-color": "#fff",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              <div className="group relative space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-russo text-[8px] font-medium tracking-wider text-[#BFC2CA] uppercase">
                      Opacity
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-russo text-[8px] text-white/70">
                      {(boxColors.styles?.opacity || 0.71).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex w-full items-center px-2">
                    <div className="relative h-[1px] w-full bg-white/[0.06]">
                      <div
                        className="absolute h-full bg-gradient-to-r from-[#32353C] to-[#1C1E23]"
                        style={{
                          width: `${(boxColors.styles?.opacity || 0.71) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={1}
                    step={0.05}
                    value={boxColors.styles?.opacity || 0.71}
                    onChange={(e) =>
                      updateStyles({
                        opacity: Number.parseFloat(e.target.value),
                      })
                    }
                    className="relative h-6 w-full cursor-pointer appearance-none rounded-md bg-transparent transition-all hover:cursor-grab active:cursor-grabbing"
                    style={
                      {
                        "--thumb-size": "12px",
                        "--thumb-color": "#fff",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              {/* Toggle Controls */}
              <div className="flex flex-col gap-2 px-1 py-2">
                <div className="group flex w-full items-center justify-between">
                  <span className="font-russo text-[13px] font-medium tracking-wide text-[#32353C] transition-colors duration-300 group-hover:text-[#545963]">
                    Show Border
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateStyles({
                        showBorder: !boxColors.styles?.showBorder,
                      })
                    }
                    className={cn(
                      "relative h-5 w-10 cursor-pointer rounded-full border transition-all duration-300",
                      "bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
                      boxColors.styles?.showBorder
                        ? [
                            "border-[#1C1E23]",
                            "shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                            "hover:border-white/[0.08] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
                          ]
                        : [
                            "border-[#111215]",
                            "hover:border-[#1C1E23] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                          ]
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-opacity duration-300",
                        boxColors.styles?.showBorder
                          ? "bg-[#1C1E23]"
                          : "bg-[#111215]"
                      )}
                    />
                    <div
                      className={cn(
                        "absolute top-0.5 rounded-full transition-all duration-300 h-4 w-4",
                        "bg-[#32353C] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                        boxColors.styles?.showBorder
                          ? [
                              "translate-x-[1.375rem]",
                              "bg-white/80",
                              "hover:bg-white",
                            ]
                          : ["translate-x-0.5", "hover:bg-[#545963]"]
                      )}
                    />
                  </button>
                </div>
                <div className="group flex w-full items-center justify-between">
                  <span className="font-russo text-[13px] font-medium tracking-wide text-[#32353C] transition-colors duration-300 group-hover:text-[#545963]">
                    Show Price Lines
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateStyles({
                        showLineChart: !boxColors.styles?.showLineChart,
                      })
                    }
                    className={cn(
                      "relative h-5 w-10 cursor-pointer rounded-full border transition-all duration-300",
                      "bg-gradient-to-b from-[#0A0B0D] to-[#070809]",
                      boxColors.styles?.showLineChart
                        ? [
                            "border-[#1C1E23]",
                            "shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                            "hover:border-white/[0.08] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.5)]",
                          ]
                        : [
                            "border-[#111215]",
                            "hover:border-[#1C1E23] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                          ]
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-opacity duration-300",
                        boxColors.styles?.showLineChart
                          ? "bg-[#1C1E23]"
                          : "bg-[#111215]"
                      )}
                    />
                    <div
                      className={cn(
                        "absolute top-0.5 rounded-full transition-all duration-300 h-4 w-4",
                        "bg-[#32353C] shadow-[0_2px_4px_0_rgba(0,0,0,0.4)]",
                        boxColors.styles?.showLineChart
                          ? [
                              "translate-x-[1.375rem]",
                              "bg-white/80",
                              "hover:bg-white",
                            ]
                          : ["translate-x-0.5", "hover:bg-[#545963]"]
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DemoSettingsPanel.displayName = "DemoSettingsPanel";
