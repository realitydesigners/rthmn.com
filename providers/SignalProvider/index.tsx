import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SignalProviderClient } from './client';

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
    return { signalsData: null };
  }

  const { data: signalsData, error: signalsError } = await supabase
    .from('signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (signalsError) {
    console.error('Error fetching signals:', signalsError);
    return { signalsData: null };
  }

  return { signalsData };
}

export async function SignalProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { signalsData } = await fetchSignalsServer();

  return (
    <SignalProviderClient initialSignalsData={signalsData}>
      {children}
    </SignalProviderClient>
  );
}
