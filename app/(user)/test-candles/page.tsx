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

const TestCandles = () => {
    const { session } = useAuth();
    const [candles, setCandles] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [limit, setLimit] = useState(100);
    const [isChronological, setIsChronological] = useState(false);
    const [pairInput, setPairInput] = useState('BTCUSD');
    const [latestBoxSlices, setLatestBoxSlices] = useState<any>(null);
    const [pairBoxSlices, setPairBoxSlices] = useState<any>(null);
    const [boxCount, setBoxCount] = useState<number>(500);

    // Use Dashboard context for WebSocket data
    const { candlesData: dashboardCandles, pairData: dashboardPairData, isConnected, selectedPairs, togglePair } = useDashboard();

    // Ensure BTCUSD is selected in Dashboard
    useEffect(() => {
        if (!selectedPairs.includes('BTCUSD')) {
            togglePair('BTCUSD');
        }
    }, [selectedPairs]);

    // Get live box data from Dashboard
    const btcBoxData = dashboardPairData['BTCUSD']?.boxes?.[0] || null;
    const btcCurrentOHLC = dashboardPairData['BTCUSD']?.currentOHLC || null;

    // Add default box colors for the ResoBox
    const defaultBoxColors: BoxColors = {
        positive: '#00ff00',
        negative: '#ff0000',
        styles: {
            startIndex: 0,
            maxBoxCount: 38,
            globalTimeframeControl: false,
            borderRadius: 0,
            shadowIntensity: 0.5,
            opacity: 0.5,
            showBorder: true,
        },
    };

    const fetchCandles = async (candleLimit: number) => {
        if (!session?.access_token) {
            setError('No authentication token available');
            setIsLoading(false);
            return;
        }

        try {
            setError('');
            setIsLoading(true);
            const response = await fetch(`/api/getCandles?pair=BTCUSD&limit=${candleLimit}&token=${session.access_token}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const { data } = await response.json();
            setCandles(data);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch candles');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCandles(limit);
    }, [session, limit]);

    const fetchLatestBoxSlices = async () => {
        if (!session?.access_token) {
            setError('No authentication token available');
            return;
        }

        try {
            const response = await fetch(`/api/getLatestBoxSlices?token=${session.access_token}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setLatestBoxSlices(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch latest box slices');
        }
    };

    const fetchPairBoxSlices = async (pair: string) => {
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

    const displayCandles = isChronological ? [...candles].reverse() : candles;

    return (
        <div className='min-h-screen bg-gray-900 p-4 text-white'>
            {/* Header */}
            <div className='mb-4 flex items-center justify-between rounded-lg bg-gray-800 p-3'>
                <h1 className='text-xl font-bold'>Trading Dashboard</h1>
                <div className='flex items-center gap-4'>
                    <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                {/* Left Column */}
                <div className='space-y-4 lg:col-span-2'>
                    <CollapsiblePanel title='Trading View & Box Data'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {/* ResoBox Container - Now smaller */}
                            <div className='space-y-4'>
                                <div className='relative aspect-square w-full max-w-[400px]'>
                                    {btcBoxData ? (
                                        <ResoBox slice={btcBoxData} boxColors={defaultBoxColors} className='h-full w-full' />
                                    ) : (
                                        <div className='flex h-full items-center justify-center text-gray-400'>Waiting for box data...</div>
                                    )}
                                </div>
                            </div>

                            {/* Box Fetch Results */}
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <div className='flex flex-wrap gap-2'>
                                        <button onClick={fetchLatestBoxSlices} className='rounded bg-blue-600 px-3 py-1 text-sm'>
                                            Fetch ALL PAIRSLatest Boxes
                                        </button>
                                        <div className='flex items-center gap-2'>
                                            <input
                                                type='text'
                                                value={pairInput}
                                                onChange={(e) => setPairInput(e.target.value)}
                                                className='rounded border border-gray-700 bg-gray-900 px-2 py-1 text-sm'
                                                placeholder='Enter pair...'
                                            />
                                            <button onClick={() => fetchPairBoxSlices(pairInput)} className='rounded bg-purple-600 px-3 py-1 text-sm'>
                                                Fetch Pair Box Slice
                                            </button>
                                        </div>
                                    </div>

                                    {/* Latest Box Slices Display */}
                                    {latestBoxSlices && (
                                        <div className='rounded-lg border border-gray-700 bg-gray-800/50 p-2'>
                                            <h4 className='mb-2 text-sm font-semibold text-blue-400'>Fetched ALL PAIRS Latest Box Slices</h4>
                                            <pre className='max-h-[200px] overflow-auto text-xs text-green-400'>{JSON.stringify(latestBoxSlices, null, 2)}</pre>
                                        </div>
                                    )}

                                    {/* Pair Box Slices Display */}
                                    {pairBoxSlices && (
                                        <div className='rounded-lg border border-gray-700 bg-gray-800/50 p-2'>
                                            <h4 className='mb-2 text-sm font-semibold text-purple-400'>Fetched Pair Box Slices ({pairBoxSlices.length} slices)</h4>
                                            <pre className='max-h-[200px] overflow-auto text-xs text-green-400'>{JSON.stringify(pairBoxSlices, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CollapsiblePanel>
                </div>
                {/* Right Column - Live Market Data and Historical Candles */}
                <div className='space-y-4'>
                    <CollapsiblePanel title='Live Market Data'>
                        <div className='space-y-2'>
                            <div className='text-sm text-gray-400'>This component fetches initial candles and continuously updates via WebSocket connection</div>
                            <LiveCandleFeed pair='BTCUSD' />
                        </div>
                    </CollapsiblePanel>
                    <CollapsiblePanel title='Box Data'>
                        <div className='space-y-2'>
                            <div className='text-sm text-gray-400'>This component displays BTCUSD box slices data received via WebSocket connection</div>
                            <div className='font-mono text-xs text-gray-400'>Last updated: {btcBoxData ? new Date().toISOString() : 'Never'}</div>
                            <pre className='max-h-[200px] overflow-auto text-xs text-purple-300'>{JSON.stringify(btcBoxData, null, 2)}</pre>
                        </div>
                    </CollapsiblePanel>

                    <CollapsiblePanel title='Historical Candles' defaultOpen={false}>
                        <div className='space-y-4'>
                            <div className='space-y-2 border-b border-gray-700 pb-2'>
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
                            </div>

                            {/* Updated Candle Data Display */}
                            {isLoading ? (
                                <div className='py-2 text-center'>Loading...</div>
                            ) : candles.length > 0 ? (
                                <div className='space-y-2'>
                                    <div className='text-xs text-yellow-400'>
                                        <div>Latest: {candles[0].timestamp}</div>
                                        <div>Oldest: {candles[candles.length - 1].timestamp}</div>
                                    </div>
                                    <pre className='max-h-[300px] overflow-auto text-xs text-green-400'>{JSON.stringify(displayCandles, null, 2)}</pre>
                                    <div className='text-xs text-gray-300'>Total: {candles.length}</div>
                                </div>
                            ) : (
                                <div className='text-gray-400'>No data available</div>
                            )}
                        </div>
                    </CollapsiblePanel>
                </div>
            </div>
        </div>
    );
};

export default TestCandles;
