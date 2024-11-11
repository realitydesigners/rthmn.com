'use client';
import React, { useState } from 'react';
import SettingsBar from '@/components/Accessibility/SettingsBar';
import PairGrid from '@/components/PairGrid';
import { useAuth } from '@/providers/SupabaseProvider';
import { DashboardProvider } from '@/providers/DashboardProvider';
import ConnectionBar from '@/components/Accessibility/ConnectionBar';
import styles from './Dashboard.module.css';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.dashboard}>
      <SettingsBar
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
      <div className={styles.contentContainer}>{children}</div>
      <ConnectionBar />
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { session } = useAuth();

  return (
    <DashboardProvider>
      <DashboardLayout>
        <div className={styles.contentContainer}>
          {session?.access_token ? <PairGrid /> : <p>Loading session...</p>}
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
};

export default Dashboard;
