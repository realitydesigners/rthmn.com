import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { SidebarRight } from '@/components/SidebarRight';
import { SidebarLeft } from '@/components/SidebarLeft';
import { NavbarSignedIn } from '@/components/NavbarSignedIn';
import { WebSocketProvider } from '@/providers/WebsocketProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { DashboardProvider } from '@/providers/DashboardProvider/client';
import { NavbarPublic } from '@/components/NavbarPublic';
import { headers } from 'next/headers';

interface UserLayoutProps {
    children: React.ReactNode;
    modal: React.ReactNode;
}

export default async function UserLayout({ children, modal }: UserLayoutProps) {
    const supabase = await createClient();
    const user = await getUser(supabase);
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    const isPairPage = pathname.includes('pair/');

    if (!isPairPage && !user) {
        redirect('/signin');
    }

    if (isPairPage && !user) {
        return (
            <QueryProvider>
                <WebSocketProvider>
                    <DashboardProvider initialSignalsData={[]} initialBoxData={{}}>
                        <div id='app-container' className='min-h-screen bg-black'>
                            <NavbarPublic />
                            <main className='w-full bg-black pt-16 transition-all duration-300 ease-in-out'>{children}</main>
                        </div>
                    </DashboardProvider>
                </WebSocketProvider>
            </QueryProvider>
        );
    }

    const subscription = await getSubscription(supabase);
    if (!subscription) {
        redirect('/pricing');
    }

    return (
        <QueryProvider>
            <WebSocketProvider>
                <DashboardProvider initialSignalsData={[]} initialBoxData={{}}>
                    <div id='app-container'>
                        <NavbarSignedIn user={user} />
                        <main className='w-full bg-black transition-all duration-300 ease-in-out'>{children}</main>
                        <SidebarLeft />
                        <SidebarRight />
                        <DashboardNavigation />
                        {modal}
                    </div>
                </DashboardProvider>
            </WebSocketProvider>
        </QueryProvider>
    );
}
