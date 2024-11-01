import React, { useEffect, useState } from 'react';
import PairCard from '@/components/PairCard';
import styles from './styles.module.css';
import { getLatestBoxSlices, getBoxSlices } from '@/utils/boxSlices';
import { BoxSlice, PairData } from '@/types';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { getSelectedPairs, setSelectedPairs } from '@/utils/localStorage';

interface PairGridProps {
  sessionToken: string;
}

const AVAILABLE_PAIRS = [
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

const PairGrid: React.FC<PairGridProps> = ({ sessionToken }) => {
  const [pairData, setPairData] = useState<Record<string, PairData>>({});
  const [selectedPairs, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { isConnected, subscribeToBoxSlices, unsubscribeFromBoxSlices } =
    useWebSocket();

  // Load selected pairs from localStorage and initialize
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

    // Subscribe to selected pairs
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

    // Cleanup function
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

    // Remove pair data if unselected
    if (wasSelected) {
      setPairData((prev) => {
        const newData = { ...prev };
        delete newData[pair];
        return newData;
      });
    }
  };

  // Add connection status indicator
  const connectionStatus = (
    <div className="mb-4">
      <p
        className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}
      >
        {isConnected ? '● Connected' : '● Disconnected'}
      </p>
    </div>
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {connectionStatus}
      <div className="mb-4 rounded border p-4">
        <h3 className="mb-2 text-lg font-semibold">Select Pairs to Display</h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_PAIRS.map((pair) => (
            <button
              key={pair}
              onClick={() => togglePair(pair)}
              className={`rounded px-3 py-1 ${
                selectedPairs.includes(pair)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {pair.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {selectedPairs.map((pair) => {
          // Only render if we have data for this pair
          const data = pairData[pair];
          if (!data?.boxes?.length) return null;

          return data.boxes.map((boxSlice, index) => (
            <PairCard
              key={`${pair}-${index}`}
              pair={pair}
              boxSlice={boxSlice}
              currentOHLC={data.currentOHLC}
            />
          ));
        })}
      </div>
    </div>
  );
};

export default PairGrid;
