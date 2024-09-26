import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { getBoxSlices } from '@/app/utils/getBoxSlices';

export default async function Dashboard() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch only the last 250 items
  const initialData = await getBoxSlices('USD_JPY', undefined, 250);
  console.log('Initial data length:', initialData.length);

  return (
    <div className="w-full">
      <DashboardClient initialData={initialData} />
    </div>
  );
}
