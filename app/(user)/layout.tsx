import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardNavigation } from '@/components/Navbars/DashboardNavigation';
import { NavbarSignedIn } from '@/components/Navbars/NavbarSignedIn';
import { SidebarLeft } from '@/components/Sidebars/SidebarLeft';
import { SidebarRight } from '@/components/Sidebars/SidebarRight';
import { DashboardProvider } from '@/providers/DashboardProvider/client';
import { QueryProvider } from '@/providers/QueryProvider';
import { UserProvider } from '@/providers/UserProvider';
import { WebSocketProvider } from '@/providers/WebsocketProvider';
import { getSubscription, getUser } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';

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
                <UserProvider>
                    <DashboardProvider>
                        <div id='app-container' className='min-h-screen bg-black'>
                            <main className='h-screen w-full bg-black transition-all duration-300 ease-in-out'>{children}</main>
                        </div>
                    </DashboardProvider>
                </UserProvider>
            </WebSocketProvider>
        );
    }

    const subscription = await getSubscription(supabase);
    if (!subscription) {
        redirect('/pricing');
    }

    return (
        <WebSocketProvider>
            <UserProvider>
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
            </UserProvider>
        </WebSocketProvider>
    );
}
