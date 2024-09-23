import { SignalProvider } from '@/contexts/SignalProvider';

export default function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalProvider>
      <div className="h-screen w-full">{children}</div>
    </SignalProvider>
  );
}
