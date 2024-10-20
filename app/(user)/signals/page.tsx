'use client';

import type { Signal } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { createClient } from '@/utils/supabase/client';

export default function SignalsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [signalsData, setSignalsData] = useState<Signal[] | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/signin');
    }
  }, [session, router]);

  useEffect(() => {
    const checkSubscriptionAndFetchSignals = async () => {
      if (!session?.user) return;

      const supabase = createClient();

      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

      if (subscriptionError) {
        console.error('Error checking subscription:', subscriptionError);
        setHasSubscription(false);
        return;
      }

      setHasSubscription(!!subscriptionData);

      // Fetch signals data regardless of subscription status
      const { data: signalsData, error: signalsError } = await supabase
        .from('signals')
        .select('*');

      if (signalsError) {
        console.error('Error fetching signals:', signalsError);
      } else {
        setSignalsData(signalsData);
      }
    };

    checkSubscriptionAndFetchSignals();
  }, [session]);

  if (!session || hasSubscription === null) {
    return <div>Loading...</div>;
  }

  function SubscriptionPrompt() {
    return (
      <div className="mt-10 text-center">
        <h2 className="mb-4 text-2xl font-bold">Subscription Required</h2>
        <p className="mb-6">You need an active subscription to view signals.</p>
        <Link
          href="/subscribe"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Get Subscription
        </Link>
      </div>
    );
  }

  return (
    <div>
      {!hasSubscription && <SubscriptionPrompt />}
      {signalsData ? (
        <div className="min-h-screen bg-black p-6 font-mono text-white">
          {signalsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-lg bg-black text-xs shadow-lg">
                <thead className="bg-black">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Pair
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Pattern Type
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Pattern
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Start Price
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      End Price
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Stop Loss
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Take Profit
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Start Time
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      End Time
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-300">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181818]">
                  {signalsData.map((signal: Signal) => {
                    const patternInfo =
                      typeof signal.pattern_info === 'string'
                        ? JSON.parse(signal.pattern_info)
                        : signal.pattern_info;
                    const boxes =
                      typeof signal.boxes === 'string'
                        ? JSON.parse(signal.boxes)
                        : signal.boxes;
                    return (
                      <tr key={signal.id} className="hover:bg-[#181818]">
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.pair}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.pattern_type}
                        </td>
                        <td className="px-3 py-2 text-gray-300">
                          {patternInfo && (
                            <div className="space-y-1">
                              <p className="text-[10px]">
                                {Array.isArray(patternInfo.pattern)
                                  ? `[${patternInfo.pattern.join(', ')}]`
                                  : 'N/A'}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.status}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.start_price
                            ? signal.start_price.toFixed(4)
                            : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.end_price
                            ? signal.end_price.toFixed(4)
                            : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.stop_loss
                            ? signal.stop_loss.toFixed(4)
                            : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.take_profit
                            ? signal.take_profit.toFixed(4)
                            : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.start_time
                            ? new Date(signal.start_time).toLocaleString()
                            : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {signal.end_time
                            ? new Date(signal.end_time).toLocaleString()
                            : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-300">
                          {new Date(signal.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No signals available.</div>
          )}
        </div>
      ) : (
        <div>Loading signals data...</div>
      )}
    </div>
  );
}
