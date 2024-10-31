'use client';

import React, { useState } from 'react';
import SettingsBar from '@/components/SettingsBar';
import PairGrid from '@/components/PairGrid';
import { useAuth } from '@/providers/SupabaseProvider';
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
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { session } = useAuth();

  return (
    <DashboardLayout>
      <div className={styles.contentContainer}>
        {session?.access_token ? (
          <PairGrid sessionToken={session.access_token} />
        ) : (
          <p>Loading session...</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
