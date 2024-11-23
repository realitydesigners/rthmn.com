'use client';
import { DashboardProvider } from './DashboardProvider';
import { WebSocketProvider } from './WebSocketProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </WebSocketProvider>
  );
}
