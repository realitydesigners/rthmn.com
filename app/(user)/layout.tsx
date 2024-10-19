import { AppProviders } from '@/providers/AppProviders';
import { SignalProvider } from '@/providers/SignalProvider';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

export default function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <SignalProvider>
        <WebSocketProvider>
          <div className="h-screen w-full">{children}</div>
        </WebSocketProvider>
      </SignalProvider>
    </AppProviders>
  );
}
