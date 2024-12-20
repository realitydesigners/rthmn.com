'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { BoxSlice, PairData, OHLC } from '@/types/types';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useAuth } from '@/providers/SupabaseProvider';
import { getSelectedPairs, setSelectedPairs, getBoxColors, setBoxColors, BoxColors } from '@/utils/localStorage';
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
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const AVAILABLE_PAIRS = [...FOREX_PAIRS, ...CRYPTO_PAIRS] as const;

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [selectedPairs, setSelected] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [boxColors, setBoxColorsState] = useState<BoxColors>(getBoxColors());

    const { session } = useAuth();
    const isAuthenticated = !!session?.access_token;

    const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices } = useWebSocket();

    // Load selected pairs from localStorage
    useEffect(() => {
        if (!isAuthenticated) return;
        const stored = getSelectedPairs();
        const initialPairs = stored.length > 0 ? stored : ['GBPUSD', 'USDJPY', 'AUDUSD'];
        setSelected(initialPairs);
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

        setSelected(newSelected);
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

    const value = {
        pairData,
        selectedPairs,
        isLoading: pairDataQuery.isLoading,
        togglePair,
        isConnected,
        boxColors,
        updateBoxColors,
        isAuthenticated,
    };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
