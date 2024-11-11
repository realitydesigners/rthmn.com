import React from 'react';
import { useDashboard } from '@/providers/DashboardProvider';
import styles from './styles.module.css';

const ConnectionBar: React.FC = () => {
  const { isConnected } = useDashboard();

  return (
    <div className={styles.connectionBar}>
      <div className={styles.status}>
        <span
          className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}
        >
          ●
        </span>
        <span className={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default ConnectionBar;
