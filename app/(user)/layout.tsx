import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { QueryProvider } from '@/providers/QueryProvider';
import { SignalProvider } from '@/providers/SignalProvider';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

export default async function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    redirect('/signin');
  }

  // This will be replaced with /pricing page once finished
  if (!subscription) {
    redirect('/');
  }

  return (
    <QueryProvider>
      <SignalProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </SignalProvider>
    </QueryProvider>
  );
}
