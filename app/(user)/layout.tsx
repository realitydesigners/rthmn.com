import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { NavbarSignedIn } from '@/components/NavbarSignedIn';
import { SidebarLeft } from '@/components/SidebarLeft';
import { SidebarRight } from '@/components/SidebarRight';
import DashboardProvider from '@/providers/DashboardProvider/client';
import { QueryProvider } from '@/providers/QueryProvider';
import { WebSocketProvider } from '@/providers/WebsocketProvider';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';

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
            <WebSocketProvider>
                <DashboardProvider>
                    <div id='app-container' className='min-h-screen bg-black'>
                        <main className='h-screen w-full bg-black transition-all duration-300 ease-in-out'>{children}</main>
                    </div>
                </DashboardProvider>
            </WebSocketProvider>
        );
    }

    const subscription = await getSubscription(supabase);
    if (!subscription) {
        redirect('/pricing');
    }

    return (
        <WebSocketProvider>
            <DashboardProvider>
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
    );
}
