'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BoxSlice, PairData, Signal, BoxColors, FullPreset } from '@/types/types';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useAuth } from '@/providers/SupabaseProvider';
import { getBoxColors, setBoxColors, getSelectedPairs, setSelectedPairs, DEFAULT_BOX_COLORS, fullPresets } from '@/utils/localStorage';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { INSTRUMENTS } from '@/utils/instruments';
import { GridCalculator } from '@/utils/gridCalc';

interface DashboardContextType {
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
    signalsData: Signal[] | null;
    selectedSignal: Signal | null;
    setSelectedSignal: (signal: Signal | null) => void;
    candlesData: Record<string, any[]>;
    DEFAULT_BOX_COLORS: BoxColors;
    DEFAULT_PAIRS: string[];
    fullPresets: FullPreset[];
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

export const AVAILABLE_PAIRS = [...Object.keys(INSTRUMENTS.FOREX), ...Object.keys(INSTRUMENTS.CRYPTO)] as const;

interface DashboardProviderClientProps {
    children: React.ReactNode;
    initialSignalsData: Signal[] | null;
}

export function DashboardProviderClient({ children, initialSignalsData }: DashboardProviderClientProps) {
    const queryClient = useQueryClient();
    const [selectedPairs, setSelectedPairsState] = useState<string[]>([]);
    const [boxColorsState, setBoxColorsState] = useState<BoxColors>(DEFAULT_BOX_COLORS);
    const [isSidebarInitialized, setIsSidebarInitialized] = useState(false);
    const [signalsData, setSignalsData] = useState<Signal[] | null>(initialSignalsData);
    const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
    const gridCalculator = useRef(new GridCalculator());

    const { session } = useAuth();
    const isAuthenticated = !!session?.access_token;

    const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices, priceData } = useWebSocket();

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

    // Initialize grid calculator with server data and update with price data
    useEffect(() => {
        if (!isLoading && pairDataQuery.data) {
            Object.entries(pairDataQuery.data).forEach(([pair, data]) => {
                if (data.boxes?.[0]?.boxes) {
                    gridCalculator.current.initializeBoxes(pair, data.boxes[0].boxes);
                }
            });
        }
    }, [pairDataQuery.data, isLoading]);

    // Update grid calculator with price data
    useEffect(() => {
        if (priceData && Object.keys(priceData).length > 0) {
            Object.entries(priceData).forEach(([pair, data]) => {
                if (data.price) {
                    gridCalculator.current.updateWithPrice(pair, data.price);

                    // Update query data with new box values
                    const currentOHLC = {
                        open: data.price,
                        high: data.price,
                        low: data.price,
                        close: data.price,
                    };

                    const updatedPairData = gridCalculator.current.getPairData(pair, currentOHLC);
                    if (updatedPairData) {
                        queryClient.setQueryData(['allPairData'], (oldData: Record<string, PairData> | undefined) => ({
                            ...oldData,
                            [pair]: updatedPairData,
                        }));
                    }
                }
            });
        }
    }, [priceData, queryClient]);

    // WebSocket subscription management
    useEffect(() => {
        if (!isConnected || !isAuthenticated || selectedPairs.length === 0) return;

        const handleBulkUpdate = (pair: string, wsData: BoxSlice) => {
            // Initialize grid calculator if needed
            if ('boxes' in wsData && Array.isArray(wsData.boxes) && wsData.boxes.length > 0) {
                gridCalculator.current.initializeBoxes(pair, wsData.boxes);
            }

            // Update query data
            queryClient.setQueryData(['allPairData'], (oldData: Record<string, PairData> | undefined) => ({
                ...oldData,
                [pair]: {
                    boxes: [wsData],
                    currentOHLC: wsData.currentOHLC,
                },
            }));
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

    console.log(pairData, 'pairData');

    const togglePair = (pair: string) => {
        const wasSelected = selectedPairs.includes(pair);
        const newSelected = wasSelected ? selectedPairs.filter((p) => p !== pair) : [...selectedPairs, pair];

        setSelectedPairsState(newSelected);
        setSelectedPairs(newSelected);

        if (wasSelected) {
            unsubscribeFromBoxSlices(pair);
            gridCalculator.current.clearPair(pair);
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

                signalsData,
                selectedSignal,
                setSelectedSignal,
                candlesData,
                DEFAULT_BOX_COLORS,
                DEFAULT_PAIRS: ['GBPUSD', 'USDJPY', 'AUDUSD'],
                fullPresets,
            }}>
            <div onClick={handleSidebarClick}>{children}</div>
        </DashboardContext.Provider>
    );
}

export { DashboardProviderClient as DashboardProvider };
export type { DashboardContextType };
