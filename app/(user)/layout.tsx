import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { Providers } from '@/providers/Providers';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { RightSidebar } from '@/components/RightSidebar';
import { LeftSidebar } from '@/components/LeftSidebar';
import { NavbarSignedIn } from '@/components/NavbarSignedIn';

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
            <div className='relative flex min-h-screen'>
                <NavbarSignedIn user={user} />
                <main className='flex-1 transition-[margin] duration-300 ease-in-out'>{children}</main>
                <LeftSidebar />
                <RightSidebar />
                <DashboardNavigation />
            </div>
        </Providers>
    );
}
