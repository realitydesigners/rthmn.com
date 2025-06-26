"use client";

import { useDashboard } from "@/providers/DashboardProvider/client";
import { useUser } from "@/providers/UserProvider";
import { useGridStore } from "@/stores/gridStore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NoInstruments } from "./LoadingSkeleton";
import { PairResoBox } from "./PairResoBox";
import { ZenMode } from "@/components/Dashboard/ZenMode";

// Extend window object for zen mode toggle
declare global {
  interface Window {
    toggleZenMode?: () => void;
  }
}

export default function Dashboard() {
  const { pairData, isLoading } = useDashboard();
  const { selectedPairs, boxColors } = useUser();
  const getGridColumns = useGridStore((state) => state.getGridColumns);
  const currentLayout = useGridStore((state) => state.currentLayout);
  const orderedPairs = useGridStore((state) => state.orderedPairs);
  const reorderPairs = useGridStore((state) => state.reorderPairs);
  const setInitialPairs = useGridStore((state) => state.setInitialPairs);
  const [isClient, setIsClient] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);

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

  // Debug effect to monitor layout changes
  useEffect(() => {
    // console.log('Current layout:', currentLayout);
    // console.log('Window width:', windowWidth);
    // console.log('Available width:', availableWidth);
    // console.log('Grid columns:', getGridColumns(availableWidth));
  }, [currentLayout, windowWidth, availableWidth, getGridColumns]);

  // Initialize ordered pairs from selected pairs
  useEffect(() => {
    setInitialPairs(selectedPairs);
  }, [selectedPairs, setInitialPairs]);

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

  if (!selectedPairs.length && !isLoading) {
    return (
      <div className="w-full px-2 sm:px-4">
        <NoInstruments />
        <div className="mt-4 text-center text-sm primary-text">
          Please complete the onboarding process to select your trading pairs.
        </div>
      </div>
    );
  }

  // Render based on orderedPairs once available, or selectedPairs initially
  const pairsToRender = orderedPairs.length > 0 ? orderedPairs : selectedPairs;

  // Only use client-side width calculation after hydration
  const gridCols = !isClient ? 1 : getGridColumns(availableWidth);

  // Zen Mode toggle function (will be accessible from sidebar)
  window.toggleZenMode = () => {
    setIsZenMode(!isZenMode);
  };

  // Zen Mode View
  if (isZenMode) {
    return (
      <div className=" w-full h-screen">
        <ZenMode
          pairData={pairData}
          orderedPairs={pairsToRender}
          boxColors={boxColors}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="w-full px-2 pb-24 lg:pb-2 pt-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                dragElastic={0.1}
                dragTransition={{
                  bounceStiffness: 300,
                  bounceDamping: 20,
                }}
                onDragStart={() => handleDragStart(pair)}
                onDrag={(e) => handleDrag(e, pair)}
                onDragEnd={() => setDraggedItem(null)}
                whileDrag={{
                  zIndex: 1,
                }}
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 250,
                    damping: 20,
                  },
                }}
                className="relative cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div data-pair={pair}>
                  <PairResoBox
                    pair={pair}
                    boxSlice={data?.boxes?.[0]}
                    boxColors={boxColors}
                    isLoading={isLoading}
                  />
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
