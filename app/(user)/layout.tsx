import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { Providers } from '@/providers/Providers';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { BackgroundGrid } from '@/components/BackgroundGrid';
import { Sidebar } from '@/components/Sidebar';

export default async function UserLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    const supabase = await createClient();
    const [user, subscription] = await Promise.all([getUser(supabase), getSubscription(supabase)]);

    if (!user) {
        redirect('/signin');
    }

    if (!subscription) {
        redirect('/pricing');
    }

    return (
        <Providers>
            <BackgroundGrid>
                <div className='relative flex min-h-screen'>
                    <main className='flex-1 transition-[margin] duration-300 ease-in-out'>
                        {children}
                        {modal}
                    </main>
                    <Sidebar />
                    <DashboardNavigation />
                </div>
            </BackgroundGrid>
        </Providers>
    );
}
