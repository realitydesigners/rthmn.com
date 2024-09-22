import { SignalProvider } from '@/contexts/SignalProvider';
import { SignalSidebar } from '@/components/SignalSidebar';

export default function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalProvider>
      <div className="flex w-full bg-red-400 p-2">
        {/* <SignalSidebar /> */}
        {children}
      </div>
    </SignalProvider>
  );
}
