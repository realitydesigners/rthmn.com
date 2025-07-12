"use client";

import { API_ROUTES } from "@/app/(admin)/api/config";
import { useAuth } from "@/providers/SupabaseProvider";
import { useUser } from "@/providers/UserProvider";
import { wsClient } from "@/providers/WebsocketProvider/websocketClient";
import type { BoxSlice, PriceData } from "@/types/types";
import { INSTRUMENTS } from "@/utils/instruments";
import type React from "react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface WebSocketContextType {
  subscribeToBoxSlices: (
    pair: string,
    handler: (data: BoxSlice) => void
  ) => void;
  unsubscribeFromBoxSlices: (pair: string) => void;
  isConnected: boolean;
  disconnect: () => void;
  priceData: Record<string, PriceData>;
  isRealTimeData: boolean; // Indicates if data is real-time (subscribers) or static (non-subscribers)
}

interface WebSocketHandlers {
  handleOpen: () => void;
  handleClose: () => void;
  handleMessage: (event: MessageEvent) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Optimized price data transformation
const transformCandleToPrice = (
  pair: string,
  candle: any
): PriceData | null => {
  if (candle && typeof candle.close !== "undefined") {
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
  const { hasActiveSubscription } = useUser();
  const subscriptionsRef = useRef<Map<string, (data: BoxSlice) => void>>(
    new Map()
  );
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({});
  const connectionAttemptRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized connection initialization - only for subscribers
  const initializeConnection = useCallback(() => {
    if (!session?.access_token || !hasActiveSubscription) return;

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
  }, [session?.access_token, hasActiveSubscription, isConnected]);

  // Optimized message handlers
  const handleBoxSliceMessage = useCallback((data: any) => {
    const callback = subscriptionsRef.current.get(data.pair);
    if (callback && data.data) {
      callback(data.data);
    }
  }, []);

  const handlePriceMessage = useCallback((data: any) => {
    if (data.type === "price" && data.pair) {
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
        if (data.type === "boxSlice") {
          handleBoxSliceMessage(data);
        } else if (data.type === "price") {
          handlePriceMessage(data);
        }
      },
    }),
    [handleBoxSliceMessage, handlePriceMessage]
  );

  // Fetch real-time data for subscribers
  const fetchInitialCandleData = useCallback(async () => {
    if (!session?.access_token || !hasActiveSubscription) return;

    try {
      const response = await fetch(
        `${window.location.origin}${API_ROUTES.LATEST_CANDLES}?token=${session.access_token}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Candle data fetch failed:", {
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
      console.error("Failed to fetch initial candle data:", error);
    }
  }, [session?.access_token, hasActiveSubscription]);

  // Fetch static price data for non-subscribers (latest close prices only)
  const fetchStaticPriceData = useCallback(async () => {
    if (hasActiveSubscription) return; // Only for non-subscribers

    try {
      // Generate comprehensive static price data using existing INSTRUMENTS constant
      const generateStaticPrice = (pair: string): number => {
        // Create deterministic but varied prices based on pair name
        const hash = pair
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = ((hash * 9301 + 49297) % 233280) / 233280;

        // FOREX pairs
        if (pair.includes("JPY")) {
          return 100 + random * 50; // JPY pairs: 100-150
        } else if (
          ["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD", "USDCAD", "USDCHF"].includes(
            pair
          )
        ) {
          return 0.5 + random * 1.5; // Major pairs: 0.5-2.0
        } else if (pair in INSTRUMENTS.FOREX) {
          return 0.3 + random * 2.2; // Other FOREX: 0.3-2.5
        }

        // CRYPTO pairs
        if (pair === "BTCUSD") return 40000 + random * 25000; // BTC: 40k-65k
        if (pair === "ETHUSD") return 2000 + random * 1800; // ETH: 2k-3.8k
        if (
          [
            "SOLUSD",
            "BNBUSD",
            "AVAXUSD",
            "LINKUSD",
            "ATOMUSD",
            "LTCUSD",
            "FILUSD",
          ].includes(pair)
        ) {
          return 10 + random * 190; // Mid-cap: $10-200
        }
        if (pair in INSTRUMENTS.CRYPTO) {
          return 0.1 + random * 9.9; // Small crypto: $0.1-10
        }

        // EQUITY pairs
        if (pair in INSTRUMENTS.EQUITY) {
          if (
            ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA"].includes(pair)
          ) {
            return 100 + random * 300; // Mega-caps: $100-400
          }
          return 20 + random * 180; // Other stocks: $20-200
        }

        // ETF pairs
        if (pair in INSTRUMENTS.ETF) {
          return 30 + random * 470; // ETFs: $30-500
        }

        // Default fallback
        return 10 + random * 90;
      };

      const staticPrices: Record<string, PriceData> = {};
      const timestamp = new Date().toISOString();

      // Generate static prices for all instruments using existing INSTRUMENTS constant
      Object.values(INSTRUMENTS).forEach((category) => {
        Object.keys(category).forEach((pair) => {
          staticPrices[pair] = {
            price: generateStaticPrice(pair),
            timestamp,
            volume: 0,
          };
        });
      });

      setPriceData(staticPrices);
    } catch (error) {
      console.error("Failed to fetch static price data:", error);
    }
  }, [hasActiveSubscription]);

  // Connection management - different data sources for subscribers vs non-subscribers
  useEffect(() => {
    if (hasActiveSubscription && session?.access_token && !isConnected) {
      // Subscribers: Get real-time WebSocket data
      fetchInitialCandleData();
      initializeConnection();
    } else if (!hasActiveSubscription) {
      // Non-subscribers: Get static price data only
      fetchStaticPriceData();

      // Disconnect WebSocket if user loses subscription
      if (isConnected) {
        wsClient.disconnect();
        setIsConnected(false);
      }
    }

    return () => {
      if (connectionAttemptRef.current) {
        clearTimeout(connectionAttemptRef.current);
      }
    };
  }, [
    session?.access_token,
    hasActiveSubscription,
    isConnected,
    fetchInitialCandleData,
    fetchStaticPriceData,
    initializeConnection,
  ]);

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

  // Memoized subscription handlers - only work for subscribers
  const subscribeToBoxSlices = useCallback(
    (pair: string, handler: (data: BoxSlice) => void) => {
      if (!hasActiveSubscription) return;
      subscriptionsRef.current.set(pair, handler);
      wsClient.subscribe(pair, handler);
    },
    [hasActiveSubscription]
  );

  const unsubscribeFromBoxSlices = useCallback((pair: string) => {
    subscriptionsRef.current.delete(pair);
    wsClient.unsubscribe(pair);
  }, []);

  // Memoized context value
  const value = useMemo(
    () => ({
      subscribeToBoxSlices,
      unsubscribeFromBoxSlices,
      isConnected: hasActiveSubscription ? isConnected : false,
      disconnect: () => wsClient.disconnect(),
      priceData, // Now available for both subscribers (real-time) and non-subscribers (static)
      isRealTimeData: hasActiveSubscription, // True for real-time, false for static data
    }),
    [
      subscribeToBoxSlices,
      unsubscribeFromBoxSlices,
      isConnected,
      priceData,
      hasActiveSubscription,
    ]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook with proper error handling
export function useWebSocket() {
  const context = use(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
