import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { oxanium } from '@/app/fonts';
import HistogramBox from './HistogramBox';

interface Box {
  high: number;
  low: number;
  value: number;
  size: number;
}

interface BoxSlice {
  timestamp: string;
  boxes: Box[];
}

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
    console.log('Raw data from server:', JSON.stringify(data, null, 2));
    return data;
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
  console.log(
    'Actual data for HistogramBox:',
    JSON.stringify(actualData, null, 2)
  );

  return (
    <div className={`w-full sm:px-6 lg:px-8 ${oxanium.className}`}>
      <h1 className="mb-6 pt-32 text-3xl font-bold">Trading Dashboard</h1>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          Box Slices Histogram (USD_JPY)
        </h2>
        <p className="mb-2">Total Box Slices: {actualData.length}</p>
        <div className="fixed bottom-0 w-full">
          <HistogramBox data={actualData} isLoading={false} />
        </div>
      </div>
    </div>
  );
}
