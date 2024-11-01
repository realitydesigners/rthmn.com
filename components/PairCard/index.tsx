import React from 'react';
import ShiftedBox from '@/components/Reso/Shifted';
import { BoxSlice, OHLC } from '@/types';
import styles from './styles.module.css';

type PairCardProps = {
  pair: string;
  boxSlice: BoxSlice;
  currentOHLC: OHLC;
};

const PairCard: React.FC<PairCardProps> = ({ pair, boxSlice, currentOHLC }) => {
  const closePrice = currentOHLC?.close || 'N/A';

  return (
    <div className={styles.card}>
      {/* Top Container */}
      <div className={styles.header}>
        <div className={styles.pairName}>{pair.toUpperCase()}</div>
        <div className={styles.price}>{closePrice}</div>
      </div>

      {/* Middle Container */}
      <div className={styles.boxContainer}>
        <ShiftedBox slice={boxSlice} isLoading={false} />
      </div>
    </div>
  );
};

export default PairCard;
