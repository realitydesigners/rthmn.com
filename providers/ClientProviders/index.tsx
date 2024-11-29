'use client';
import { DashboardProvider } from '../DashboardProvider';
import { WebSocketProvider } from '../WebsocketProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <DashboardProvider>{children}</DashboardProvider>
    </WebSocketProvider>
  );
}
