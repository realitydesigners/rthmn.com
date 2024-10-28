'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import BoxGrid from '@/components/BoxGrid';

// Separate layout component that handles the collapsible sidebar
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <div
      className="dashboard"
      style={{
        marginTop: '100px',
        marginBottom: '100px',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: `${isMenuOpen ? '200px' : '50px'} 1fr`
      }}
    >
      <Sidebar
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
      {children}
    </div>
  );
};

// Main content component that won't re-render when sidebar state changes
const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="content-container" style={{ overflowY: 'auto' }}>
        <h1>Main Content</h1>
        <p>This is the main content area.</p>
        <BoxGrid />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
