'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BoxSlice, PairData } from '@/types/types';
import { wsClient } from '@/utils/websocketClient';
import { useAuth } from '@/providers/SupabaseProvider';

type WebSocketContextType = {
  subscribeToBoxSlices: (
    pair: string,
    handler: (data: BoxSlice) => void
  ) => void;
  unsubscribeFromBoxSlices: (pair: string) => void;
  isConnected: boolean;
  disconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.access_token && !isConnected) {
      wsClient.setAccessToken(session.access_token);
      wsClient.connect();
    }
  }, [session, isConnected]);

  useEffect(() => {
    const handleOpen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };
    const handleClose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    wsClient.onOpen(handleOpen);
    wsClient.onClose(handleClose);

    return () => {
      wsClient.offOpen(handleOpen);
      wsClient.offClose(handleClose);
    };
  }, []);

  const disconnect = () => {
    wsClient.disconnect();
  };

  const subscribeToBoxSlices = (
    pair: string,
    handler: (data: BoxSlice) => void
  ) => {
    wsClient.subscribe(pair, handler);
  };

  const unsubscribeFromBoxSlices = (pair: string) => {
    wsClient.unsubscribe(pair);
  };

  return (
    <WebSocketContext.Provider
      value={{
        subscribeToBoxSlices,
        unsubscribeFromBoxSlices,
        isConnected,
        disconnect
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
