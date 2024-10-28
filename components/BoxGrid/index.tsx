import React from 'react';
import ShiftedBox from '@/components/Reso/Shifted';
import styles from './styles.module.css';

const BoxGrid: React.FC = () => (
  <div className={styles.grid}>
    {[...Array(9)].map((_, index) => (
      <ShiftedBox key={index} slice={null} isLoading={false} />
    ))}
  </div>
);

export default BoxGrid;
