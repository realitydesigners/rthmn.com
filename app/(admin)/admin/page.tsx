'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { ResoBox } from '@/components/ResoBox';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
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

const fetchLatestBoxSlices = async (token: string, count: number) => {
    const response = await fetch(`/api/getLatestBoxSlices?token=${token}&count=${count}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
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

const CollapsiblePanel = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className='rounded border border-[#181818]'>
            <button onClick={() => setIsOpen(!isOpen)} className='hover:/40 flex w-full items-center justify-between rounded-t p-2'>
                <h3 className='font-medium text-gray-300'>{title}</h3>
                {isOpen ? <IoChevronUp className='h-4 w-4 text-gray-400' /> : <IoChevronDown className='h-4 w-4 text-gray-400' />}
            </button>
            {isOpen && <div className='border-t border-[#181818] p-2'>{children}</div>}
        </div>
    );
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

const PairPanel = React.memo(({ pair }: { pair: string }) => {
    const { session } = useAuth();
    const { pairData } = useDashboard();
    const [limit, setLimit] = useState(100);
    const [isChronological, setIsChronological] = useState(false);
    const [boxCount, setBoxCount] = useState<number>(500);
    const { data: candles, error, isLoading, handleFetch: fetchWithState } = useFetchState<any[]>([]);
    const { data: pairBoxSlices, handleFetch: fetchBoxSlicesWithState } = useFetchState<any>(null);

    const boxData = pairData[pair]?.boxes?.[0] || null;
    const currentOHLC = pairData[pair]?.currentOHLC;

    const displayCandles = isChronological ? [...(candles || [])].reverse() : candles;

    const handleFetchCandles = async (candleLimit: number) => {
        if (!session?.access_token) {
            throw new Error('No authentication token available');
        }
        await fetchWithState(() => fetchCandles(pair, candleLimit, session.access_token));
    };

    const handleFetchBoxSlices = async () => {
        if (!session?.access_token) {
            throw new Error('No authentication token available');
        }
        const data = await fetchBoxSlicesWithState(() => fetchPairBoxSlices(pair, boxCount, session.access_token));
        console.log(`Received ${data.length} box slices for ${pair}`);
    };

    useEffect(() => {
        if (session?.access_token) {
            handleFetchCandles(limit).catch(console.error);
        }
    }, [session, limit, pair]);

    return (
        <CollapsiblePanel title={pair} defaultOpen={true}>
            <div className='grid h-full grid-cols-3 gap-2'>
                {/* Top Row */}
                <div className='flex flex-col rounded border border-[#181818] bg-[#0a0a0a] p-2'>
                    <h4 className='mb-2 text-[11px] font-medium text-gray-300'>Box Visualization</h4>
                    <div className='min-h-0 flex-1 overflow-auto'>
                        <PairResoBox pair={pair} boxSlice={boxData} currentOHLC={currentOHLC} boxColors={boxColors} isLoading={false} />
                    </div>
                </div>

                <div className='flex flex-col rounded border border-[#181818] bg-[#0a0a0a] p-2'>
                    <h4 className='mb-2 text-[11px] font-medium text-white'>Box Slices {pairBoxSlices && `(${pairBoxSlices.length})`}</h4>

                    <button
                        onClick={handleFetchBoxSlices}
                        className='mt-2 mb-2 border border-[#181818] bg-black px-2 py-2 text-[11px] text-gray-300 transition-colors hover:bg-[#181818]'>
                        Fetch Box Slices
                    </button>
                    <div className='min-h-0 flex-1 overflow-auto'>
                        {pairBoxSlices ? (
                            <pre className='rounded bg-black/40 p-1.5 text-[11px] text-green-400'>{JSON.stringify(pairBoxSlices, null, 2)}</pre>
                        ) : (
                            <div className='text-[11px] text-gray-500'>No box slices available</div>
                        )}
                    </div>
                </div>
            </div>
        </CollapsiblePanel>
    );
});

PairPanel.displayName = 'PairPanel';

export default function AdminPage() {
    const { session } = useAuth();
    const { isConnected, selectedPairs } = useDashboard();
    const { priceData } = useWebSocket();
    const [selectedPair, setSelectedPair] = useState<string | null>(null);
    const [latestBoxSlices, setLatestBoxSlices] = useState<any>(null);
    const [isBoxSlicesOpen, setIsBoxSlicesOpen] = useState(false);
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

    const handleFetchLatestBoxSlices = async () => {
        if (!session?.access_token) return;
        try {
            const data = await fetchLatestBoxSlices(session.access_token, boxCount);
            setLatestBoxSlices(data);
            setIsBoxSlicesOpen(true);
        } catch (err) {
            console.error('Failed to fetch latest box slices:', err);
        }
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
            <div className='ml-[300px] min-h-screen flex-1 bg-black p-4 pt-20 text-white lg:mr-[400px]'>
                <div className='mb-4 flex items-center justify-between overflow-y-auto rounded border border-[#181818] p-2'>
                    <h1 className='text-xl font-bold'>Trading Dashboard</h1>
                    <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>

                <CollapsiblePanel title={`All Pairs Latest Box Slices ${latestBoxSlices ? `(${Object.keys(latestBoxSlices).length} pairs)` : ''}`} defaultOpen={isBoxSlicesOpen}>
                    <div className='mb-4'>
                        <button
                            onClick={handleFetchLatestBoxSlices}
                            className='border border-[#181818] bg-black px-2 py-1 text-[11px] text-gray-300 transition-colors hover:bg-[#181818]'>
                            Fetch Latest Boxes
                        </button>
                    </div>
                    {latestBoxSlices ? (
                        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                            {Object.entries(latestBoxSlices).map(([pair, data]) => (
                                <div key={pair} className='rounded border border-[#181818] p-2'>
                                    <h4 className='mb-2 text-[11px] font-medium text-purple-400'>{pair}</h4>
                                    <pre className='max-h-[200px] overflow-auto text-[11px] text-green-400'>{JSON.stringify(data, null, 2)}</pre>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-gray-400'>Click "Fetch Latest Boxes" to load data</div>
                    )}
                </CollapsiblePanel>

                <div className='mt-4'>
                    {selectedPairs.map((pair) => (
                        <PairPanel key={pair} pair={pair} />
                    ))}
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
