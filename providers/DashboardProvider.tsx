import React, { createContext, useContext, useState, useEffect } from 'react';
import { BoxSlice, PairData } from '@/types/types';
import { useWebSocket } from '@/providers/WebSocketProvider';
import {
  getSelectedPairs,
  setSelectedPairs,
  getBoxColors,
  setBoxColors,
  BoxColors
} from '@/utils/localStorage';

interface DashboardContextType {
  pairData: Record<string, PairData>;
  selectedPairs: string[];
  isLoading: boolean;
  togglePair: (pair: string) => void;
  isConnected: boolean;
  boxColors: BoxColors;
  updateBoxColors: (colors: BoxColors) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const FOREX_PAIRS = [
  'USDJPY',
  'GBPUSD',
  'AUDUSD',
  'EURUSD',
  'USDCAD',
  'USDCHF',
  'NZDUSD',
  'GBPAUD',
  'GBPCAD',
  'GBPNZD',
  'EURJPY'
] as const;

export const CRYPTO_PAIRS = [
  'BTCUSD',
  'ETHUSD',
  'LTCUSD',
  'BCHUSD',
  'PAXGUSD',
  'LINKUSD',
  'UNIUSD',
  'AAVEUSD'
] as const;

export const AVAILABLE_PAIRS = [...FOREX_PAIRS, ...CRYPTO_PAIRS] as const;

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [pairData, setPairData] = useState<Record<string, PairData>>({});
  const [selectedPairs, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [boxColors, setBoxColorsState] = useState<BoxColors>(getBoxColors());

  const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices } =
    useWebSocket();

  // Load selected pairs from localStorage
  useEffect(() => {
    const stored = getSelectedPairs();
    const initialPairs =
      stored.length > 0 ? stored : ['GBPUSD', 'USDJPY', 'AUDUSD'];
    setSelected(initialPairs);

    // Always save the initial pairs to localStorage if none exist
    if (stored.length === 0) {
      setSelectedPairs(initialPairs);
    }
    setIsLoading(false);
  }, []);

  // Load colors from localStorage on mount
  useEffect(() => {
    const savedColors = getBoxColors();
    setBoxColorsState(savedColors);
  }, []);

  // WebSocket subscription management
  useEffect(() => {
    if (!isConnected || selectedPairs.length === 0) return;

    // Subscribe to all pairs
    selectedPairs.forEach((pair) => {
      subscribeToBoxSlices(pair, (wsData: BoxSlice) => {
        setPairData((prev) => ({
          ...prev,
          [pair]: {
            boxes: [wsData],
            currentOHLC: wsData.currentOHLC
          }
        }));
      });
    });

    return () => {
      selectedPairs.forEach((pair) => {
        unsubscribeFromBoxSlices(pair);
      });
    };
  }, [isConnected, selectedPairs]); // Add selectedPairs as dependency

  const togglePair = (pair: string) => {
    const wasSelected = selectedPairs.includes(pair);
    const newSelected = wasSelected
      ? selectedPairs.filter((p) => p !== pair)
      : [...selectedPairs, pair];

    setSelected(newSelected);
    setSelectedPairs(newSelected);

    // Handle subscription/unsubscription for just the toggled pair
    if (wasSelected) {
      unsubscribeFromBoxSlices(pair);
      setPairData((prev) => {
        const newData = { ...prev };
        delete newData[pair];
        return newData;
      });
    } else if (isConnected) {
      subscribeToBoxSlices(pair, (wsData: BoxSlice) => {
        setPairData((prev) => ({
          ...prev,
          [pair]: {
            boxes: [wsData],
            currentOHLC: wsData.currentOHLC
          }
        }));
      });
    }
  };

  const updateBoxColors = (colors: BoxColors) => {
    setBoxColorsState(colors);
    setBoxColors(colors); // This saves to localStorage
  };

  const value = {
    pairData,
    selectedPairs,
    isLoading,
    togglePair,
    isConnected,
    boxColors,
    updateBoxColors
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
