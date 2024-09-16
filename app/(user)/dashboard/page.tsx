import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BoxSlice } from '@/types';
import DashboardClient from './DashboardClient';

const getBoxSlices = async (pair: string): Promise<BoxSlice[]> => {
  try {
    const response = await fetch(`http://localhost:8080/boxslices/${pair}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data
      .filter((slice: BoxSlice) => slice.boxes.some((box) => box.high !== 1))
      .slice(0, 10000);
  } catch (error) {
    console.error('Error fetching box slices:', error);
    return [];
  }
};

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

  const initialData = await getBoxSlices('USD_JPY');

  return <DashboardClient initialData={initialData} />;
}
