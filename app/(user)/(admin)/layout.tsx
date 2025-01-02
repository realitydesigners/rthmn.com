import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

const AUTHORIZED_IDS = ['8ad039b3-d3a5-447b-bdda-80b9f854b0fe'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const user = await getUser(supabase);

    if (!user || !AUTHORIZED_IDS.includes(user.id)) {
        redirect('/dashboard');
    }

    return <>{children}</>;
}
