import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { QueryProvider } from '@/providers/QueryProvider';
import { DashboardProvider } from '@/providers/DashboardProvider/client';
import { WebSocketProvider } from '@/providers/WebsocketProvider';
import { AdminNavbar } from '@/app/(admin)/_components/AdminNavbar';

const AUTHORIZED_IDS = [
    '8ad039b3-d3a5-447b-bdda-80b9f854b0fe',
    '1310dea3-9479-4d53-bf4d-3ede410e0d76',
    'c3d7587a-31ff-4aa8-9d98-be63b8f6d613',
    'd4034b80-3dfd-46ce-8f0b-bc86755e3672',
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user || !AUTHORIZED_IDS.includes(user.id)) {
        redirect('/dashboard');
    }

    return (
        <QueryProvider>
            <WebSocketProvider>
                <DashboardProvider initialSignalsData={[]} initialBoxData={{}}>
                    <div id='app-container' className='relative min-h-screen overflow-y-auto'>
                        <AdminNavbar />
                        <main className='w-full bg-black transition-all duration-300 ease-in-out'>{children}</main>
                    </div>
                </DashboardProvider>
            </WebSocketProvider>
        </QueryProvider>
    );
}
