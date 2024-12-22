import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { SidebarRight } from '@/components/SidebarRight';
import { SidebarLeft } from '@/components/SidebarLeft';
import { BottomSidebar } from '@/components/BottomSidebar';
import { NavbarSignedIn } from '@/components/NavbarSignedIn';
import { WebSocketProvider } from '@/providers/WebsocketProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { DashboardProvider } from '@/providers/DashboardProvider/client';
import { BackgroundPerspectiveGrid } from '@/components/BackgroundPerspectiveGrid';

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
        <QueryProvider>
            <WebSocketProvider>
                <DashboardProvider initialSignalsData={[]}>
                    <BackgroundPerspectiveGrid />
                    <div id='app-container' className='relative min-h-screen overflow-y-auto'>
                        <NavbarSignedIn user={user} />
                        <main className='w-full transition-all duration-300 ease-in-out'>{children}</main>
                        <SidebarLeft />
                        <SidebarRight />
                        <BottomSidebar />
                        <DashboardNavigation />
                        {modal}
                    </div>
                </DashboardProvider>
            </WebSocketProvider>
        </QueryProvider>
    );
}
