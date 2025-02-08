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

// Optimized box update calculation
const useBoxUpdater = () => {
    return useCallback((boxes: Box[], price: number): Box[] => {
        return boxes.map((box) => {
            const newBox = { ...box };
            if (price > box.high) {
                newBox.high = price;
                newBox.low = price - Math.abs(box.value);
                if (box.value < 0) {
                    newBox.value = Math.abs(box.value);
                }
            } else if (price < box.low) {
                newBox.low = price;
                newBox.high = price + Math.abs(box.value);
                if (box.value > 0) {
                    newBox.value = -Math.abs(box.value);
                }
            }
            return newBox;
        });
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
    const { selectedPairs, isSidebarInitialized } = useUser();
    const [pairData, setPairData] = useState<Record<string, PairData>>({});
    const boxMapRef = useRef<Map<string, Box[]>>(new Map());
    const { session } = useAuth();
    const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices, priceData } = useWebSocket();
    const updateBoxesWithPrice = useBoxUpdater();

    // Memoized authentication state
    const isAuthenticated = useMemo(() => !!session?.access_token, [session?.access_token]);

    // Memoized loading state
    const isLoading = useMemo(() => !isAuthenticated || !isConnected || !isSidebarInitialized, [isAuthenticated, isConnected, isSidebarInitialized]);

    // Optimized box slice subscription handler
    const handleBoxSliceUpdate = useCallback((pair: string, wsData: BoxSlice) => {
        console.log(`Received box data for ${pair}:`, wsData);

        setPairData((prev) => {
            // Store box values
            boxMapRef.current.set(pair, [...wsData.boxes]);

            return {
                ...prev,
                [pair]: {
                    boxes: [wsData],
                    currentOHLC: wsData.currentOHLC,
                    initialBoxData: prev[pair]?.initialBoxData || wsData,
                },
            };
        });
    }, []);

    // WebSocket subscription effect
    useEffect(() => {
        if (!isConnected || !isAuthenticated || selectedPairs.length === 0) return;

        console.log('Setting up WebSocket subscriptions for pairs:', selectedPairs);

        selectedPairs.forEach((pair) => {
            subscribeToBoxSlices(pair, (wsData: BoxSlice) => handleBoxSliceUpdate(pair, wsData));
        });

        return () => {
            console.log('Cleaning up WebSocket subscriptions');
            selectedPairs.forEach((pair) => {
                unsubscribeFromBoxSlices(pair);
                boxMapRef.current.delete(pair);
            });
        };
    }, [isConnected, selectedPairs, isAuthenticated, subscribeToBoxSlices, unsubscribeFromBoxSlices, handleBoxSliceUpdate]);

    // Price update effect with batch processing
    useEffect(() => {
        if (!priceData || Object.keys(priceData).length === 0 || selectedPairs.length === 0) return;

        // Use requestAnimationFrame for smooth updates
        const rafId = requestAnimationFrame(() => {
            // Batch updates to reduce state updates
            const updates: Record<string, { boxes: Box[]; timestamp: string; price: number }> = {};

            // Only process updates for selected pairs
            selectedPairs.forEach((pair) => {
                const data = priceData[pair];
                if (!data?.price) return;

                const boxes = boxMapRef.current.get(pair);
                if (!boxes) return;

                const updatedBoxes = updateBoxesWithPrice(boxes, data.price);
                boxMapRef.current.set(pair, updatedBoxes);
                updates[pair] = { boxes: updatedBoxes, timestamp: data.timestamp, price: data.price };
            });

            // Only update state if we have updates
            if (Object.keys(updates).length > 0) {
                setPairData((prev) => {
                    const newPairData = { ...prev };
                    Object.entries(updates).forEach(([pair, { boxes, timestamp, price }]) => {
                        if (newPairData[pair]) {
                            const ohlc = createOHLC(price);
                            newPairData[pair] = {
                                ...newPairData[pair],
                                boxes: [{ boxes, timestamp, currentOHLC: ohlc }],
                                currentOHLC: ohlc,
                                initialBoxData: newPairData[pair].initialBoxData,
                            };
                        }
                    });
                    return newPairData;
                });
            }
        });

        return () => cancelAnimationFrame(rafId);
    }, [priceData, selectedPairs, updateBoxesWithPrice]);

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

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

// Custom hook with proper error handling
export function useDashboard() {
    const context = use(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
