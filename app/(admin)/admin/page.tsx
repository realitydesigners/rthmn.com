'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { ResoBox } from '@/components/ResoBox';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { AdminSidebar } from '@/components/AdminSidebar';
import { PairResoBox } from './PairResoBox';

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

    const formatTime = (timestamp: string) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className='h-full'>
            <div className='space-y-0.5'>
                {candleHistory.map((candle, index) => (
                    <div key={index} className='flex justify-between font-mono text-[11px]'>
                        <span className='text-gray-500'>{formatTime(candle.timestamp)}</span>
                        <div className='flex gap-2'>
                            <span className='text-gray-500'>O:</span>
                            <span className={candle.close >= candle.open ? 'text-green-400' : 'text-red-400'}>{candle.open.toFixed(5)}</span>
                            <span className='text-gray-500'>H:</span>
                            <span className='text-green-400'>{candle.high.toFixed(5)}</span>
                            <span className='text-gray-500'>L:</span>
                            <span className='text-red-400'>{candle.low.toFixed(5)}</span>
                            <span className='text-gray-500'>C:</span>
                            <span className={candle.close >= candle.open ? 'text-green-400' : 'text-red-400'}>{candle.close.toFixed(5)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BoxValuesTable = ({ pair }: { pair: string }) => {
    const { pairData } = useDashboard();
    const [boxHistory, setBoxHistory] = useState<any[]>([]);

    useEffect(() => {
        const boxes = pairData[pair]?.boxes?.[0]?.boxes;
        if (boxes) {
            setBoxHistory((prev) => {
                const newEntry = {
                    boxes,
                    timestamp: new Date().toISOString(),
                };
                return [newEntry, ...prev].slice(0, 50);
            });
        }
    }, [pair, pairData]);

    if (!boxHistory.length) {
        return <div className='text-gray-400'>No box data available...</div>;
    }

    const latestBoxes = boxHistory[0].boxes;

    return (
        <div className='overflow-auto'>
            <table className='w-full text-left text-[11px]'>
                <thead>
                    <tr className='text-gray-500'>
                        <th className='p-1'>BOX #</th>
                        <th className='p-1'>HIGH</th>
                        <th className='p-1'>LOW</th>
                        <th className='p-1'>VALUE</th>
                    </tr>
                </thead>
                <tbody>
                    {latestBoxes.map((box, index) => (
                        <tr key={index} className='hover:bg-black/20'>
                            <td className='p-1 text-gray-500'>{index + 1}</td>
                            <td className='p-1 font-mono text-green-400'>{box.high.toFixed(5)}</td>
                            <td className='p-1 font-mono text-red-400'>{box.low.toFixed(5)}</td>
                            <td className={`p-1 font-mono ${box.value > 0 ? 'text-green-400' : 'text-red-400'}`}>{box.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
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

                <div className='flex h-[400px] flex-col rounded border border-[#181818] bg-[#0a0a0a] p-2'>
                    <h4 className='mb-2 text-[11px] font-medium text-gray-300'>Box Values</h4>
                    <div className='min-h-0 flex-1 overflow-auto'>
                        <BoxValuesTable pair={pair} />
                    </div>
                </div>

                {/* Bottom Row */}
                <div className='flexh-[400px] flex-col rounded border border-[#181818] bg-[#0a0a0a] p-2'>
                    <h4 className='mb-2 text-[11px] font-medium text-gray-300'>Live Candles</h4>
                    <div className='min-h-0 flex-1 overflow-auto'>
                        <LiveCandleFeed pair={pair} />
                    </div>
                </div>

                <div className='flex h-[400px] flex-col rounded border border-[#181818] bg-[#0a0a0a] p-2'>
                    <h4 className='mb-2 text-[11px] font-medium text-gray-300'>Historical Candles</h4>
                    <div className='flex h-full flex-col'>
                        <div className='mb-2 flex items-center gap-2 rounded bg-black/40 p-1.5'>
                            <label className='flex items-center gap-1.5 text-[11px] text-gray-300'>
                                Limit:
                                <input
                                    type='number'
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className='w-16 rounded border border-[#181818] bg-black px-1.5 py-0.5 text-[11px]'
                                    min={1}
                                    max={10000}
                                />
                            </label>
                            <button onClick={() => handleFetchCandles(limit)} className='rounded bg-black/60 px-2 py-0.5 text-[11px] transition-colors hover:bg-black'>
                                Fetch
                            </button>
                            <label className='flex items-center gap-1.5 text-[11px] text-gray-300'>
                                <input type='checkbox' checked={isChronological} onChange={(e) => setIsChronological(e.target.checked)} />
                                Show oldest first
                            </label>
                        </div>
                        <div className='min-h-0 flex-1 overflow-auto'>
                            {error && <div className='rounded bg-red-900/20 p-1.5 text-[11px] text-red-400'>{error}</div>}
                            {isLoading ? (
                                <div className='text-[11px] text-gray-400'>Loading...</div>
                            ) : candles?.length > 0 ? (
                                <div className='space-y-1'>
                                    <pre className='overflow-auto rounded bg-black/40 p-1.5 text-[11px] text-green-400'>{JSON.stringify(displayCandles, null, 2)}</pre>
                                    <div className='text-[10px] text-gray-500'>Total: {candles.length}</div>
                                </div>
                            ) : (
                                <div className='text-[11px] text-gray-500'>No data available</div>
                            )}
                        </div>
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
        <div className='flex'>
            <AdminSidebar priceData={priceData} selectedPairs={selectedPairs} />
            <div className='ml-[300px] min-h-screen flex-1 bg-black p-4 pt-20 text-white'>
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
        </div>
    );
}
