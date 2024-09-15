import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { oxanium } from '@/app/fonts';

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

  return (
    <div
      className={`mx-auto max-w-7xl px-4 py-8 pt-24 text-white sm:px-6 lg:px-8 ${oxanium.className}`}
    >
      <h1 className="mb-6 text-3xl font-bold">Trading Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-gray-800 p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            Box Slices Data (USD_JPY)
          </h2>
          {boxSlicesData[0] ? (
            <div>
              <p className="mb-2">
                Timestamp:{' '}
                {new Date(boxSlicesData[0].timestamp).toLocaleString()}
              </p>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Current OHLC</h3>
                  <p>Open: {boxSlicesData[0].currentOHLC.open}</p>
                  <p>High: {boxSlicesData[0].currentOHLC.high}</p>
                  <p>Low: {boxSlicesData[0].currentOHLC.low}</p>
                  <p>Close: {boxSlicesData[0].currentOHLC.close}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Boxes</h3>
                  <p>Total: {boxSlicesData[0].boxes.length}</p>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Box Details (Top 5)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2">Size</th>
                      <th className="px-4 py-2">High</th>
                      <th className="px-4 py-2">Low</th>
                      <th className="px-4 py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boxSlicesData[0].boxes.slice(0, 5).map((box, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? 'bg-gray-600' : 'bg-gray-700'
                        }
                      >
                        <td className="px-4 py-2">{box.size}</td>
                        <td className="px-4 py-2">{box.high}</td>
                        <td className="px-4 py-2">{box.low}</td>
                        <td className="px-4 py-2">{box.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {boxSlicesData[0].boxes.length > 5 && (
                <p className="mt-2 text-sm text-gray-400">
                  (Showing top 5 boxes out of {boxSlicesData[0].boxes.length})
                </p>
              )}
            </div>
          ) : (
            <p>No box slices data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
