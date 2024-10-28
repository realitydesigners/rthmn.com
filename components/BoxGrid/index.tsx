import React, { useEffect, useState } from 'react';
import PatternCard from '@/components/PatternCard';
import styles from './styles.module.css';
import { Signal } from '@/types';

// Function to generate mock signal data
const generateMockSignalsData = (count: number): Signal[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: (index + 1).toString(),
    pair: 'BTC/USD',
    pattern_type: 'Bullish',
    status: 'active',
    start_price: 50000,
    end_price: null,
    stop_loss: 49000,
    take_profit: 52000,
    start_time: '2023-10-01T00:00:00Z',
    end_time: null,
    created_at: '2023-10-01T00:00:00Z',
    pattern_info: 'Bullish engulfing pattern',
    boxes: '[]'
  }));
};

// Generate 30 mock signals
const mockSignalsData: Signal[] = generateMockSignalsData(30);

const BoxGrid: React.FC = () => {
  const [signalsData, setSignalsData] = useState<Signal[] | null>(null);

  useEffect(() => {
    // Use mock data instead of fetching from server
    setSignalsData(mockSignalsData);

    // Optionally, set up a polling mechanism or WebSocket connection here
    // to update signalsData in real-time.
  }, []);

  return (
    <div className={styles.grid}>
      {signalsData ? (
        signalsData.map((signal, index) => (
          <PatternCard key={index} signal={signal} />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default BoxGrid;
