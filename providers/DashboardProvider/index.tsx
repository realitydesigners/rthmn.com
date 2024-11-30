'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';
import { BoxSlice, PairData, OHLC } from '@/types/types';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useAuth } from '@/providers/SupabaseProvider';
import {
  getSelectedPairs,
  setSelectedPairs,
  getBoxColors,
  setBoxColors,
  BoxColors
} from '@/utils/localStorage';
import { useQueries, useQueryClient } from '@tanstack/react-query';

interface DashboardContextType {
  pairData: Record<string, PairData>;
  selectedPairs: string[];
  isLoading: boolean;
  togglePair: (pair: string) => void;
  isConnected: boolean;
  boxColors: BoxColors;
  updateBoxColors: (colors: BoxColors) => void;
  isAuthenticated: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const AVAILABLE_PAIRS = [...FOREX_PAIRS, ...CRYPTO_PAIRS] as const;

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const queryClient = useQueryClient();
  const [selectedPairs, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [boxColors, setBoxColorsState] = useState<BoxColors>(getBoxColors());

  const { session } = useAuth();
  const isAuthenticated = !!session?.access_token;

  const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices } =
    useWebSocket();

  // Load selected pairs from localStorage
  useEffect(() => {
    if (!isAuthenticated) return;
    const stored = getSelectedPairs();
    const initialPairs =
      stored.length > 0 ? stored : ['GBPUSD', 'USDJPY', 'AUDUSD'];
    setSelected(initialPairs);
    if (stored.length === 0) {
      setSelectedPairs(initialPairs);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  // Use React Query for each pair
  const queries = useQueries({
    queries: selectedPairs.map((pair) => ({
      queryKey: ['pairData', pair],
      queryFn: () => {
        const existingData = queryClient.getQueryData([
          'pairData',
          pair
        ]) as PairData;
        return (
          existingData ||
          ({
            boxes: [],
            currentOHLC: {
              open: 0,
              high: 0,
              low: 0,
              close: 0
            }
          } as PairData)
        );
      },
      enabled: isConnected && isAuthenticated,
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchInterval: 0 as const
    }))
  });

  // WebSocket subscription management
  useEffect(() => {
    if (!isConnected || !isAuthenticated || selectedPairs.length === 0) return;

    // console.log('Setting up WebSocket subscriptions for pairs:', selectedPairs);

    selectedPairs.forEach((pair) => {
      subscribeToBoxSlices(pair, (wsData: BoxSlice) => {
        // console.log(`📊 Processing update for ${pair}:`, {
        //   timestamp: wsData.timestamp,
        //   currentPrice: wsData.currentOHLC?.close,
        //   lastUpdate: (
        //     queryClient.getQueryData(['pairData', pair]) as PairData | undefined
        //   )?.boxes?.[0]?.timestamp
        // });

        queryClient.setQueryData(
          ['pairData', pair],
          (oldData: PairData | undefined) => {
            const newData = {
              boxes: [wsData],
              currentOHLC: wsData.currentOHLC
            };

            // Log if data actually changed
            // if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
            //   console.log(`📈 Data changed for ${pair}:`, {
            //     old: oldData?.boxes?.[0]?.timestamp,
            //     new: wsData.timestamp,
            //     oldPrice: oldData?.currentOHLC?.close,
            //     newPrice: wsData.currentOHLC?.close
            //   });
            // }

            return newData;
          }
        );
      });
    });

    return () => {
      console.log('🧹 Cleaning up WebSocket subscriptions');
      selectedPairs.forEach((pair) => {
        unsubscribeFromBoxSlices(pair);
      });
    };
  }, [
    isConnected,
    selectedPairs,
    isAuthenticated,
    subscribeToBoxSlices,
    unsubscribeFromBoxSlices,
    queryClient
  ]);

  // Combine all pair data with proper typing
  const pairData = queries.reduce<Record<string, PairData>>(
    (acc, query, index) => {
      const data = query.data as PairData;
      if (data?.boxes && data?.currentOHLC) {
        acc[selectedPairs[index]] = {
          boxes: data.boxes,
          currentOHLC: data.currentOHLC
        };
      }
      return acc;
    },
    {}
  );

  const togglePair = (pair: string) => {
    const wasSelected = selectedPairs.includes(pair);
    const newSelected = wasSelected
      ? selectedPairs.filter((p) => p !== pair)
      : [...selectedPairs, pair];

    setSelected(newSelected);
    setSelectedPairs(newSelected);

    if (wasSelected) {
      unsubscribeFromBoxSlices(pair);
      queryClient.removeQueries({ queryKey: ['pairData', pair] });
    }
  };

  const updateBoxColors = (colors: BoxColors) => {
    setBoxColorsState(colors);
    setBoxColors(colors);
  };

  const value = {
    pairData,
    selectedPairs,
    isLoading: queries.some((q) => q.isLoading),
    togglePair,
    isConnected,
    boxColors,
    updateBoxColors,
    isAuthenticated
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
