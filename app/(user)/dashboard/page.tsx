import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { oxanium } from '@/app/fonts';
import HistogramBox from './HistogramBox';

async function getBoxSlices(pair: string) {
  try {
    const response = await fetch(`http://localhost:8080/boxslices/${pair}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching box slices:', error);
    return { status: 'error', message: 'Failed to fetch box slices' };
  }
}

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
  console.log('Box Slices Data:', JSON.stringify(boxSlicesData, null, 2));
  console.log(`Number of box slices: ${boxSlicesData.length}`);

  return (
    <div className={`w-full sm:px-6 lg:px-8 ${oxanium.className}`}>
      <h1 className="mb-6 text-3xl font-bold">Trading Dashboard</h1>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          Box Slices Histogram (USD_JPY)
        </h2>
        <p className="mb-2">Total Box Slices: {boxSlicesData.length}</p>
        <HistogramBox data={boxSlicesData} isLoading={false} />
      </div>
    </div>
  );
}
