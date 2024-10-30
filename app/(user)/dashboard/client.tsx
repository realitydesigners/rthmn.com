'use client';

import React, { useState } from 'react';
import SettingsBar from '@/components/SettingsBar';
import BoxGrid from '@/components/BoxGrid';
import PatternModal from '@/components/PatternModal';
import styles from './Dashboard.module.css';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <div className={styles.dashboard}>
      <SettingsBar
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
      <div className={styles.contentContainer}>{children}</div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className={styles.contentContainer}>
        <BoxGrid />
        <PatternModal />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
