'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef
} from 'react';
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

type Subscriptions = Map<string, (data: BoxSlice) => void>;

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { session } = useAuth();
  const subscriptionsRef = useRef<Subscriptions>(new Map());

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

  const handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📥 WebSocket message in provider:', {
        type: data.type,
        pair: data.pair,
        hasCallback: data.pair ? subscriptionsRef.current.has(data.pair) : false
      });

      if (data.type === 'boxSlice') {
        const callback = subscriptionsRef.current.get(data.pair);
        if (callback && data.slice) {
          console.log(`📦 Processing data for ${data.pair}`);
          const boxSlice: BoxSlice = {
            boxes: data.slice.boxes || [],
            timestamp: data.slice.timestamp || new Date().toISOString(),
            currentOHLC: data.slice.currentOHLC || {
              open: 0,
              high: 0,
              low: 0,
              close: 0
            }
          };
          callback(boxSlice);
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };

  useEffect(() => {
    wsClient.onMessage(handleMessage);
    return () => wsClient.offMessage(handleMessage);
  }, []);

  const disconnect = () => {
    wsClient.disconnect();
  };

  const subscribeToBoxSlices = (
    pair: string,
    handler: (data: BoxSlice) => void
  ) => {
    console.log(`🔄 Subscribing to ${pair}`);
    subscriptionsRef.current.set(pair, handler);
    wsClient.subscribe(pair, handler);
  };

  const unsubscribeFromBoxSlices = (pair: string) => {
    subscriptionsRef.current.delete(pair);
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
