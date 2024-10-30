import React from 'react';
import { useSignals } from '@/providers/SignalProviderClient';
import styles from './PatternModal.module.css';

const PatternModal: React.FC = () => {
  const { selectedSignal, setSelectedSignal } = useSignals();

  if (!selectedSignal) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={() => setSelectedSignal(null)}>
          &times;
        </span>
        <h2>{selectedSignal.pair}</h2>
        <p>Pattern Type: {selectedSignal.pattern_type}</p>
        {/* Add more detailed information here */}
      </div>
    </div>
  );
};

export default PatternModal;
