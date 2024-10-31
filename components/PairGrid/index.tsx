import React, { useEffect, useState } from 'react';
import PairCard from '@/components/PairCard';
import styles from './styles.module.css';
import { getLatestBoxSlices } from '@/utils/boxSlices';
import { BoxSlice, PairData } from '@/types';

interface PairGridProps {
  sessionToken: string;
}

const PairGrid: React.FC<PairGridProps> = ({ sessionToken }) => {
  const [pairData, setPairData] = useState<Record<string, PairData>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoxSlices = async () => {
      try {
        const data = await getLatestBoxSlices(sessionToken);
        console.log('Fetched data:', data);

        setPairData(data);
      } catch (err) {
        console.error('Error fetching latest box slices:', err);
        setError('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    const interval = setInterval(fetchBoxSlices, 10000);
    fetchBoxSlices();

    return () => clearInterval(interval);
  }, [sessionToken]);

  return (
    <div className={styles.grid}>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        Object.entries(pairData).map(([pair, data]) => {
          console.log(`Rendering data for ${pair}:`, data);
          return data.boxes.map((boxSlice, index) => (
            <PairCard
              key={`${pair}-${index}`}
              pair={pair}
              boxSlice={boxSlice}
              currentOHLC={data.currentOHLC}
            />
          ));
        })
      )}
    </div>
  );
};

export default PairGrid;
