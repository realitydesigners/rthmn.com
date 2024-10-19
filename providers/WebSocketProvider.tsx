'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BoxSlice, PairData } from '@/types';
import { wsClient } from '@/utils/websocketClient';

type WebSocketContextType = {
  subscribeToBoxSlices: (
    pair: string,
    handler: (data: BoxSlice) => void
  ) => void;
  unsubscribeFromBoxSlices: (pair: string) => void;
  isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsConnected(true);
    const handleClose = () => setIsConnected(false);

    wsClient.onOpen(handleOpen);
    wsClient.onClose(handleClose);

    return () => {
      wsClient.offOpen(handleOpen);
      wsClient.offClose(handleClose);
    };
  }, []);

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
      value={{ subscribeToBoxSlices, unsubscribeFromBoxSlices, isConnected }}
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
