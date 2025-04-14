import { redirect } from 'next/navigation';
import { AdminNavbar } from '@/app/(admin)/_components/AdminNavbar';
import { DashboardProvider } from '@/providers/DashboardProvider/client';
import { WebSocketProvider } from '@/providers/WebsocketProvider';
import { getUser } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import { AUTHORIZED_IDS } from '../tokens';
import { UserProvider } from '@/providers/UserProvider';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user || !AUTHORIZED_IDS.includes(user.id)) {
        redirect('/dashboard');
    }

    return (
        <WebSocketProvider>
            <UserProvider>
                <DashboardProvider>
                    <div id='app-container' className='relative min-h-screen overflow-y-auto'>
                        <AdminNavbar />
                        <main className='w-full bg-black transition-all duration-300 ease-in-out'>{children}</main>
                    </div>
                </DashboardProvider>
            </UserProvider>
        </WebSocketProvider>
    );
}
