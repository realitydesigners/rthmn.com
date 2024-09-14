import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { oxanium } from '@/app/fonts';

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

  // Mock data for trading algorithm stats
  const algorithmStats = {
    totalTrades: 1250,
    winRate: 68.5,
    profitFactor: 2.3,
    sharpeRatio: 1.8,
    maxDrawdown: 12.5
  };

  // Mock data for recent trades
  const recentTrades = [
    { id: 1, pair: 'BTC/USD', type: 'Long', profit: 250, date: '2023-05-01' },
    { id: 2, pair: 'ETH/USD', type: 'Short', profit: -120, date: '2023-05-02' },
    { id: 3, pair: 'XRP/USD', type: 'Long', profit: 80, date: '2023-05-03' }
  ];

  return (
    <div
      className={`mx-auto max-w-7xl px-4 py-8 pt-24 text-white sm:px-6 lg:px-8 ${oxanium.className}`}
    >
      {/* <h1 className="mb-6 text-3xl font-bold">Trading Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-gray-800 p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Account Info</h2>
          <p>Email: {user.email}</p>
          <p>Subscription: {subscriptionData?.status || 'None'}</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Algorithm Performance</h2>
          <p>Total Trades: {algorithmStats.totalTrades}</p>
          <p>Win Rate: {algorithmStats.winRate}%</p>
          <p>Profit Factor: {algorithmStats.profitFactor}</p>
          <p>Sharpe Ratio: {algorithmStats.sharpeRatio}</p>
          <p>Max Drawdown: {algorithmStats.maxDrawdown}%</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Recent Trades</h2>
          <ul>
            {recentTrades.map((trade) => (
              <li
                key={trade.id}
                className={`mb-2 ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {trade.pair} - {trade.type} - ${Math.abs(trade.profit)} -{' '}
                {trade.date}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8 rounded-lg bg-gray-800 p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Trading Controls</h2>
        <div className="flex space-x-4">
          <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
            Start Algorithm
          </button>
          <button className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600">
            Stop Algorithm
          </button>
          <button className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600">
            View Detailed Reports
          </button>
        </div>
      </div> */}
    </div>
  );
}
