'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { BoxSlice, PairData, Signal } from '@/types/types';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useAuth } from '@/providers/SupabaseProvider';
import { BoxColors, getBoxColors, setBoxColors, getSelectedPairs, setSelectedPairs, DEFAULT_BOX_COLORS } from '@/utils/localStorage';
import { useQueries, useQueryClient } from '@tanstack/react-query';

interface DashboardContextType {
    // Original Dashboard State
    pairData: Record<string, PairData>;
    selectedPairs: string[];
    isLoading: boolean;
    isSidebarInitialized: boolean;
    togglePair: (pair: string) => void;
    isConnected: boolean;
    boxColors: BoxColors;
    updateBoxColors: (colors: BoxColors) => void;
    isAuthenticated: boolean;
    handleSidebarClick: (e: React.MouseEvent) => void;
    // Signal State
    signalsData: Signal[] | null;
    selectedSignal: Signal | null;
    setSelectedSignal: (signal: Signal | null) => void;
    candlesData: Record<string, any[]>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};

type SignalContextType = {
    signalsData: Signal[] | null;
    selectedSignal: Signal | null;
    setSelectedSignal: (signal: Signal | null) => void;
};

const SignalContext = createContext<SignalContextType | undefined>(undefined);

type SignalProviderProps = {
    children: React.ReactNode;
    initialSignalsData: Signal[] | null;
};

export function SignalProviderClient({ children, initialSignalsData }: SignalProviderProps) {
    const [signalsData, setSignalsData] = useState<Signal[] | null>(initialSignalsData);
    const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

    return <SignalContext.Provider value={{ signalsData, selectedSignal, setSelectedSignal }}>{children}</SignalContext.Provider>;
}

export function useSignals() {
    const context = useContext(SignalContext);
    if (context === undefined) {
        throw new Error('useSignals must be used within a SignalProvider');
    }
    return context;
}

export const AVAILABLE_PAIRS = [...FOREX_PAIRS, ...CRYPTO_PAIRS] as const;

interface DashboardProviderClientProps {
    children: React.ReactNode;
    initialSignalsData: Signal[] | null;
}

export function DashboardProviderClient({ children, initialSignalsData }: DashboardProviderClientProps) {
    const queryClient = useQueryClient();
    const [selectedPairs, setSelectedPairsState] = useState<string[]>([]);
    const [boxColorsState, setBoxColorsState] = useState<BoxColors>(DEFAULT_BOX_COLORS);
    const [isSidebarInitialized, setIsSidebarInitialized] = useState(false);
    // Signal state
    const [signalsData, setSignalsData] = useState<Signal[] | null>(initialSignalsData);
    const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

    const { session } = useAuth();
    const isAuthenticated = !!session?.access_token;

    const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices } = useWebSocket();

    // Initialize state from localStorage after mount
    useEffect(() => {
        const storedColors = getBoxColors();
        const storedPairs = getSelectedPairs();
        setBoxColorsState(storedColors);
        setSelectedPairsState(storedPairs);
        setIsSidebarInitialized(true);
    }, []);

    // Load selected pairs from localStorage
    useEffect(() => {
        if (!isAuthenticated) return;
        const stored = getSelectedPairs();
        const initialPairs = stored.length > 0 ? stored : ['GBPUSD', 'USDJPY', 'AUDUSD'];
        setSelectedPairsState(initialPairs);
        if (stored.length === 0) {
            setSelectedPairsState(initialPairs);
        }
    }, [isAuthenticated]);

    // Single query for all pair data
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
                enabled: isConnected && isAuthenticated && selectedPairs.length > 0,
                staleTime: Infinity,
                gcTime: Infinity,
                refetchInterval: 0 as const,
            },
        ],
    })[0];

    // Calculate loading state including sidebar initialization
    const isLoading = !isAuthenticated || pairDataQuery.isLoading || !isConnected || !isSidebarInitialized;

    // Candles queries - single fetch, no refetching
    const candlesQueries = useQueries({
        queries: selectedPairs.map((pair) => ({
            queryKey: ['candles', pair],
            queryFn: async () => {
                const response = await fetch(`/api/getCandles?pair=${pair}&limit=10000&token=${session?.access_token}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const { data } = await response.json();
                return data;
            },
            enabled: isConnected && isAuthenticated && !!session?.access_token,
            staleTime: Infinity,
            gcTime: Infinity,
            refetchInterval: 0,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        })),
    });

    // WebSocket subscription management
    useEffect(() => {
        if (!isConnected || !isAuthenticated || selectedPairs.length === 0) return;

        const handleBulkUpdate = (pair: string, wsData: BoxSlice) => {
            // Update box data
            queryClient.setQueryData(['allPairData'], (oldData: Record<string, PairData> | undefined) => ({
                ...oldData,
                [pair]: {
                    boxes: [wsData],
                    currentOHLC: wsData.currentOHLC,
                },
            }));

            // Update candle data with proper candle formation logic
            if (wsData.currentOHLC) {
                queryClient.setQueryData(['candles', pair], (oldData: any[] | undefined) => {
                    if (!oldData?.length) return oldData;

                    const [latestCandle, ...rest] = oldData;
                    const currentTime = new Date(wsData.timestamp);
                    const candleTime = new Date(latestCandle.timestamp);

                    // Check if we need to create a new candle (every minute)
                    if (currentTime.getMinutes() !== candleTime.getMinutes()) {
                        // Create new candle
                        const newCandle = {
                            timestamp: wsData.timestamp,
                            open: wsData.currentOHLC.open,
                            high: wsData.currentOHLC.high,
                            low: wsData.currentOHLC.low,
                            close: wsData.currentOHLC.close,
                            volume: 0, // If you have volume data, include it here
                        };
                        return [newCandle, latestCandle, ...rest];
                    }

                    // Update existing candle
                    const updatedCandle = {
                        ...latestCandle,
                        high: Math.max(latestCandle.high, wsData.currentOHLC.close),
                        low: Math.min(latestCandle.low, wsData.currentOHLC.close),
                        close: wsData.currentOHLC.close,
                    };

                    return [updatedCandle, ...rest];
                });
            }
        };

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

    // Combine candles data for all pairs
    const candlesData = React.useMemo(() => {
        return selectedPairs.reduce(
            (acc, pair, index) => {
                const queryData = candlesQueries[index].data;
                if (queryData) {
                    acc[pair] = queryData;
                }
                return acc;
            },
            {} as Record<string, any[]>
        );
    }, [selectedPairs, candlesQueries]);

    const pairData = pairDataQuery.data || {};

    const togglePair = (pair: string) => {
        const wasSelected = selectedPairs.includes(pair);
        const newSelected = wasSelected ? selectedPairs.filter((p) => p !== pair) : [...selectedPairs, pair];

        setSelectedPairsState(newSelected);
        setSelectedPairs(newSelected);

        if (wasSelected) {
            unsubscribeFromBoxSlices(pair);
            queryClient.setQueryData(['allPairData'], (oldData: Record<string, PairData> | undefined) => {
                if (!oldData) return {};
                const { [pair]: removed, ...rest } = oldData;
                return rest;
            });
        }
    };

    const updateBoxColors = (colors: BoxColors) => {
        setBoxColors(colors);
        setBoxColorsState(colors);
    };

    const handleSidebarClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.sidebar-toggle') || target.closest('.sidebar-content') || target.closest('.fixed-sidebar')) {
            return;
        }
        window.dispatchEvent(new Event('closeSidebars'));
    };

    return (
        <DashboardContext.Provider
            value={{
                pairData,
                selectedPairs,
                isLoading,
                isSidebarInitialized,
                togglePair,
                isConnected,
                boxColors: boxColorsState,
                updateBoxColors,
                isAuthenticated,
                handleSidebarClick,
                // Signal values
                signalsData,
                selectedSignal,
                setSelectedSignal,
                candlesData,
            }}>
            <div onClick={handleSidebarClick}>{children}</div>
        </DashboardContext.Provider>
    );
}

export { DashboardProviderClient as DashboardProvider };
export type { DashboardContextType };
