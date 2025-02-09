'use client';

import React, { createContext, useEffect, useRef, use, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { useUser } from '@/providers/UserProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { Box, BoxSlice, PairData, OHLC } from '@/types/types';

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

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { selectedPairs, isSidebarInitialized } = useUser();
    const [pairData, setPairData] = useState<Record<string, PairData>>({});
    const boxMapRef = useRef<Map<string, Box[]>>(new Map());
    const lastPricesRef = useRef<Map<string, number>>(new Map());
    const { session } = useAuth();
    const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices, priceData } = useWebSocket();
    const updateBoxesWithPrice = useBoxUpdater();

    // Memoized states
    const isAuthenticated = useMemo(() => !!session?.access_token, [session?.access_token]);
    const isLoading = useMemo(() => !isAuthenticated || !isConnected || !isSidebarInitialized, [isAuthenticated, isConnected, isSidebarInitialized]);

    // Optimized box slice subscription handler
    const handleBoxSliceUpdate = useCallback((pair: string, wsData: BoxSlice) => {
        boxMapRef.current.set(pair, wsData.boxes);
        setPairData((prev) => ({
            ...prev,
            [pair]: {
                boxes: [wsData],
                currentOHLC: wsData.currentOHLC,
                initialBoxData: prev[pair]?.initialBoxData || wsData,
            },
        }));
    }, []);

    // WebSocket subscription effect
    useEffect(() => {
        if (!isConnected || !isAuthenticated || selectedPairs.length === 0) return;

        selectedPairs.forEach((pair) => {
            subscribeToBoxSlices(pair, (wsData: BoxSlice) => handleBoxSliceUpdate(pair, wsData));
        });

        return () => {
            selectedPairs.forEach((pair) => {
                unsubscribeFromBoxSlices(pair);
                boxMapRef.current.delete(pair);
                lastPricesRef.current.delete(pair);
            });
        };
    }, [isConnected, selectedPairs, isAuthenticated, subscribeToBoxSlices, unsubscribeFromBoxSlices, handleBoxSliceUpdate]);

    // Price update effect with optimized batching
    useEffect(() => {
        if (!priceData || Object.keys(priceData).length === 0 || selectedPairs.length === 0) return;

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
            const updates = new Map<string, { boxes: Box[]; timestamp: string }>();

            // Batch process updates
            for (const pair of selectedPairs) {
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
                    boxMapRef.current.set(pair, updatedBoxes);
                    updates.set(pair, {
                        boxes: updatedBoxes,
                        timestamp: data.timestamp,
                    });
                    hasUpdates = true;
                }
            }

            if (hasUpdates) {
                setPairData((prev) => {
                    const newPairData = { ...prev };
                    updates.forEach((update, pair) => {
                        if (newPairData[pair]) {
                            newPairData[pair] = {
                                ...newPairData[pair],
                                boxes: [update],
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
    }, [priceData, selectedPairs, updateBoxesWithPrice]);

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

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
    const context = use(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
