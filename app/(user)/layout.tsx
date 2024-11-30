import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { QueryProvider } from '@/providers/QueryProvider';
import { SignalProvider } from '@/providers/SignalProvider';
import { ClientProviders } from '@/providers/ClientProviders';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { NavbarSignedIn } from '@/components/Accessibility/NavbarSignedIn';

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
        <ClientProviders>
          <NavbarSignedIn user={user} />
          <DashboardSidebar />
          <div className="ml-14">{children}</div>
        </ClientProviders>
      </SignalProvider>
    </QueryProvider>
  );
}
