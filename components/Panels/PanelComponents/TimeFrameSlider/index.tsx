"use client";

import { useTimeframeStore } from "@/stores/timeframeStore";
import type { Box } from "@/types/types";
import { cn } from "@/utils/cn";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuLayoutGrid } from "react-icons/lu";
import { PanelSection } from "../PanelSection";

const TIME_INTERVALS = [
  { label: "1D", minutes: 1440 },
  { label: "18H", minutes: 1080 },
  { label: "12H", minutes: 720 },
  { label: "8H", minutes: 480 },
  { label: "6H", minutes: 360 },
  { label: "4H", minutes: 240 },
  { label: "2H", minutes: 120 },
  { label: "1H", minutes: 60 },
  { label: "30m", minutes: 30 },
  { label: "15m", minutes: 15 },
  { label: "5m", minutes: 5 },
  { label: "1m", minutes: 1 },
];

interface TimeFrameSliderProps {
  showPanel?: boolean;
  global?: boolean;
  pair?: string;
}

const TimeFrameSliderContent = memo(
  ({
    startIndex,
    maxBoxCount,
    boxes = [],
    onStyleChange,
    onDragStart,
    onDragEnd,
  }: Omit<Required<TimeFrameSliderProps>, "showPanel" | "global" | "pair"> & {
    startIndex: number;
    maxBoxCount: number;
    boxes: Box[];
    onStyleChange: (property: string, value: number | boolean) => void;
    onDragStart?: (type: "left" | "right" | "position") => void;
    onDragEnd?: () => void;
  }) => {
    const barContainerRef = useRef<HTMLDivElement>(null);
    const edgeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateRef = useRef<{ startIndex: number; maxBoxCount: number }>({
      startIndex,
      maxBoxCount,
    });
    const [containerWidth, setContainerWidth] = useState(0);

    const [dragState, setDragState] = useState<{
      isDragging: boolean;
      dragType: "left" | "right" | "position" | null;
    }>({
      isDragging: false,
      dragType: null,
    });

    // Update lastUpdateRef when props change
    useEffect(() => {
      lastUpdateRef.current = { startIndex, maxBoxCount };
    }, [startIndex, maxBoxCount]);

    // Clear timeouts on unmount
    useEffect(() => {
      return () => {
        if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        window.removeEventListener("mousemove", handleGlobalMouseMove);
      };
    }, []);

    // Add resize observer to track container width
    useEffect(() => {
      if (!barContainerRef.current) return;

      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width);
        }
      });

      observer.observe(barContainerRef.current);
      return () => observer.disconnect();
    }, []);

    // Convert to reversed index for calculations
    const reversedStartIndex = useMemo(
      () => 37 - (startIndex + maxBoxCount - 1),
      [startIndex, maxBoxCount]
    );
    const reversedMaxBoxCount = maxBoxCount;

    // Memoize style calculations
    const selectionStyle = useMemo(
      () => ({
        transform: `translateX(${(reversedStartIndex / 38) * 100}%) scaleX(${reversedMaxBoxCount / 38})`,
        transformOrigin: "left",
        width: "100%",
      }),
      [reversedStartIndex, reversedMaxBoxCount]
    );

    // Global mouse move handler for tracking position after drag
    const handleGlobalMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!barContainerRef.current || !edgeTimeoutRef.current) return;

        const rect = barContainerRef.current.getBoundingClientRect();
        const isNearSlider =
          e.clientX >= rect.left - 40 &&
          e.clientX <= rect.right + 40 &&
          e.clientY >= rect.top - 40 &&
          e.clientY <= rect.bottom + 40;

        if (!isNearSlider) {
          // Mouse moved far from slider, trigger reset
          if (edgeTimeoutRef.current) {
            clearTimeout(edgeTimeoutRef.current);
            edgeTimeoutRef.current = null;
          }
          onDragEnd?.();
          window.removeEventListener("mousemove", handleGlobalMouseMove);
        }
      },
      [onDragEnd]
    );

    const handleMouseDown = useCallback(
      (e: React.MouseEvent, type: "left" | "right" | "position") => {
        e.preventDefault();
        e.stopPropagation();

        if (!barContainerRef.current) return;

        // Clear any existing timeouts
        if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        edgeTimeoutRef.current = null;
        resetTimeoutRef.current = null;

        // Remove any existing global mouse move listener
        window.removeEventListener("mousemove", handleGlobalMouseMove);

        onDragStart?.(type);

        const rect = barContainerRef.current.getBoundingClientRect();
        const barWidth = rect.width / 38;
        const startX = e.clientX;
        const previousIndex =
          type === "left"
            ? reversedStartIndex
            : type === "right"
              ? reversedMaxBoxCount
              : reversedStartIndex;

        const handleDragMouseMove = (e: MouseEvent) => {
          if (!barContainerRef.current) return;

          const totalDeltaX = e.clientX - startX;
          const newIndex = Math.round(totalDeltaX / barWidth);

          if (newIndex === 0) return;

          requestAnimationFrame(() => {
            const updates: { startIndex?: number; maxBoxCount?: number } = {};

            switch (type) {
              case "left": {
                const newReversedStartIndex = Math.max(
                  0,
                  Math.min(36, previousIndex + newIndex)
                );
                const newMaxBoxCount = Math.max(
                  1,
                  Math.min(
                    38 - newReversedStartIndex,
                    reversedMaxBoxCount +
                      (previousIndex - newReversedStartIndex)
                  )
                );
                const newStartIndex = Math.min(
                  37 - (newReversedStartIndex + newMaxBoxCount - 1),
                  36
                );

                if (newStartIndex !== lastUpdateRef.current.startIndex) {
                  updates.startIndex = newStartIndex;
                }
                if (newMaxBoxCount !== lastUpdateRef.current.maxBoxCount) {
                  updates.maxBoxCount = newMaxBoxCount;
                }
                break;
              }
              case "right": {
                const proposedMaxBoxCount = previousIndex + newIndex;
                const newMaxBoxCount = Math.max(
                  1,
                  Math.min(proposedMaxBoxCount, 38 - reversedStartIndex)
                );
                const newStartIndex =
                  37 - (reversedStartIndex + newMaxBoxCount - 1);

                if (
                  newMaxBoxCount !== lastUpdateRef.current.maxBoxCount &&
                  newMaxBoxCount >= 1 &&
                  newStartIndex >= 0
                ) {
                  updates.maxBoxCount = newMaxBoxCount;
                  updates.startIndex = newStartIndex;
                }
                break;
              }
              case "position": {
                const newReversedStartIndex = Math.max(
                  0,
                  Math.min(previousIndex + newIndex, 38 - reversedMaxBoxCount)
                );
                const newStartIndex =
                  37 - (newReversedStartIndex + reversedMaxBoxCount - 1);

                if (newStartIndex !== lastUpdateRef.current.startIndex) {
                  updates.startIndex = newStartIndex;
                }
                break;
              }
            }

            // Only update if there are changes
            if (Object.keys(updates).length > 0) {
              for (const [key, value] of Object.entries(updates)) {
                onStyleChange(key, value);
              }
              lastUpdateRef.current = {
                startIndex:
                  updates.startIndex ?? lastUpdateRef.current.startIndex,
                maxBoxCount:
                  updates.maxBoxCount ?? lastUpdateRef.current.maxBoxCount,
              };
            }
          });
        };

        const handleDragMouseUp = () => {
          setDragState({ isDragging: false, dragType: null });
          window.removeEventListener("mousemove", handleDragMouseMove);
          window.removeEventListener("mouseup", handleDragMouseUp);

          if (type === "left" || type === "right") {
            // Start tracking global mouse movement
            window.addEventListener("mousemove", handleGlobalMouseMove);

            // Set a longer timeout for eventual reset
            resetTimeoutRef.current = setTimeout(() => {
              if (edgeTimeoutRef.current) {
                clearTimeout(edgeTimeoutRef.current);
                edgeTimeoutRef.current = null;
              }
              onDragEnd?.();
              window.removeEventListener("mousemove", handleGlobalMouseMove);
            }, 2000); // 2 second inactivity timeout
          } else {
            // For position drags, reset immediately
            onDragEnd?.();
          }
        };

        window.addEventListener("mousemove", handleDragMouseMove);
        window.addEventListener("mouseup", handleDragMouseUp);
        setDragState({ isDragging: true, dragType: type });
      },
      [
        reversedStartIndex,
        reversedMaxBoxCount,
        onStyleChange,
        onDragStart,
        onDragEnd,
        handleGlobalMouseMove,
      ]
    );

    const handleTouchStart = useCallback(
      (e: React.TouchEvent, type: "left" | "right" | "position") => {
        e.preventDefault();
        e.stopPropagation();

        if (!barContainerRef.current) return;

        // Clear any existing timeouts
        if (edgeTimeoutRef.current) clearTimeout(edgeTimeoutRef.current);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        edgeTimeoutRef.current = null;
        resetTimeoutRef.current = null;

        // Remove any existing global mouse move listener
        window.removeEventListener("mousemove", handleGlobalMouseMove);

        onDragStart?.(type);

        const rect = barContainerRef.current.getBoundingClientRect();
        const barWidth = rect.width / 38;
        const touch = e.touches[0];
        const startX = touch.clientX;
        const previousIndex =
          type === "left"
            ? reversedStartIndex
            : type === "right"
              ? reversedMaxBoxCount
              : reversedStartIndex;

        const handleTouchMove = (e: TouchEvent) => {
          if (!barContainerRef.current) return;
          e.preventDefault();

          const touch = e.touches[0];
          const totalDeltaX = touch.clientX - startX;
          const newIndex = Math.round(totalDeltaX / barWidth);

          if (newIndex === 0) return;

          requestAnimationFrame(() => {
            const updates: { startIndex?: number; maxBoxCount?: number } = {};

            switch (type) {
              case "left": {
                const newReversedStartIndex = Math.max(
                  0,
                  Math.min(36, previousIndex + newIndex)
                );
                const newMaxBoxCount = Math.max(
                  1,
                  Math.min(
                    38 - newReversedStartIndex,
                    reversedMaxBoxCount +
                      (previousIndex - newReversedStartIndex)
                  )
                );
                const newStartIndex = Math.min(
                  37 - (newReversedStartIndex + newMaxBoxCount - 1),
                  36
                );

                if (newStartIndex !== lastUpdateRef.current.startIndex) {
                  updates.startIndex = newStartIndex;
                }
                if (newMaxBoxCount !== lastUpdateRef.current.maxBoxCount) {
                  updates.maxBoxCount = newMaxBoxCount;
                }
                break;
              }
              case "right": {
                const proposedMaxBoxCount = previousIndex + newIndex;
                const newMaxBoxCount = Math.max(
                  1,
                  Math.min(proposedMaxBoxCount, 38 - reversedStartIndex)
                );
                const newStartIndex =
                  37 - (reversedStartIndex + newMaxBoxCount - 1);

                if (
                  newMaxBoxCount !== lastUpdateRef.current.maxBoxCount &&
                  newMaxBoxCount >= 1 &&
                  newStartIndex >= 0
                ) {
                  updates.maxBoxCount = newMaxBoxCount;
                  updates.startIndex = newStartIndex;
                }
                break;
              }
              case "position": {
                const newReversedStartIndex = Math.max(
                  0,
                  Math.min(previousIndex + newIndex, 38 - reversedMaxBoxCount)
                );
                const newStartIndex =
                  37 - (newReversedStartIndex + reversedMaxBoxCount - 1);

                if (newStartIndex !== lastUpdateRef.current.startIndex) {
                  updates.startIndex = newStartIndex;
                }
                break;
              }
            }

            if (Object.keys(updates).length > 0) {
              for (const [key, value] of Object.entries(updates)) {
                onStyleChange(key, value);
              }
              lastUpdateRef.current = {
                startIndex:
                  updates.startIndex ?? lastUpdateRef.current.startIndex,
                maxBoxCount:
                  updates.maxBoxCount ?? lastUpdateRef.current.maxBoxCount,
              };
            }
          });
        };

        const handleTouchEnd = () => {
          setDragState({ isDragging: false, dragType: null });
          window.removeEventListener("touchmove", handleTouchMove);
          window.removeEventListener("touchend", handleTouchEnd);
          window.removeEventListener("touchcancel", handleTouchEnd);
          onDragEnd?.();
        };

        window.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        window.addEventListener("touchend", handleTouchEnd);
        window.addEventListener("touchcancel", handleTouchEnd);
        setDragState({ isDragging: true, dragType: type });
      },
      [
        reversedStartIndex,
        reversedMaxBoxCount,
        onStyleChange,
        onDragStart,
        onDragEnd,
        handleGlobalMouseMove,
      ]
    );

    // Get time label for a given index
    const getTimeLabel = useCallback((index: number) => {
      const minutes = Math.max(
        1,
        Math.min(1440, Math.round(((38 - index) / 38) * 1440))
      );
      return (
        TIME_INTERVALS.find((interval) => minutes >= interval.minutes) || {
          label: "1m",
          minutes: 1,
        }
      );
    }, []);

    // Calculate which intervals to show based on container width
    const visibleIntervals = useMemo(() => {
      if (containerWidth < 200) {
        // Very small: show only 1D, 1H, 1m
        return TIME_INTERVALS.filter((interval) =>
          [1440, 60, 1].includes(interval.minutes)
        );
      } else if (containerWidth < 300) {
        // Small: show 1D, 12H, 4H, 1H, 15m, 1m
        return TIME_INTERVALS.filter((interval) =>
          [1440, 720, 240, 60, 15, 1].includes(interval.minutes)
        );
      } else if (containerWidth < 400) {
        // Medium: show most intervals
        return TIME_INTERVALS.filter((interval) =>
          [1440, 720, 360, 240, 120, 60, 30, 15, 5, 1].includes(
            interval.minutes
          )
        );
      }
      // Large: show all intervals
      return TIME_INTERVALS;
    }, [containerWidth]);

    // Enhanced edge handles with more prominent visual feedback and larger touch targets
    const renderEdgeHandles = useMemo(() => {
      return (
        <>
          <div
            className="group/left pointer-events-auto absolute -inset-y-6 -left-4 z-10 w-8 cursor-ew-resize will-change-transform"
            onMouseDown={(e) => handleMouseDown(e, "left")}
            onTouchStart={(e) => handleTouchStart(e, "left")}
          >
            {/* Main handle line with enhanced hover and active states */}
            <div className="absolute inset-y-6 right-[16px] w-[3px] bg-gradient-to-b from-white/80 via-white/60 to-white/80 shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-200 group-hover/left:w-[4px] group-hover/left:from-white/95 group-hover/left:via-white/80 group-hover/left:to-white/95 group-hover/left:shadow-[0_0_30px_rgba(255,255,255,0.8)] group-active/left:w-[5px] group-active/left:from-white group-active/left:via-white/90 group-active/left:to-white group-active/left:shadow-[0_0_40px_rgba(255,255,255,0.9)]" />

            {/* Enhanced glow effect */}
            <div className="absolute inset-y-6 right-[15px] w-[4px] bg-gradient-to-r from-white/0 to-[#32353C] opacity-0 transition-all duration-200 group-hover/left:opacity-100 group-hover/left:w-[6px] group-active/left:w-[8px] group-active/left:opacity-100" />

            {/* Additional hover indicator */}
            <div className="absolute inset-y-6 right-[18px] w-[8px] bg-gradient-to-r from-white/0 to-white/10 opacity-0 blur-[2px] transition-all duration-200 group-hover/left:opacity-100 group-active/left:opacity-100 group-active/left:to-white/20" />
          </div>

          <div
            className="group/right pointer-events-auto absolute -inset-y-6 -right-4 z-10 w-8 cursor-ew-resize will-change-transform"
            onMouseDown={(e) => handleMouseDown(e, "right")}
            onTouchStart={(e) => handleTouchStart(e, "right")}
          >
            {/* Main handle line with enhanced hover and active states */}
            <div className="absolute inset-y-6 left-[16px] w-[3px] bg-gradient-to-b from-white/80 via-white/60 to-white/80 shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-200 group-hover/right:w-[4px] group-hover/right:from-white/95 group-hover/right:via-white/80 group-hover/right:to-white/95 group-hover/right:shadow-[0_0_30px_rgba(255,255,255,0.8)] group-active/right:w-[5px] group-active/right:from-white group-active/right:via-white/90 group-active/right:to-white group-active/right:shadow-[0_0_40px_rgba(255,255,255,0.9)]" />

            {/* Enhanced glow effect */}
            <div className="absolute inset-y-6 left-[15px] w-[4px] bg-gradient-to-l from-white/0 to-[#32353C] opacity-0 transition-all duration-200 group-hover/right:opacity-100 group-hover/right:w-[6px] group-active/right:w-[8px] group-active/right:opacity-100" />

            {/* Additional hover indicator */}
            <div className="absolute inset-y-6 left-[18px] w-[8px] bg-gradient-to-l from-white/0 to-white/10 opacity-0 blur-[2px] transition-all duration-200 group-hover/right:opacity-100 group-active/right:opacity-100 group-active/right:to-white/20" />
          </div>
        </>
      );
    }, [handleMouseDown, handleTouchStart]);

    return (
      <div className="relative h-full px-[7px] pb-4">
        {/* Main slider container */}
        <div
          ref={barContainerRef}
          className="group/bars relative flex h-8 items-center touch-none"
        >
          {/* Base layer with diagonal lines pattern */}
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

          {/* Base layer with enhanced ambient effects */}
          <div className="absolute inset-0 bg-[#070809] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.3)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

          {/* Selection area with enhanced gradients */}
          <div
            className="absolute h-full bg-gradient-to-b from-[#0A0B0D] to-[#070809] shadow-[inset_0_0_30px_rgba(255,255,255,0.05),0_0_15px_rgba(0,0,0,0.8)] will-change-transform"
            style={selectionStyle}
          >
            {/* Enhanced inner glow effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,rgba(255,255,255,0.08),transparent_100%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-[#111215]" />
            </div>

            {/* Refined edges */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#1C1E23] to-transparent" />
            <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/30 via-[#32353C] to-[#1C1E23]" />
            <div className="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-white/30 via-[#32353C] to-[#1C1E23]" />

            {/* Additional subtle inner shadow */}
            <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.2)]" />
          </div>

          {/* Invisible click/touch handlers with larger touch targets */}
          <div className="relative flex h-full w-full">
            {Array.from({ length: 38 }).map((_, i) => {
              const timeInfo = getTimeLabel(i);
              return (
                <div
                  key={`slider-element-${i}-${timeInfo.minutes}min`}
                  className="flex h-full flex-1 items-center"
                  onMouseDown={(e) => {
                    const reversedI = i;
                    const isSelected =
                      reversedI >= reversedStartIndex &&
                      reversedI < reversedStartIndex + reversedMaxBoxCount;
                    const isNearLeftEdge =
                      Math.abs(reversedI - reversedStartIndex) <= 1;
                    const isNearRightEdge =
                      Math.abs(
                        reversedI -
                          (reversedStartIndex + reversedMaxBoxCount - 1)
                      ) <= 1;

                    if (isSelected) {
                      handleMouseDown(e, "position");
                    } else if (isNearLeftEdge) {
                      handleMouseDown(e, "left");
                    } else if (isNearRightEdge) {
                      handleMouseDown(e, "right");
                    }
                  }}
                  onTouchStart={(e) => {
                    const reversedI = i;
                    const isSelected =
                      reversedI >= reversedStartIndex &&
                      reversedI < reversedStartIndex + reversedMaxBoxCount;
                    const isNearLeftEdge =
                      Math.abs(reversedI - reversedStartIndex) <= 1;
                    const isNearRightEdge =
                      Math.abs(
                        reversedI -
                          (reversedStartIndex + reversedMaxBoxCount - 1)
                      ) <= 1;

                    if (isSelected) {
                      handleTouchStart(e, "position");
                    } else if (isNearLeftEdge) {
                      handleTouchStart(e, "left");
                    } else if (isNearRightEdge) {
                      handleTouchStart(e, "right");
                    }
                  }}
                />
              );
            })}
          </div>

          {/* Edge handles container with enhanced active state */}
          <div
            className="pointer-events-none absolute inset-y-0 z-0 will-change-transform transition-[filter] duration-200 [&:has(*:active)]:brightness-110"
            style={selectionStyle}
          >
            {renderEdgeHandles}
          </div>
        </div>

        {/* Dynamic time intervals scale */}
        <div className="mt-2 w-full">
          <div className="flex w-full justify-between px-0">
            {TIME_INTERVALS.map((interval, i) => {
              // Always show full range of labels
              const position = (i / (TIME_INTERVALS.length - 1)) * 37;
              const isInRange =
                position >= reversedStartIndex &&
                position <= reversedStartIndex + reversedMaxBoxCount;

              return (
                <div
                  key={interval.label}
                  className="flex flex-col items-center"
                >
                  <div
                    className={cn(
                      "h-3 w-[1px] will-change-transform transition-all duration-200",
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
  }
);

export const TimeFrameSlider = memo(
  ({ showPanel = true, global = false, pair }: TimeFrameSliderProps) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Get global state if needed
    const globalSettings = useTimeframeStore((state) => state.global.settings);
    const updateGlobalSettings = useTimeframeStore(
      (state) => state.updateGlobalSettings
    );
    const startGlobalDrag = useTimeframeStore((state) => state.startGlobalDrag);
    const endGlobalDrag = useTimeframeStore((state) => state.endGlobalDrag);

    // Get pair-specific state if needed
    const pairSettings = useTimeframeStore(
      useCallback(
        (state) => (pair ? state.getSettingsForPair(pair) : null),
        [pair]
      )
    );
    const updatePairSettings = useTimeframeStore(
      (state) => state.updatePairSettings
    );
    const initializePair = useTimeframeStore((state) => state.initializePair);

    // Initialize pair settings when component mounts
    useEffect(() => {
      if (pair) {
        initializePair(pair);
      }
    }, [pair, initializePair]);

    // Determine which props to use based on global flag and pair
    const contentProps = global
      ? {
          startIndex: globalSettings.startIndex,
          maxBoxCount: globalSettings.maxBoxCount,
          boxes: [], // Global mode doesn't need boxes
          onStyleChange: (property: string, value: number | boolean) => {
            updateGlobalSettings({ [property]: value });
          },
          onDragStart: startGlobalDrag,
          onDragEnd: endGlobalDrag,
        }
      : pair && pairSettings
        ? {
            startIndex: pairSettings.startIndex,
            maxBoxCount: pairSettings.maxBoxCount,
            boxes: [], // We'll handle boxes in the parent component
            onStyleChange: (property: string, value: number | boolean) => {
              updatePairSettings(pair, { [property]: value });
            },
            onDragStart: startGlobalDrag, // We can reuse these for visual feedback
            onDragEnd: endGlobalDrag,
          }
        : {
            startIndex: 0,
            maxBoxCount: 1,
            boxes: [],
            onStyleChange: () => {},
          };

    if (!showPanel) {
      return <TimeFrameSliderContent {...contentProps} />;
    }

    return (
      <PanelSection
        title="Timeframe"
        icon={LuLayoutGrid}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-2">
          <TimeFrameSliderContent {...contentProps} />
        </div>
      </PanelSection>
    );
  }
);

TimeFrameSlider.displayName = "TimeFrameSlider";
TimeFrameSliderContent.displayName = "TimeFrameSliderContent";
