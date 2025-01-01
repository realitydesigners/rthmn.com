'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { BoxSlice } from '@/types/types';
import { BoxColors } from '@/utils/localStorage';
import { ResoBox } from '@/components/ResoBox';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

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
        // Initialize with latest 10 candles from candlesData
        if (candlesData[pair]?.length > 0) {
            setCandleHistory(candlesData[pair].slice(0, 10));
        }
    }, [pair, candlesData]);

    // Update when new OHLC data comes in
    useEffect(() => {
        const currentOHLC = pairData[pair]?.currentOHLC;
        if (!currentOHLC) return;

        setCandleHistory((prev) => {
            // Only update if we have previous candles
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

// Add this new component for a single pair's data
const PairPanel = ({ pair }: { pair: string }) => {
    const { session } = useAuth();
    const { pairData } = useDashboard();
    const [candles, setCandles] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [limit, setLimit] = useState(100);
    const [isChronological, setIsChronological] = useState(false);
    const [pairBoxSlices, setPairBoxSlices] = useState<any>(null);
    const [boxCount, setBoxCount] = useState<number>(500);

    const boxData = pairData[pair]?.boxes?.[0] || null;
    const currentOHLC = pairData[pair]?.currentOHLC || null;

    const fetchCandles = async (candleLimit: number) => {
        if (!session?.access_token) {
            setError('No authentication token available');
            setIsLoading(false);
            return;
        }

        try {
            setError('');
            setIsLoading(true);
            const response = await fetch(`/api/getCandles?pair=${pair}&limit=${candleLimit}&token=${session.access_token}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const { data } = await response.json();
            setCandles(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch candles');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPairBoxSlices = async () => {
        if (!session?.access_token) {
            setError('No authentication token available');
            return;
        }

        try {
            const response = await fetch(`/api/getBoxSlice?pair=${pair}&token=${session.access_token}&count=${boxCount}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log(`Received ${data.data.length} box slices for ${pair} (total: ${data.count})`);
            setPairBoxSlices(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch pair box slices');
        }
    };

    useEffect(() => {
        fetchCandles(limit);
    }, [session, limit, pair]);

    const displayCandles = isChronological ? [...candles].reverse() : candles;

    return (
        <CollapsiblePanel title={pair} defaultOpen={true}>
            <div className='grid gap-4 md:grid-cols-2'>
                {/* Left column - ResoBox and controls */}
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
                    <button onClick={fetchPairBoxSlices} className='rounded bg-purple-600 px-3 py-1 text-sm'>
                        Fetch Box Slices
                    </button>
                    {pairBoxSlices && (
                        <div className='rounded-lg border border-gray-700 bg-gray-800/50 p-2'>
                            <h4 className='mb-2 text-sm font-semibold text-purple-400'>Box Slices ({pairBoxSlices.length})</h4>
                            <pre className='max-h-[150px] overflow-auto text-xs text-green-400'>{JSON.stringify(pairBoxSlices, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* Right column - Live data and historical candles */}
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
                                <button onClick={() => fetchCandles(limit)} className='rounded bg-blue-600 px-2 py-0.5 text-sm'>
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
                            ) : candles.length > 0 ? (
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

const TestCandles = () => {
    const { session } = useAuth();
    const { isConnected, selectedPairs } = useDashboard();
    const [latestBoxSlices, setLatestBoxSlices] = useState<any>(null);
    const [isBoxSlicesOpen, setIsBoxSlicesOpen] = useState(false);
    const [boxCount, setBoxCount] = useState(500);

    const fetchLatestBoxSlices = async () => {
        if (!session?.access_token) return;
        try {
            const response = await fetch(`/api/getLatestBoxSlices?token=${session.access_token}&count=${boxCount}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setLatestBoxSlices(data);
            setIsBoxSlicesOpen(true);
        } catch (err) {
            console.error('Failed to fetch latest box slices:', err);
        }
    };

    return (
        <div className='min-h-screen bg-gray-900 p-4 text-white'>
            {/* Header */}
            <div className='mb-4 flex items-center justify-between rounded-lg bg-gray-800 p-3'>
                <h1 className='text-xl font-bold'>Trading Dashboard</h1>
                <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            {/* Latest Box Slices Display - simplified fetch control */}
            <CollapsiblePanel title={`All Pairs Latest Box Slices ${latestBoxSlices ? `(${Object.keys(latestBoxSlices).length} pairs)` : ''}`} defaultOpen={isBoxSlicesOpen}>
                <div className='mb-4'>
                    <button onClick={fetchLatestBoxSlices} className='rounded bg-blue-600 px-3 py-1 text-sm'>
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

            {/* Grid of Pair Panels */}
            <div className='mt-4 grid gap-4 xl:grid-cols-2'>
                {selectedPairs.map((pair) => (
                    <PairPanel key={pair} pair={pair} />
                ))}
            </div>
        </div>
    );
};

export default TestCandles;
