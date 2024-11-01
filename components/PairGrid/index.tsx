import React from 'react';
import PairCard from '@/components/PairCard';
import styles from './styles.module.css';
import { useDashboard } from '@/providers/DashboardProvider';

const PairGrid: React.FC = () => {
  const { pairData, selectedPairs, isLoading } = useDashboard();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className={styles.grid}>
      {selectedPairs.map((pair) => {
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
  );
};

export default PairGrid;
