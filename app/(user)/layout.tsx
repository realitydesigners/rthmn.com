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
        <main className="ml-[300px] flex-1">{children}</main>
      </div>
    </SignalProvider>
  );
}
