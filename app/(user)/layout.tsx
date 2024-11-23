import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { QueryProvider } from '@/providers/QueryProvider';
import { SignalProvider } from '@/providers/SignalProvider';
import { ClientProviders } from '@/providers/ClientProviders';

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

  if (!subscription) {
    redirect('/pricing');
  }

  return (
    <QueryProvider>
      <SignalProvider>
        <ClientProviders>{children}</ClientProviders>
      </SignalProvider>
    </QueryProvider>
  );
}
