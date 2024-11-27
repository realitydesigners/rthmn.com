'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DashboardProvider } from './DashboardProvider';
import { WebSocketProvider } from './WebSocketProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      <DashboardProvider>{children}</DashboardProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </WebSocketProvider>
  );
}
