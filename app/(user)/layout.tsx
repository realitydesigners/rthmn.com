import { QueryProvider } from '@/providers/QueryProvider';
import { SignalProvider } from '@/providers/SignalProvider';
import { WebSocketProvider } from '@/providers/WebSocketProvider';


export default async function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <SignalProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </SignalProvider>
    </QueryProvider>
  );
}
