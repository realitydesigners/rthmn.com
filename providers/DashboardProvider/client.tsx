'use client';

import React, { createContext, useContext, useEffect, useState, useRef, use } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { Box, BoxColors, BoxSlice, PairData } from '@/types/types';
import { DEFAULT_BOX_COLORS, FullPreset, fullPresets, getBoxColors, getSelectedPairs, setBoxColors, setSelectedPairs } from '@/utils/localStorage';

interface DashboardContextType {
    pairData: Record<string, PairData>;
    selectedPairs: string[];
    isLoading: boolean;
    isSidebarInitialized: boolean;
    togglePair: (pair: string) => void;
    isConnected: boolean;
    boxColors: BoxColors;
    updateBoxColors: (colors: BoxColors) => void;
    handleSidebarClick: (e: React.MouseEvent) => void;
    candlesData: Record<string, any[]>;
    DEFAULT_BOX_COLORS: BoxColors;
    fullPresets: FullPreset[];
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
    const router = useRouter();
    const pathname = usePathname();
    const { hasCompletedInitialOnboarding } = useOnboardingStore();
    const [selectedPairs, setSelectedPairsState] = useState<string[]>([]);
    const [boxColorsState, setBoxColorsState] = useState<BoxColors>(DEFAULT_BOX_COLORS);
    const [isSidebarInitialized, setIsSidebarInitialized] = useState(false);
    const [pairData, setPairData] = useState<Record<string, PairData>>({});
    const boxMapRef = useRef<Map<string, Box[]>>(new Map());
    const { session } = useAuth();
    const isAuthenticated = !!session?.access_token;
    const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices, priceData } = useWebSocket();

    // Initialize state and fetch all initial data
    useEffect(() => {
        const initializeData = async () => {
            const storedColors = getBoxColors();
            const storedPairs = getSelectedPairs();
            setBoxColorsState(storedColors);
            setSelectedPairsState(storedPairs);
            setIsSidebarInitialized(true);
        };

        initializeData();
    }, []);

    // Onboarding check
    useEffect(() => {
        if (!pathname || pathname.includes('/onboarding')) return;
        if (pathname === '/signin' || pathname === '/signup' || pathname === '/pricing') return;
        if (!hasCompletedInitialOnboarding()) {
            router.replace('/onboarding');
        }
    }, [pathname, router, hasCompletedInitialOnboarding]);

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

    const togglePair = React.useCallback(
        (pair: string) => {
            const wasSelected = selectedPairs.includes(pair);
            const newSelected = wasSelected ? selectedPairs.filter((p) => p !== pair) : [...selectedPairs, pair];

            setSelectedPairsState(newSelected);
            setSelectedPairs(newSelected);

            if (wasSelected) {
                unsubscribeFromBoxSlices(pair);
                boxMapRef.current.delete(pair);
                setPairData((prev) => {
                    const { [pair]: removed, ...rest } = prev;
                    return rest;
                });
            }
        },
        [selectedPairs, unsubscribeFromBoxSlices]
    );

    const updateBoxColors = React.useCallback((colors: BoxColors) => {
        setBoxColors(colors);
        setBoxColorsState(colors);
    }, []);

    const handleSidebarClick = React.useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.sidebar-toggle') || target.closest('.sidebar-content') || target.closest('.fixed-sidebar')) {
            return;
        }
        window.dispatchEvent(new Event('closeSidebars'));
    }, []);

    return (
        <DashboardContext
            value={{
                pairData,
                selectedPairs,
                isLoading,
                isSidebarInitialized,
                togglePair,
                isConnected,
                boxColors: boxColorsState,
                updateBoxColors,

                handleSidebarClick,
                candlesData: {},
                DEFAULT_BOX_COLORS,
                fullPresets,
                fetchBoxSlice: {},
            }}>
            <div onClick={handleSidebarClick}>{children}</div>
        </DashboardContext>
    );
}
