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

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/signin');
    }

    console.log('Fetching initial data in page.tsx');
    const initialData = await getBoxSlices('USD_JPY');
    console.log(`Initial data fetched: ${initialData.length} items`);

    const slicedInitialData = initialData.slice(-500);

    return (
      <div className="w-full">
        <DashboardClient initialData={slicedInitialData} />
      </div>
    );
  } catch (error: any) {
    if (error.status === 429) {
      console.error('Rate limit reached:', error);
      return <div>Too many requests. Please try again later.</div>;
    }
    console.error('An error occurred:', error);
    return <div>An error occurred. Please try again later.</div>;
  }
}
