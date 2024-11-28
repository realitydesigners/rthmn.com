import React from 'react';
import PatternCard from '@/components/PatternCard';
import styles from './styles.module.css';
import { Signal } from '@/types/types';
import { useSignals } from '@/providers/SignalProvider/client';

const BoxGrid: React.FC = () => {
  const { signalsData } = useSignals();

  return (
    <div className={styles.grid}>
      {signalsData ? (
        signalsData.map((signal) => (
          <PatternCard key={signal.id} signal={signal} />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default BoxGrid;
