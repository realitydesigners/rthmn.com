'use server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DashboardProviderClient } from './client';
import { PairData } from '@/types/types';

async function fetchBoxData(pairs: string[]) {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
                cookieStore.set(name, value, options);
            },
            remove(name: string, options: any) {
                cookieStore.set(name, '', { ...options, maxAge: 0 });
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { boxData: {} };
    }

    const boxData: Record<string, PairData> = {};
    for (const pair of pairs) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boxslice/${pair}`, {
            headers: {
                Authorization: `Bearer ${user.id}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data?.[0]) {
                boxData[pair] = {
                    boxes: [data.data[0]],
                    currentOHLC: data.data[0].currentOHLC,
                };
            }
        }
    }

    return { boxData };
}

async function fetchSignalsServer() {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
                cookieStore.set(name, value, options);
            },
            remove(name: string, options: any) {
                cookieStore.set(name, '', { ...options, maxAge: 0 });
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { signalsData: null };
    }

    const { data: signalsData, error: signalsError } = await supabase.from('signals').select('*').order('created_at', { ascending: false }).limit(20);

    if (signalsError) {
        console.error('Error fetching signals:', signalsError);
        return { signalsData: null };
    }

    return { signalsData };
}

const DEFAULT_PAIRS = ['GBPUSD', 'USDJPY', 'AUDUSD'];

export default async function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { signalsData } = await fetchSignalsServer();
    const { boxData } = await fetchBoxData(DEFAULT_PAIRS);

    return (
        <DashboardProviderClient initialSignalsData={signalsData} initialBoxData={boxData}>
            {children}
        </DashboardProviderClient>
    );
}
