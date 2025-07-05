"use client";

import { SignalAlerts } from "@/components/Dashboard/SignalAlerts";
import { ZenMode } from "@/components/Dashboard/ZenMode";
import { useSignals } from "@/hooks/useSignals";
import { useDashboard } from "@/providers/DashboardProvider/client";
import { useUser } from "@/providers/UserProvider";
import { useGridStore } from "@/stores/gridStore";
import { useZenModeControlsStore } from "@/stores/zenModeControlsStore";
import { useZenModeStore } from "@/stores/zenModeStore";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NoInstruments } from "./LoadingSkeleton";
import { PairResoBox } from "./PairResoBox";

// Extend window object for zen mode toggle
declare global {
  interface Window {
    toggleZenMode?: () => void;
  }
}

export default function Dashboard() {
  const { pairData, isLoading } = useDashboard();
  const { favorites, boxColors } = useUser();
  const getGridColumns = useGridStore((state) => state.getGridColumns);
  const currentLayout = useGridStore((state) => state.currentLayout);
  const orderedPairs = useGridStore((state) => state.orderedPairs);
  const reorderPairs = useGridStore((state) => state.reorderPairs);
  const setInitialPairs = useGridStore((state) => state.setInitialPairs);
  const { isZenMode, toggleZenMode, hasBeenAccessed, markAsAccessed } =
    useZenModeStore();
  const { viewMode, focusedIndex, setViewMode, setFocusedIndex } =
    useZenModeControlsStore();
  const [isClient, setIsClient] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(0);

  // Signal alerts - now using real-time subscriptions
  const { signals, newSignals, clearSignalAlert, clearAllAlerts, isConnected } =
    useSignals();

  // Helper function to get active patterns for a specific pair
  const getActivePatternsForPair = (pair: string): number[] => {
    // Get the most recent signal for this pair (no time limits)
    const pairSignals = signals
      .filter((signal) => signal.pair === pair)
      .sort((a, b) => {
        const timeA = new Date(a.created_at || a.start_time).getTime();
        const timeB = new Date(b.created_at || b.start_time).getTime();
        return timeB - timeA; // Most recent first
      });

    // Get pattern from the most recent signal only
    if (pairSignals.length > 0) {
      return pairSignals[0].signal || [];
    }

    return [];
  };

  // Handle window resize and main element width changes
  useEffect(() => {
    const updateWidths = () => {
      setWindowWidth(window.innerWidth);
      const main = document.querySelector("main");
      if (main) {
        setAvailableWidth(main.clientWidth);
      }
    };

    // Initial update
    updateWidths();
    setIsClient(true);

    // Set up ResizeObserver for main element
    const main = document.querySelector("main");
    let observer: ResizeObserver | null = null;

    if (main) {
      observer = new ResizeObserver(updateWidths);
      observer.observe(main);
    }

    // Window resize handler
    window.addEventListener("resize", updateWidths);

    return () => {
      window.removeEventListener("resize", updateWidths);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Initialize ordered pairs from selected pairs
  useEffect(() => {
    setInitialPairs(favorites);
  }, [favorites, setInitialPairs]);

  const handleDragStart = (pair: string) => {
    setDraggedItem(pair);
  };

  const handleDrag = (
    e: MouseEvent | TouchEvent | PointerEvent,
    pair: string
  ) => {
    if (!draggedItem) return;

    const element = e.target as HTMLElement;
    const container = element.closest("[data-pair]");
    if (!container) return;

    const elements = document.querySelectorAll("[data-pair]");
    let closestEl = null;
    let minDistance = Number.POSITIVE_INFINITY;

    elements.forEach((el) => {
      if (el === container) return;

      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Calculate center points
      const elCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const containerCenter = {
        x: containerRect.left + containerRect.width / 2,
        y: containerRect.top + containerRect.height / 2,
      };

      // Calculate distance with more weight on vertical position
      const dx = elCenter.x - containerCenter.x;
      const dy = elCenter.y - containerCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Update closest element if this one is closer
      if (distance < minDistance) {
        minDistance = distance;
        closestEl = el;
      }
    });

    // If we found a close element and it's within a reasonable distance, swap
    if (closestEl && minDistance < 150) {
      const targetPair = closestEl.getAttribute("data-pair");
      if (targetPair && targetPair !== draggedItem) {
        const newOrder = [...orderedPairs];
        const fromIndex = newOrder.indexOf(draggedItem);
        const toIndex = newOrder.indexOf(targetPair);

        // Only reorder if positions are different
        if (fromIndex !== toIndex) {
          newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, draggedItem);
          reorderPairs(newOrder);
        }
      }
    }
  };

  // Create stable reference for pairs to prevent unnecessary re-renders
  const pairsToRender = useMemo(() => {
    return orderedPairs.length > 0 ? orderedPairs : favorites;
  }, [orderedPairs, favorites]);

  // Calculate grid columns based on current layout and available width
  const gridCols = useMemo(() => {
    if (!isClient) return 1;

    // Use the same constants as the store
    const MIN_WIDTH_PER_COLUMN = {
      compact: { 2: 500, 3: 800, 4: 1200 },
      balanced: { 2: 800, 3: 1200 },
    };

    switch (currentLayout) {
      case "compact":
        if (availableWidth >= MIN_WIDTH_PER_COLUMN.compact[4]) return 4;
        if (availableWidth >= MIN_WIDTH_PER_COLUMN.compact[3]) return 3;
        if (availableWidth >= MIN_WIDTH_PER_COLUMN.compact[2]) return 2;
        return 1;
      case "balanced":
      default:
        if (availableWidth >= MIN_WIDTH_PER_COLUMN.balanced[3]) return 3;
        if (availableWidth >= MIN_WIDTH_PER_COLUMN.balanced[2]) return 2;
        return 1;
    }
  }, [isClient, availableWidth, currentLayout]);

  // Handle zen mode toggle - simplified since ZenMode handles its own transitions
  const handleZenModeToggle = useCallback(() => {
    toggleZenMode();
  }, [toggleZenMode]);

  // Zen Mode toggle function (will be accessible from sidebar)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.toggleZenMode = handleZenModeToggle;
    }
  }, [handleZenModeToggle]);

  // Mark zen mode as accessed when dashboard loads
  useEffect(() => {
    if (!hasBeenAccessed && isClient) {
      markAsAccessed();
    }
  }, [hasBeenAccessed, isClient, markAsAccessed]);

  return (
    <>
      {isZenMode && (
        <div className="fixed top-14 left-0 right-0 bottom-0 z-[0] bg-black">
          <ZenMode
            pairData={pairData}
            orderedPairs={pairsToRender}
            boxColors={boxColors}
            isLoading={isLoading}
            isVisible={isZenMode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
          />
        </div>
      )}

      {/* <SignalAlerts
        newSignals={newSignals}
        onClearSignal={clearSignalAlert}
        onClearAll={clearAllAlerts}
      /> */}

      {!isZenMode && (
        <div className="w-full px-2 pb-24 lg:pb-2 pt-14 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div
            className="grid w-full gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {isClient &&
              pairsToRender.map((pair) => {
                const data = pairData[pair];
                return (
                  <motion.div
                    key={pair}
                    initial={false}
                    layout="position"
                    dragSnapToOrigin
                    onDragStart={() => handleDragStart(pair)}
                    onDrag={(e) => handleDrag(e, pair)}
                    onDragEnd={() => setDraggedItem(null)}
                    whileDrag={{
                      zIndex: 1,
                    }}
                    className="relative cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    <div data-pair={pair}>
                      <PairResoBox
                        pair={pair}
                        boxSlice={data?.boxes?.[0]}
                        boxColors={boxColors}
                        isLoading={isLoading}
                        activePatterns={getActivePatternsForPair(pair)}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
}
