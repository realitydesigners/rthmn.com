import { DashboardProvider } from '../DashboardProvider';
import { WebSocketProvider } from '../WebsocketProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { SignalProvider } from '@/providers/SignalProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SignalProvider>
        <WebSocketProvider>
          <DashboardProvider>{children}</DashboardProvider>
        </WebSocketProvider>
      </SignalProvider>
    </QueryProvider>
  );
}
