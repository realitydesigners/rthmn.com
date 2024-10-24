import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SignalProviderClient } from './SignalProviderClient';

async function fetchSignalsServer() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { signalsData: null, hasSubscription: false };
  }

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (subscriptionError) {
    console.error('Error checking subscription:', subscriptionError);
    return { signalsData: null, hasSubscription: false };
  }

  const hasSubscription = !!subscriptionData;

  const { data: signalsData, error: signalsError } = await supabase
    .from('signals')
    .select('*');

  if (signalsError) {
    console.error('Error fetching signals:', signalsError);
    return { signalsData: null, hasSubscription };
  }

  return { signalsData, hasSubscription };
}

export async function SignalProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { signalsData, hasSubscription } = await fetchSignalsServer();

  return (
    <SignalProviderClient
      initialSignalsData={signalsData}
      initialHasSubscription={hasSubscription}
    >
      {children}
    </SignalProviderClient>
  );
}
