import { QueryProvider } from '@/providers/QueryProvider';
import { SignalProvider } from '@/providers/SignalProvider';

export default function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <SignalProvider>{children}</SignalProvider>
    </QueryProvider>
  );
}
