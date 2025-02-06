'use client';

import React, { createContext, useEffect, useRef, use } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { useUser } from '@/providers/UserProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { Box, BoxSlice, PairData } from '@/types/types';

interface DashboardContextType {
    pairData: Record<string, PairData>;
    isLoading: boolean;
    isConnected: boolean;
    candlesData: Record<string, any[]>;
    fetchBoxSlice: Record<string, any>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
    const context = use(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

export default function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { selectedPairs, isSidebarInitialized } = useUser();
    const [pairData, setPairData] = React.useState<Record<string, PairData>>({});
    const boxMapRef = useRef<Map<string, Box[]>>(new Map());
    const { session } = useAuth();
    const isAuthenticated = !!session?.access_token;
    const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices, priceData } = useWebSocket();

    // Calculate loading state including sidebar initialization
    const isLoading = !isAuthenticated || !isConnected || !isSidebarInitialized;

    // Subscribe to box slices for initial values
    useEffect(() => {
        if (!isConnected || !isAuthenticated || selectedPairs.length === 0) return;

        console.log('Setting up WebSocket subscriptions for pairs:', selectedPairs);

        selectedPairs.forEach((pair) => {
            subscribeToBoxSlices(pair, (wsData: BoxSlice) => {
                console.log(`Received box data for ${pair}:`, wsData);

                setPairData((prev) => {
                    const isFirstMessage = !prev[pair];
                    if (isFirstMessage) {
                        // Store initial box values
                        boxMapRef.current.set(pair, [...wsData.boxes]);

                        return {
                            ...prev,
                            [pair]: {
                                boxes: [wsData],
                                currentOHLC: wsData.currentOHLC,
                                initialBoxData: wsData,
                            },
                        };
                    }
                    return prev;
                });
            });
        });

        return () => {
            console.log('Cleaning up WebSocket subscriptions');
            selectedPairs.forEach((pair) => {
                unsubscribeFromBoxSlices(pair);
                boxMapRef.current.delete(pair);
            });
        };
    }, [isConnected, selectedPairs, isAuthenticated, subscribeToBoxSlices, unsubscribeFromBoxSlices]);

    // Function to update box values based on price
    const updateBoxesWithPrice = (boxes: Box[], price: number): Box[] => {
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
    };

    useEffect(() => {
        if (!priceData || Object.keys(priceData).length === 0 || selectedPairs.length === 0) return;

        // Batch updates to reduce state updates
        const updates: Record<string, { boxes: Box[]; timestamp: string; price: number }> = {};

        // Only process updates for selected pairs
        selectedPairs.forEach((pair) => {
            const data = priceData[pair];
            if (!data?.price) return;

            const boxes = boxMapRef.current.get(pair);
            if (!boxes) return;

            // Update boxes with new price
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
                        newPairData[pair] = {
                            ...newPairData[pair],
                            boxes: [
                                {
                                    boxes,
                                    timestamp,
                                    currentOHLC: {
                                        open: price,
                                        high: price,
                                        low: price,
                                        close: price,
                                    },
                                },
                            ],
                            currentOHLC: {
                                open: price,
                                high: price,
                                low: price,
                                close: price,
                            },
                            initialBoxData: newPairData[pair].initialBoxData,
                        };
                    }
                });
                return newPairData;
            });
        }
    }, [priceData, selectedPairs]);

    return (
        <DashboardContext
            value={{
                pairData,
                isLoading,
                isConnected,
                candlesData: {},
                fetchBoxSlice: {},
            }}>
            {children}
        </DashboardContext>
    );
}
