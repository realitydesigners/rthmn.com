"use client";

import { useAuth } from "@/providers/SupabaseProvider";
import { useUser } from "@/providers/UserProvider";
import { useWebSocket } from "@/providers/WebsocketProvider";
import type { Box, BoxSlice, OHLC, PairData } from "@/types/types";
import type React from "react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface DashboardContextType {
  pairData: Record<string, PairData>;
  isLoading: boolean;
  isConnected: boolean;
  candlesData: Record<string, any[]>;
  fetchBoxSlice: Record<string, any>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

// Pre-allocate a single reusable box object for updates
const updateBox = { high: 0, low: 0, value: 0 };

// Helper function to create hash from box values
const getBoxHash = (boxes: Box[]): string => {
  return boxes.map((box) => `${box.value},${box.high},${box.low}`).join("|");
};

// Optimized box update calculation using a single shared object
const useBoxUpdater = () => {
  return useCallback((boxes: Box[], price: number): Box[] | null => {
    let hasChanges = false;

    // First pass: check if we need to update anything
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (price > box.high || price < box.low) {
        hasChanges = true;
        break;
      }
    }

    // If no changes needed, return null to indicate no update
    if (!hasChanges) return null;

    // Only create new array if we need to update
    const updatedBoxes = new Array(boxes.length);

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];

      if (price > box.high) {
        updateBox.high = price;
        updateBox.low = price - Math.abs(box.value);
        updateBox.value = Math.abs(box.value);
        // Clone only when needed
        updatedBoxes[i] = { ...updateBox };
      } else if (price < box.low) {
        updateBox.low = price;
        updateBox.high = price + Math.abs(box.value);
        updateBox.value = -Math.abs(box.value);
        // Clone only when needed
        updatedBoxes[i] = { ...updateBox };
      } else {
        // Reuse existing box if no change
        updatedBoxes[i] = box;
      }
    }

    return updatedBoxes;
  }, []);
};

// Optimized OHLC creation
const createOHLC = (price: number): OHLC => ({
  open: price,
  high: price,
  low: price,
  close: price,
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { favorites, isSidebarInitialized } = useUser();
  const [pairData, setPairData] = useState<Record<string, PairData>>({});
  const boxMapRef = useRef<Map<string, Box[]>>(new Map());
  const lastPricesRef = useRef<Map<string, number>>(new Map());
  const boxHashRef = useRef<Map<string, string>>(new Map());
  const { session } = useAuth();
  const {
    isConnected,
    subscribeToBoxSlices,
    unsubscribeFromBoxSlices,
    priceData,
  } = useWebSocket();
  const updateBoxesWithPrice = useBoxUpdater();

  // Memoized states
  const isAuthenticated = useMemo(
    () => !!session?.access_token,
    [session?.access_token]
  );
  const isLoading = useMemo(
    () => !isAuthenticated || !isConnected || !isSidebarInitialized,
    [isAuthenticated, isConnected, isSidebarInitialized]
  );

  // WebSocket subscription effect
  useEffect(() => {
    if (!isConnected || !isAuthenticated || favorites.length === 0) return;

    // Clean up any stale data for pairs that are no longer selected
    const currentPairs = new Set(favorites);
    Array.from(boxMapRef.current.keys()).forEach((pair) => {
      if (!currentPairs.has(pair)) {
        unsubscribeFromBoxSlices(pair);
        boxMapRef.current.delete(pair);
        lastPricesRef.current.delete(pair);
        boxHashRef.current.delete(pair);
        setPairData((prev) => {
          const newData = { ...prev };
          delete newData[pair];
          return newData;
        });
      }
    });

    // Subscribe to all selected pairs, including re-added ones
    favorites.forEach((pair) => {
      // Always resubscribe to ensure fresh data
      unsubscribeFromBoxSlices(pair);
      subscribeToBoxSlices(pair, (wsData: BoxSlice) => {
        setPairData((prev) => {
          // Always use new box data when a pair is re-added
          const isReAdded = !prev[pair] || !boxMapRef.current.has(pair);
          if (isReAdded) {
            boxMapRef.current.set(pair, [...wsData.boxes]);
            lastPricesRef.current.delete(pair); // Clear last price to force update
            return {
              ...prev,
              [pair]: {
                boxes: [wsData],
                currentOHLC: wsData.currentOHLC,
                initialBoxData: wsData,
              },
            };
          }

          // Keep existing box data for continuous updates
          return {
            ...prev,
            [pair]: {
              ...prev[pair],
              currentOHLC: wsData.currentOHLC,
            },
          };
        });
      });
    });

    return () => {
      favorites.forEach((pair) => {
        unsubscribeFromBoxSlices(pair);
      });
    };
  }, [
    isConnected,
    favorites,
    isAuthenticated,
    subscribeToBoxSlices,
    unsubscribeFromBoxSlices,
  ]);

  // Price update effect with optimized batching
  useEffect(() => {
    if (
      !priceData ||
      Object.keys(priceData).length === 0 ||
      favorites.length === 0
    )
      return;

    let frameId: number;
    let lastUpdate = performance.now();
    const MIN_UPDATE_INTERVAL = 16; // ~60fps

    const processUpdates = () => {
      const now = performance.now();
      if (now - lastUpdate < MIN_UPDATE_INTERVAL) {
        frameId = requestAnimationFrame(processUpdates);
        return;
      }

      let hasUpdates = false;
      const updates = new Map<
        string,
        { boxes: Box[]; timestamp: string; price: number }
      >();

      // Batch process updates
      for (const pair of favorites) {
        const data = priceData[pair];
        if (!data?.price) continue;

        // Skip if price hasn't changed
        const lastPrice = lastPricesRef.current.get(pair);
        if (lastPrice === data.price) continue;

        lastPricesRef.current.set(pair, data.price);

        const boxes = boxMapRef.current.get(pair);
        if (!boxes) continue;

        const updatedBoxes = updateBoxesWithPrice(boxes, data.price);
        if (updatedBoxes) {
          // Check if boxes actually changed using hash comparison
          const newHash = getBoxHash(updatedBoxes);
          const oldHash = boxHashRef.current.get(pair);

          if (newHash !== oldHash) {
            boxMapRef.current.set(pair, updatedBoxes);
            boxHashRef.current.set(pair, newHash);
            updates.set(pair, {
              boxes: updatedBoxes,
              timestamp: data.timestamp,
              price: data.price,
            });
            hasUpdates = true;
          }
        }
      }

      if (hasUpdates) {
        setPairData((prev) => {
          const newPairData = { ...prev };
          updates.forEach((update, pair) => {
            if (newPairData[pair]) {
              const ohlc = createOHLC(update.price);
              newPairData[pair] = {
                ...newPairData[pair],
                boxes: [
                  {
                    boxes: update.boxes,
                    timestamp: update.timestamp,
                    currentOHLC: ohlc,
                  },
                ],
                currentOHLC: ohlc,
                initialBoxData: newPairData[pair].initialBoxData,
              };
            }
          });
          return newPairData;
        });
      }

      lastUpdate = now;
      frameId = requestAnimationFrame(processUpdates);
    };

    frameId = requestAnimationFrame(processUpdates);
    return () => cancelAnimationFrame(frameId);
  }, [priceData, favorites, updateBoxesWithPrice]);

  // Memoized context value
  const value = useMemo(
    () => ({
      pairData,
      isLoading,
      isConnected,
      candlesData: {},
      fetchBoxSlice: {},
    }),
    [pairData, isLoading, isConnected]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook with proper error handling
export function useDashboard() {
  const context = use(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
