'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { AdminSidebar } from '@/components/AdminSidebar';
import { PairResoBox } from './PairResoBox';
import { RightSidebar } from '@/components/RightSidebar';

const fetchCandles = async (pair: string, limit: number, token: string) => {
    const response = await fetch(`/api/getCandles?pair=${pair}&limit=${limit}&token=${token}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { data } = await response.json();
    return data;
};

const fetchPairBoxSlices = async (pair: string, count: number, token: string) => {
    const response = await fetch(`/api/getBoxSlice?pair=${pair}&token=${token}&count=${count}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
};

const useFetchState = <T,>(initialState: T | null = null) => {
    const [data, setData] = useState<T | null>(initialState);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFetch = async (fetchFn: () => Promise<T>) => {
        setIsLoading(true);
        setError('');
        try {
            const result = await fetchFn();
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, handleFetch, setData };
};

const boxColors = {
    positive: '#00ff00',
    negative: '#ff0000',
    styles: {
        startIndex: 0,
        maxBoxCount: 38,
        showLineChart: false,
        globalTimeframeControl: false,
        borderRadius: 0,
        shadowIntensity: 0.5,
        opacity: 0.5,
        showBorder: true,
    },
} as const;

export default function AdminPage() {
    const { session } = useAuth();
    const { isConnected, selectedPairs } = useDashboard();
    const { priceData } = useWebSocket();
    const { pairData } = useDashboard();
    const [selectedPair, setSelectedPair] = useState<string | null>(null);
    const [boxCount, setBoxCount] = useState(500);
    const [limit, setLimit] = useState(100);
    const [isChronological, setIsChronological] = useState(false);
    const { data: candles, error, isLoading, handleFetch: fetchWithState } = useFetchState<any[]>([]);
    const { data: pairBoxSlices, handleFetch: fetchBoxSlicesWithState } = useFetchState<any>(null);

    const handleFetchCandles = async (candleLimit: number) => {
        if (!session?.access_token || !selectedPair) return;
        await fetchWithState(() => fetchCandles(selectedPair, candleLimit, session.access_token));
    };

    const handleFetchBoxSlices = async () => {
        if (!session?.access_token || !selectedPair) return;
        const data = await fetchBoxSlicesWithState(() => fetchPairBoxSlices(selectedPair, boxCount, session.access_token));
        console.log(`Received ${data.length} box slices for ${selectedPair}`);
    };

    useEffect(() => {
        if (session?.access_token && selectedPair) {
            handleFetchCandles(limit).catch(console.error);
            handleFetchBoxSlices().catch(console.error);
        }
    }, [session, selectedPair]);

    return (
        <div className='flex'>
            <AdminSidebar priceData={priceData} selectedPairs={selectedPairs} onPairSelect={setSelectedPair} selectedPair={selectedPair} />
            <div className='ml-[300px] min-h-screen flex-1 bg-black p-4 text-white lg:mr-[400px]'>
                <div className='mb-4 flex items-center justify-between overflow-y-auto rounded border border-[#181818] p-2'>
                    <h1 className='text-xl font-bold'>Trading Dashboard</h1>
                    <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>

                <div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                    {selectedPairs.map((pair) => {
                        const boxData = pairData[pair]?.boxes?.[0] || null;
                        const currentOHLC = pairData[pair]?.currentOHLC;

                        return (
                            <div key={pair} className='flex aspect-square flex-col rounded border border-[#181818] bg-[#0a0a0a]'>
                                <div className='relative flex-1'>
                                    <PairResoBox pair={pair} boxSlice={boxData} currentOHLC={currentOHLC} boxColors={boxColors} isLoading={false} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <RightSidebar
                selectedPair={selectedPair}
                candles={candles}
                isLoading={isLoading}
                error={error}
                limit={limit}
                setLimit={setLimit}
                isChronological={isChronological}
                setIsChronological={setIsChronological}
                handleFetchCandles={handleFetchCandles}
                pairBoxSlices={pairBoxSlices}
                handleFetchBoxSlices={handleFetchBoxSlices}
            />
        </div>
    );
}
