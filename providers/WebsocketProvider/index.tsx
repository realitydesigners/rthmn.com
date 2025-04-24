'use client';

import { API_ROUTES } from '@/app/(admin)/api/config';
import { useAuth } from '@/providers/SupabaseProvider';
import { wsClient } from '@/providers/WebsocketProvider/websocketClient';
import type { BoxSlice, PriceData } from '@/types/types';
import type React from 'react';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface WebSocketContextType {
    subscribeToBoxSlices: (pair: string, handler: (data: BoxSlice) => void) => void;
    unsubscribeFromBoxSlices: (pair: string) => void;
    isConnected: boolean;
    disconnect: () => void;
    priceData: Record<string, PriceData>;
}

interface WebSocketHandlers {
    handleOpen: () => void;
    handleClose: () => void;
    handleMessage: (event: MessageEvent) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Optimized price data transformation
const transformCandleToPrice = (pair: string, candle: any): PriceData | null => {
    if (candle && typeof candle.close !== 'undefined') {
        return {
            price: candle.close,
            timestamp: candle.timestamp || new Date().toISOString(),
            volume: 0,
        };
    }
    return null;
};

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const { session } = useAuth();
    const subscriptionsRef = useRef<Map<string, (data: BoxSlice) => void>>(new Map());
    const [priceData, setPriceData] = useState<Record<string, PriceData>>({});
    const connectionAttemptRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized connection initialization
    const initializeConnection = useCallback(() => {
        if (!session?.access_token) return;

        // Clear any existing connection attempt
        if (connectionAttemptRef.current) {
            clearTimeout(connectionAttemptRef.current);
            connectionAttemptRef.current = null;
        }

        // Only initialize if not already connected
        if (!isConnected) {
            wsClient.setAccessToken(session.access_token);
            wsClient.connect();
        }
    }, [session?.access_token, isConnected]);

    // Optimized message handlers
    const handleBoxSliceMessage = useCallback((data: any) => {
        const callback = subscriptionsRef.current.get(data.pair);
        if (callback && data.data) {
            callback(data.data);
        }
    }, []);

    const handlePriceMessage = useCallback((data: any) => {
        if (data.type === 'price' && data.pair) {
            setPriceData((prev) => ({
                ...prev,
                [data.pair]: {
                    price: data.data.price,
                    timestamp: data.data.timestamp,
                    volume: data.data.volume,
                },
            }));
        }
    }, []);

    // Memoized WebSocket handlers
    const handlers = useMemo(
        (): WebSocketHandlers => ({
            handleOpen: () => setIsConnected(true),
            handleClose: () => setIsConnected(false),
            handleMessage: (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.type === 'boxSlice') {
                    handleBoxSliceMessage(data);
                } else if (data.type === 'price') {
                    handlePriceMessage(data);
                }
            },
        }),
        [handleBoxSliceMessage, handlePriceMessage]
    );

    // Optimized initial data fetching
    const fetchInitialCandleData = useCallback(async () => {
        if (!session?.access_token) return;

        try {
            const response = await fetch(
                `${window.location.origin}${API_ROUTES.LATEST_CANDLES}?token=${session.access_token}`
            );
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Candle data fetch failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    details: errorData,
                });
                return;
            }

            const data = await response.json();
            const initialPriceData: Record<string, PriceData> = {};

            Object.entries(data).forEach(([pair, candle]: [string, any]) => {
                const priceData = transformCandleToPrice(pair, candle);
                if (priceData) {
                    initialPriceData[pair] = priceData;
                }
            });

            if (Object.keys(initialPriceData).length > 0) {
                setPriceData(initialPriceData);
            }
        } catch (error) {
            console.error('Failed to fetch initial candle data:', error);
        }
    }, [session?.access_token]);

    // Connection management
    useEffect(() => {
        if (session?.access_token && !isConnected) {
            fetchInitialCandleData();
            initializeConnection();
        }

        return () => {
            if (connectionAttemptRef.current) {
                clearTimeout(connectionAttemptRef.current);
            }
        };
    }, [session?.access_token, isConnected, fetchInitialCandleData, initializeConnection]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            wsClient.disconnect();
        };
    }, []);

    // Event handlers setup
    useEffect(() => {
        const { handleOpen, handleClose } = handlers;
        wsClient.onOpen(handleOpen);
        wsClient.onClose(handleClose);
        return () => {
            wsClient.offOpen(handleOpen);
            wsClient.offClose(handleClose);
        };
    }, [handlers]);

    useEffect(() => {
        const { handleMessage } = handlers;
        wsClient.onMessage(handleMessage);
        return () => wsClient.offMessage(handleMessage);
    }, [handlers]);

    // Memoized subscription handlers
    const subscribeToBoxSlices = useCallback((pair: string, handler: (data: BoxSlice) => void) => {
        subscriptionsRef.current.set(pair, handler);
        wsClient.subscribe(pair, handler);
    }, []);

    const unsubscribeFromBoxSlices = useCallback((pair: string) => {
        subscriptionsRef.current.delete(pair);
        wsClient.unsubscribe(pair);
    }, []);

    // Memoized context value
    const value = useMemo(
        () => ({
            subscribeToBoxSlices,
            unsubscribeFromBoxSlices,
            isConnected,
            disconnect: () => wsClient.disconnect(),
            priceData,
        }),
        [subscribeToBoxSlices, unsubscribeFromBoxSlices, isConnected, priceData]
    );

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

// Custom hook with proper error handling
export function useWebSocket() {
    const context = use(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
