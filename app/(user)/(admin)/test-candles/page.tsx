'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { ResoBox } from '@/components/ResoBox';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

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
        <div className='rounded-lg border border-gray-700 bg-gray-800'>
            <button onClick={() => setIsOpen(!isOpen)} className='flex w-full items-center justify-between p-2 hover:bg-gray-700'>
                <h3 className='font-semibold text-gray-200'>{title}</h3>
                {isOpen ? <IoChevronUp className='h-4 w-4 text-gray-400' /> : <IoChevronDown className='h-4 w-4 text-gray-400' />}
            </button>
            {isOpen && <div className='border-t border-gray-700 p-2'>{children}</div>}
        </div>
    );
};

const LiveCandleFeed = ({ pair }: { pair: string }) => {
    const [candleHistory, setCandleHistory] = useState<any[]>([]);
    const { candlesData, pairData } = useDashboard();

    useEffect(() => {
        if (candlesData[pair]?.length > 0) {
            setCandleHistory(candlesData[pair].slice(0, 10));
        }
    }, [pair, candlesData]);

    useEffect(() => {
        const currentOHLC = pairData[pair]?.currentOHLC;
        if (!currentOHLC) return;

        setCandleHistory((prev) => {
            if (!prev.length) return prev;

            const [latestCandle, ...rest] = prev;
            const updatedLatest = {
                ...latestCandle,
                close: currentOHLC.close,
                high: Math.max(latestCandle.high, currentOHLC.close),
                low: Math.min(latestCandle.low, currentOHLC.close),
            };

            return [updatedLatest, ...rest].slice(0, 10);
        });
    }, [pair, pairData]);

    if (!candleHistory.length) {
        return <div className='text-gray-400'>Waiting for candle data...</div>;
    }

    return (
        <div className='h-full'>
            <div className='space-y-1'>
                {candleHistory.map((candle, index) => (
                    <div key={`${candle.timestamp}-${index}`} className={`flex justify-between rounded p-1 ${index === 0 ? 'bg-purple-900/30' : 'bg-gray-900/30'}`}>
                        <span className='font-mono text-xs text-gray-400'>{candle.timestamp}</span>
                        <span className={`font-mono text-xs ${candle.close > candle.open ? 'text-green-400' : 'text-red-400'}`}>
                            O:{candle.open.toFixed(5)} H:{candle.high.toFixed(5)} L:{candle.low.toFixed(5)} C:{candle.close.toFixed(5)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PairPanel = ({ pair }: { pair: string }) => {
    const { session } = useAuth();
    const { pairData } = useDashboard();
    const [limit, setLimit] = useState(100);
    const [isChronological, setIsChronological] = useState(false);
    const [boxCount, setBoxCount] = useState<number>(500);
    const { data: candles, error, isLoading, handleFetch: fetchWithState } = useFetchState<any[]>([]);
    const { data: pairBoxSlices, handleFetch: fetchBoxSlicesWithState } = useFetchState<any>(null);

    const boxData = pairData[pair]?.boxes?.[0] || null;

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
            <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-4'>
                    <div className='relative aspect-square w-full max-w-[300px]'>
                        {boxData ? (
                            <ResoBox
                                slice={boxData}
                                boxColors={{
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
                                }}
                                className='h-full w-full'
                            />
                        ) : (
                            <div className='flex h-full items-center justify-center text-gray-400'>Loading...</div>
                        )}
                    </div>
                    <button onClick={handleFetchBoxSlices} className='rounded bg-purple-600 px-3 py-1 text-sm'>
                        Fetch Box Slices
                    </button>
                    {pairBoxSlices && (
                        <div className='rounded-lg border border-gray-700 bg-gray-800/50 p-2'>
                            <h4 className='mb-2 text-sm font-semibold text-purple-400'>Box Slices ({pairBoxSlices.length})</h4>
                            <pre className='max-h-[150px] overflow-auto text-xs text-green-400'>{JSON.stringify(pairBoxSlices, null, 2)}</pre>
                        </div>
                    )}
                </div>

                <div className='space-y-4'>
                    <div className='rounded-lg border border-gray-700 bg-gray-800/50 p-2'>
                        <h4 className='mb-2 text-sm font-semibold'>Live Feed</h4>
                        <LiveCandleFeed pair={pair} />
                    </div>

                    <div className='rounded-lg border border-gray-700 bg-gray-800/50 p-2'>
                        <h4 className='mb-2 text-sm font-semibold'>Historical Candles</h4>
                        <div className='space-y-2'>
                            <div className='flex flex-wrap items-center gap-2'>
                                <label className='flex items-center gap-1 text-sm'>
                                    Limit:
                                    <input
                                        type='number'
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                        className='w-20 rounded border border-gray-700 bg-gray-900 px-1 py-0.5 text-sm'
                                        min={1}
                                        max={10000}
                                    />
                                </label>
                                <button onClick={() => handleFetchCandles(limit)} className='rounded bg-blue-600 px-2 py-0.5 text-sm'>
                                    Fetch
                                </button>
                                <label className='flex items-center gap-1 text-sm'>
                                    <input type='checkbox' checked={isChronological} onChange={(e) => setIsChronological(e.target.checked)} />
                                    Show oldest first
                                </label>
                            </div>
                            {error && <div className='text-sm text-red-500'>Error: {error}</div>}
                            {isLoading ? (
                                <div>Loading...</div>
                            ) : candles?.length > 0 ? (
                                <div className='space-y-2'>
                                    <pre className='max-h-[200px] overflow-auto text-xs text-green-400'>{JSON.stringify(displayCandles, null, 2)}</pre>
                                    <div className='text-xs text-gray-300'>Total: {candles.length}</div>
                                </div>
                            ) : (
                                <div className='text-gray-400'>No data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CollapsiblePanel>
    );
};

export default function TestCandles() {
    const { session } = useAuth();
    const { isConnected, selectedPairs } = useDashboard();
    const [latestBoxSlices, setLatestBoxSlices] = useState<any>(null);
    const [isBoxSlicesOpen, setIsBoxSlicesOpen] = useState(false);
    const [boxCount, setBoxCount] = useState(500);

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

    return (
        <div className='min-h-screen bg-gray-900 p-4 text-white'>
            <div className='mb-4 flex items-center justify-between rounded-lg bg-gray-800 p-3'>
                <h1 className='text-xl font-bold'>Trading Dashboard</h1>
                <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            <CollapsiblePanel title={`All Pairs Latest Box Slices ${latestBoxSlices ? `(${Object.keys(latestBoxSlices).length} pairs)` : ''}`} defaultOpen={isBoxSlicesOpen}>
                <div className='mb-4'>
                    <button onClick={handleFetchLatestBoxSlices} className='rounded bg-blue-600 px-3 py-1 text-sm'>
                        Fetch Latest Boxes
                    </button>
                </div>
                {latestBoxSlices ? (
                    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                        {Object.entries(latestBoxSlices).map(([pair, data]) => (
                            <div key={pair} className='rounded-lg border border-gray-700 bg-gray-800/50 p-2'>
                                <h4 className='mb-2 text-sm font-semibold text-purple-400'>{pair}</h4>
                                <pre className='max-h-[200px] overflow-auto text-xs text-green-400'>{JSON.stringify(data, null, 2)}</pre>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='text-gray-400'>Click "Fetch ALL Latest Boxes" to load data</div>
                )}
            </CollapsiblePanel>

            <div className='mt-4 grid gap-4 xl:grid-cols-2'>
                {selectedPairs.map((pair) => (
                    <PairPanel key={pair} pair={pair} />
                ))}
            </div>
        </div>
    );
}
