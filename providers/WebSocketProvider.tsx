'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BoxSlice, PairData } from '@/types';
import { wsClient } from '@/utils/websocketClient';
import { useAuth } from '@/providers/SupabaseProvider';

type WebSocketContextType = {
  subscribeToBoxSlices: (
    pair: string,
    handler: (data: BoxSlice) => void
  ) => void;
  unsubscribeFromBoxSlices: (pair: string) => void;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.access_token) {
      wsClient.setAccessToken(session.access_token);
      // Optionally connect here if you want to connect automatically when the token is available
      // wsClient.connect();
    }
  }, [session]);

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

  const connect = () => {
    if (session?.access_token) {
      wsClient.connect();
    } else {
      console.error('Cannot connect: No access token available');
    }
  };

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
        connect,
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
