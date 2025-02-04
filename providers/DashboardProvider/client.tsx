'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/app/(user)/onboarding/onboarding';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { BoxColors, BoxSlice, PairData, Signal } from '@/types/types';
import { GridCalculator } from '@/utils/gridCalc';
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
    isAuthenticated: boolean;
    handleSidebarClick: (e: React.MouseEvent) => void;
    signalsData: Signal[] | null;
    selectedSignal: Signal | null;
    setSelectedSignal: (signal: Signal | null) => void;
    candlesData: Record<string, any[]>;
    DEFAULT_BOX_COLORS: BoxColors;
    fullPresets: FullPreset[];
    fetchBoxSlice: Record<string, any>;
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

export function DashboardProviderClient({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { hasCompletedInitialOnboarding } = useOnboardingStore();
    const [selectedPairs, setSelectedPairsState] = useState<string[]>([]);
    const [boxColorsState, setBoxColorsState] = useState<BoxColors>(DEFAULT_BOX_COLORS);
    const [isSidebarInitialized, setIsSidebarInitialized] = useState(false);
    const [signalsData, setSignalsData] = useState<Signal[] | null>(null);
    const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
    const [pairData, setPairData] = useState<Record<string, PairData>>({});
    const initialDataReceivedRef = useRef<Set<string>>(new Set());
    const gridCalculators = React.useRef<Map<string, GridCalculator>>(new Map());
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

    // Initialize grid calculator with server data and update with price data
    useEffect(() => {
        if (!isLoading && pairData) {
            Object.entries(pairData).forEach(([pair, data]) => {
                if (data.boxes?.[0]?.boxes) {
                    const calculator = new GridCalculator();
                    calculator.initializeBoxes(pair, data.boxes[0].boxes);
                    gridCalculators.current.set(pair, calculator);
                }
            });
        }
    }, [pairData, isLoading]);

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
                        // Initialize calculator with initial box values
                        const calculator = new GridCalculator();
                        calculator.initializeBoxes(pair, wsData.boxes);
                        gridCalculators.current.set(pair, calculator);

                        // For first message, use the same data for both initial and current
                        return {
                            ...prev,
                            [pair]: {
                                boxes: [wsData], // Current box data starts with initial values
                                currentOHLC: wsData.currentOHLC,
                                initialBoxData: wsData, // Store initial values
                            },
                        };
                    }

                    // For subsequent messages, only update if we have a calculator
                    const calculator = gridCalculators.current.get(pair);
                    if (calculator && wsData.currentOHLC) {
                        // Update calculator with new price
                        calculator.updateWithPrice(pair, wsData.currentOHLC.close);

                        // Get processed box data
                        const processedData = calculator.getPairData(pair, wsData.currentOHLC);
                        if (processedData) {
                            return {
                                ...prev,
                                [pair]: {
                                    ...processedData,
                                    initialBoxData: prev[pair].initialBoxData, // Keep initial data unchanged
                                },
                            };
                        }
                    }
                    return prev;
                });
            });
        });

        return () => {
            console.log('Cleaning up WebSocket subscriptions');
            selectedPairs.forEach((pair) => {
                unsubscribeFromBoxSlices(pair);
                gridCalculators.current.delete(pair);
            });
        };
    }, [isConnected, selectedPairs, isAuthenticated, subscribeToBoxSlices, unsubscribeFromBoxSlices]);

    // Process price updates using initial box values
    useEffect(() => {
        if (!priceData || Object.keys(priceData).length === 0) return;

        Object.entries(priceData).forEach(([pair, data]) => {
            if (data.price) {
                const calculator = gridCalculators.current.get(pair);
                if (calculator) {
                    // Update calculator with new price
                    calculator.updateWithPrice(pair, data.price);

                    // Create OHLC from price data
                    const currentOHLC = {
                        open: data.price,
                        high: data.price,
                        low: data.price,
                        close: data.price,
                    };

                    // Get processed box data
                    const processedData = calculator.getPairData(pair, currentOHLC);
                    if (processedData) {
                        setPairData((prev) => ({
                            ...prev,
                            [pair]: {
                                ...processedData,
                                initialBoxData: prev[pair]?.initialBoxData, // Keep initial data unchanged
                            },
                        }));
                    }
                }
            }
        });
    }, [priceData]);

    const togglePair = React.useCallback(
        (pair: string) => {
            const wasSelected = selectedPairs.includes(pair);
            const newSelected = wasSelected ? selectedPairs.filter((p) => p !== pair) : [...selectedPairs, pair];

            setSelectedPairsState(newSelected);
            setSelectedPairs(newSelected);

            if (wasSelected) {
                unsubscribeFromBoxSlices(pair);
                gridCalculators.current.delete(pair);
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
        <DashboardContext.Provider
            value={{
                pairData,
                selectedPairs,
                isLoading,
                isSidebarInitialized,
                togglePair,
                isConnected,
                boxColors: boxColorsState,
                updateBoxColors: setBoxColorsState,
                isAuthenticated,
                handleSidebarClick,
                signalsData,
                selectedSignal,
                setSelectedSignal,
                candlesData: {},
                DEFAULT_BOX_COLORS,
                fullPresets,
                fetchBoxSlice: {},
            }}>
            <div onClick={handleSidebarClick}>{children}</div>
        </DashboardContext.Provider>
    );
}

export { DashboardProviderClient as DashboardProvider };
export type { DashboardContextType };
