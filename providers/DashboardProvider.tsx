import React, { createContext, useContext, useState, useEffect } from 'react';
import { BoxSlice, PairData } from '@/types';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { getSelectedPairs, setSelectedPairs } from '@/utils/localStorage';

interface DashboardContextType {
  pairData: Record<string, PairData>;
  selectedPairs: string[];
  isLoading: boolean;
  togglePair: (pair: string) => void;
  isConnected: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const AVAILABLE_PAIRS = [
  'usdjpy',
  'gbpusd',
  'audusd',
  'eurusd',
  'usdcad',
  'usdchf',
  'nzdusd',
  'gbpaud',
  'gbpcad',
  'gbpnzd',
  'eurjpy'
];

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [pairData, setPairData] = useState<Record<string, PairData>>({});
  const [selectedPairs, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices } =
    useWebSocket();

  // Load selected pairs from localStorage
  useEffect(() => {
    const stored = getSelectedPairs();
    const initialPairs =
      stored.length > 0 ? stored : ['gbpusd', 'usdjpy', 'audusd'];

    setSelected(initialPairs);
    if (stored.length === 0) {
      setSelectedPairs(initialPairs);
    }
    setIsLoading(false);
  }, []);

  // WebSocket subscription management
  useEffect(() => {
    if (!isConnected) return;

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
  }, [
    isConnected,
    selectedPairs,
    subscribeToBoxSlices,
    unsubscribeFromBoxSlices
  ]);

  const togglePair = (pair: string) => {
    const wasSelected = selectedPairs.includes(pair);
    const newSelected = wasSelected
      ? selectedPairs.filter((p) => p !== pair)
      : [...selectedPairs, pair];

    setSelected(newSelected);
    setSelectedPairs(newSelected);

    if (wasSelected) {
      setPairData((prev) => {
        const newData = { ...prev };
        delete newData[pair];
        return newData;
      });
    }
  };

  const value = {
    pairData,
    selectedPairs,
    isLoading,
    togglePair,
    isConnected
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
