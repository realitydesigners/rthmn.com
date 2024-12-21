'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { BoxSlice, PairData, OHLC } from '@/types/types';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useAuth } from '@/providers/SupabaseProvider';
import { BoxColors, getBoxColors, setBoxColors, getSelectedPairs, setSelectedPairs, DEFAULT_BOX_COLORS } from '@/utils/localStorage';
import { useQueries, useQueryClient } from '@tanstack/react-query';

interface DashboardContextType {
    pairData: Record<string, PairData>;
    selectedPairs: string[];
    isLoading: boolean;
    togglePair: (pair: string) => void;
    isConnected: boolean;
    boxColors: BoxColors;
    updateBoxColors: (colors: BoxColors) => void;
    isAuthenticated: boolean;
    handleSidebarClick: (e: React.MouseEvent) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

export const AVAILABLE_PAIRS = [...FOREX_PAIRS, ...CRYPTO_PAIRS] as const;

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [boxColorsState, setBoxColorsState] = useState<BoxColors>(DEFAULT_BOX_COLORS);

    const { session } = useAuth();
    const isAuthenticated = !!session?.access_token;

    const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices } = useWebSocket();

    // Initialize state from localStorage after mount
    useEffect(() => {
        const storedColors = getBoxColors();
        const storedPairs = getSelectedPairs();
        setBoxColorsState(storedColors);
        setSelectedPairs(storedPairs);
    }, []);

    // Load selected pairs from localStorage
    useEffect(() => {
        if (!isAuthenticated) return;
        const stored = getSelectedPairs();
        const initialPairs = stored.length > 0 ? stored : ['GBPUSD', 'USDJPY', 'AUDUSD'];
        setSelectedPairs(initialPairs);
        if (stored.length === 0) {
            setSelectedPairs(initialPairs);
        }
        setIsLoading(false);
    }, [isAuthenticated]);

    // Single query for all pair data instead of individual queries
    const pairDataQuery = useQueries({
        queries: [
            {
                queryKey: ['allPairData'],
                queryFn: () => {
                    const existingData = queryClient.getQueryData(['allPairData']) as Record<string, PairData>;
                    return (
                        existingData ||
                        selectedPairs.reduce(
                            (acc, pair) => ({
                                ...acc,
                                [pair]: {
                                    boxes: [],
                                    currentOHLC: { open: 0, high: 0, low: 0, close: 0 },
                                },
                            }),
                            {}
                        )
                    );
                },
                enabled: isConnected && isAuthenticated,
                staleTime: Infinity,
                gcTime: Infinity,
                refetchInterval: 0 as const,
            },
        ],
    })[0];

    // WebSocket subscription management - optimized for bulk updates
    useEffect(() => {
        if (!isConnected || !isAuthenticated || selectedPairs.length === 0) return;

        const handleBulkUpdate = (pair: string, wsData: BoxSlice) => {
            queryClient.setQueryData(['allPairData'], (oldData: Record<string, PairData> | undefined) => ({
                ...oldData,
                [pair]: {
                    boxes: [wsData],
                    currentOHLC: wsData.currentOHLC,
                },
            }));
        };

        // Subscribe to all pairs at once
        selectedPairs.forEach((pair) => {
            subscribeToBoxSlices(pair, (wsData: BoxSlice) => {
                handleBulkUpdate(pair, wsData);
            });
        });

        return () => {
            console.log('🧹 Cleaning up WebSocket subscriptions');
            selectedPairs.forEach((pair) => {
                unsubscribeFromBoxSlices(pair);
            });
        };
    }, [isConnected, selectedPairs, isAuthenticated, subscribeToBoxSlices, unsubscribeFromBoxSlices, queryClient]);

    const pairData = pairDataQuery.data || {};

    const togglePair = (pair: string) => {
        const wasSelected = selectedPairs.includes(pair);
        const newSelected = wasSelected ? selectedPairs.filter((p) => p !== pair) : [...selectedPairs, pair];

        setSelectedPairs(newSelected);
        setSelectedPairs(newSelected);

        if (wasSelected) {
            unsubscribeFromBoxSlices(pair);
            // Update the allPairData by removing the pair
            queryClient.setQueryData(['allPairData'], (oldData: Record<string, PairData> | undefined) => {
                if (!oldData) return {};
                const { [pair]: removed, ...rest } = oldData;
                return rest;
            });
        }
    };

    const updateBoxColors = (colors: BoxColors) => {
        console.log('DashboardProvider updateBoxColors called with:', colors);
        // Update localStorage first
        setBoxColors(colors);
        // Force a re-render by creating a new object
        setBoxColorsState(colors);
        console.log('DashboardProvider state updated');
    };

    // Add sidebar click handler
    const handleSidebarClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // If clicking a toggle button or within sidebar content, do nothing
        if (
            target.closest('.sidebar-toggle') || // Clicking a toggle button
            target.closest('.sidebar-content') || // Clicking within sidebar content
            target.closest('.fixed-sidebar') // Clicking within the fixed sidebar area
        ) {
            return;
        }

        // Otherwise, close all unpinned sidebars
        window.dispatchEvent(new Event('closeSidebars'));
    };

    const value = {
        pairData,
        selectedPairs,
        isLoading: pairDataQuery.isLoading,
        togglePair,
        isConnected,
        boxColors: boxColorsState,
        updateBoxColors,
        isAuthenticated,
        handleSidebarClick,
    };

    return (
        <DashboardContext.Provider value={value}>
            <div onClick={handleSidebarClick}>{children}</div>
        </DashboardContext.Provider>
    );
};
