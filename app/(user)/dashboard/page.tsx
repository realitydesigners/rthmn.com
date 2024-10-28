import React from 'react';
import Dashboard from './client';

const DashboardPage: React.FC = () => {
  // You can perform server-side logic or data fetching here if needed

  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
/**
 * Dashboard Data Flow Architecture
 *
 * Server Component Layer:
 * - Initial data fetching
 * - Optimized page load
 *
 * Provider Layer (SignalProvider):
 * - Global signal state management
 * - WebSocket real-time updates
 * - React Query data caching
 *
 * Client Layer (BoxGrid):
 * - Signal display & interactions
 * - Infinite scroll pagination
 * - Modal detail views
 *
 * Data Flow:
 * 1. Server fetches initial signals
 * 2. WebSocket maintains live feed
 * 3. React Query handles background updates
 *
 * Benefits:
 * - Fast initial load
 * - Efficient real-time updates
 * - Clean architecture
 * - Scalable design
 */
