import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { oxanium } from '@/app/fonts';
import HistogramBox from './HistogramBox';
import HistogramLine from './HistogramLine';
import { BoxSlice } from '@/types';

const isActualData = (slice: BoxSlice): boolean =>
  slice.boxes.some((box) => box.high !== 1);

const extractActualData = (data: BoxSlice[] | unknown): BoxSlice[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(isActualData);
};

const getBoxSlices = async (pair: string): Promise<BoxSlice[]> => {
  try {
    const response = await fetch(`http://localhost:8080/boxslices/${pair}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching box slices:', error);
    return [];
  }
};

const limitBoxSlices = (data: BoxSlice[], limit: number): BoxSlice[] => {
  return data.slice(0, limit);
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

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (subscriptionError) {
    console.error('Error fetching subscription data:', subscriptionError);
  }

  const boxSlicesData = await getBoxSlices('USD_JPY');
  const actualData = extractActualData(boxSlicesData);
  const limitedData = limitBoxSlices(actualData, 5000);

  return (
    <div className={`w-full sm:px-6 lg:px-8 ${oxanium.className}`}>
      <h1 className="mb-6 pt-32 text-3xl font-bold">Trading Dashboard</h1>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          Box Slices Histogram (USD_JPY)
        </h2>
        <p className="mb-2">Total Box Slices: {limitedData.length}</p>
        <div className="mt-6 h-[400px] pr-[300px]">
          <HistogramLine data={limitedData} />
        </div>
      </div>
    </div>
  );
}
