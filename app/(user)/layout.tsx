import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { Providers } from '@/providers/Providers';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { BackgroundGrid } from '@/components/BackgroundGrid';

export default async function UserLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
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
    <Providers>
      <BackgroundGrid>
        <div>
          {children}
          {modal}
        </div>
        <DashboardNavigation />
      </BackgroundGrid>
    </Providers>
  );
}
