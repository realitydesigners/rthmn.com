import { SignalProvider } from '@/contexts/SignalProvider';
import { SignalSidebar } from '@/components/SignalSidebar';

export default function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalProvider>
      <div className="flex">
        <SignalSidebar />
        {children}
      </div>
    </SignalProvider>
  );
}
