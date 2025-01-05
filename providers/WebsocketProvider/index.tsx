'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { BoxSlice, PriceData } from '@/types/types';
import { wsClient } from '@/providers/WebsocketProvider/websocketClient';
import { useAuth } from '@/providers/SupabaseProvider';

const PROVIDER_ERROR = 'useWebSocket must be used within a WebSocketProvider';

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

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = React.useState(false);
    const { session } = useAuth();
    const subscriptionsRef = useRef<Map<string, (data: BoxSlice) => void>>(new Map());
    const [priceData, setPriceData] = useState<Record<string, PriceData>>({});

    // Connection management
    useEffect(() => {
        if (session?.access_token && !isConnected) {
            initializeConnection();
        }
    }, [session, isConnected]);

    // Event handlers setup
    useEffect(() => setupConnectionHandlers(), []);
    useEffect(() => setupMessageHandler(), []);

    const initializeConnection = () => {
        wsClient.setAccessToken(session!.access_token);
        wsClient.connect();
    };

    const createHandlers = (): WebSocketHandlers => ({
        handleOpen: () => {
            setIsConnected(true);
            console.log('🟢 WebSocket connected');
        },
        handleClose: () => {
            setIsConnected(false);
            console.log('🔴 WebSocket disconnected');
        },
        handleMessage: (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'boxSlice') {
                handleBoxSliceMessage(data);
            } else if (data.type === 'price' && data.pair) {
                setPriceData((prev) => ({
                    ...prev,
                    [data.pair]: {
                        price: data.data.price,
                        timestamp: data.data.timestamp,
                        volume: data.data.volume,
                    },
                }));
            }
        },
    });

    const handleBoxSliceMessage = (data: any) => {
        const callback = subscriptionsRef.current.get(data.pair);
        if (callback && data.slice) {
            callback(data.slice);
        }
    };

    const setupConnectionHandlers = () => {
        const { handleOpen, handleClose } = createHandlers();
        wsClient.onOpen(handleOpen);
        wsClient.onClose(handleClose);
        return () => {
            wsClient.offOpen(handleOpen);
            wsClient.offClose(handleClose);
        };
    };

    const setupMessageHandler = () => {
        const { handleMessage } = createHandlers();
        wsClient.onMessage(handleMessage);
        return () => wsClient.offMessage(handleMessage);
    };

    const contextValue = {
        subscribeToBoxSlices: (pair, handler) => {
            subscriptionsRef.current.set(pair, handler);
            wsClient.subscribe(pair, handler);
        },
        unsubscribeFromBoxSlices: (pair) => {
            subscriptionsRef.current.delete(pair);
            wsClient.unsubscribe(pair);
        },
        isConnected,
        disconnect: () => wsClient.disconnect(),
        priceData,
    };

    return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) throw new Error(PROVIDER_ERROR);
    return context;
};
