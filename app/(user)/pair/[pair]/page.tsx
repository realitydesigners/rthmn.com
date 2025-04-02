import { processInitialBoxData } from '@/utils/boxDataProcessor';
import { processInitialChartData } from '@/utils/chartDataProcessor';
import { getSubscription } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import PairClient from './client';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

async function fetchApiData(pair: string, token: string) {
    const CANDLE_LIMIT = 50;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}&interval=1min`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const { data } = await response.json();

        if (!data || !Array.isArray(data)) {
            console.error('Invalid data format received:', data);
            return [];
        }

        // Convert timestamps and validate OHLC data
        const processedData = [...data]
            .reverse()
            .map((candle) => {
                // --- START: Robust Timestamp Parsing ---
                const getUnixTimestamp = (tsInput: string | number | undefined | null): number => {
                    if (tsInput === null || typeof tsInput === 'undefined') {
                        console.error('Invalid timestamp received (null or undefined): skipping candle:', candle);
                        return NaN;
                    }
                    if (typeof tsInput === 'number') {
                        // Check if it looks like seconds, convert to ms if so
                        return tsInput > 9999999999 ? tsInput : tsInput * 1000;
                    }
                    if (typeof tsInput === 'string') {
                        // Check if it's a number string
                        if (!isNaN(Number(tsInput))) {
                            const numTs = Number(tsInput);
                            return numTs > 9999999999 ? numTs : numTs * 1000;
                        }
                        // Check for specific "YYYY-MM-DD HH:mm:ss" format
                        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(tsInput)) {
                            return new Date(tsInput.replace(' ', 'T') + 'Z').getTime();
                        }
                        // Fallback: Attempt standard Date parsing
                        const parsedDate = new Date(tsInput);
                        if (!isNaN(parsedDate.getTime())) {
                            return parsedDate.getTime();
                        }
                    }
                    console.error('Invalid or unparseable timestamp format received: skipping candle:', candle);
                    return NaN;
                };
                const timestamp = getUnixTimestamp(candle.timestamp);
                // --- END: Robust Timestamp Parsing ---

                // Validate timestamp
                if (isNaN(timestamp)) {
                    return null; // Mark for filtering (timestamp failed)
                }

                // Validate and convert OHLC values
                const candleOpen = Number(candle.open);
                const candleHigh = Number(candle.high);
                const candleLow = Number(candle.low);
                const candleClose = Number(candle.close);

                if (isNaN(candleOpen) || isNaN(candleHigh) || isNaN(candleLow) || isNaN(candleClose)) {
                    console.error('Invalid OHLC data received: skipping candle:', candle);
                    return null; // Mark for filtering
                }

                return {
                    timestamp: timestamp,
                    open: candleOpen,
                    high: candleHigh,
                    low: candleLow,
                    close: candleClose,
                };
            })
            .filter((candle): candle is { timestamp: number; open: number; high: number; low: number; close: number } => candle !== null); // Filter out nulls and type guard

        // Early exit if no valid data remained after processing
        if (!processedData.length) {
            console.error('No valid candle data remained after processing timestamps and OHLC.');
            return [];
        }

        return processedData;
    } catch (error) {
        console.error('Error fetching candle data:', error);
        return [];
    }
}

export default async function PairPage(props: PageProps) {
    const params = await props.params;
    const { pair } = params;
    const supabase = await createClient();
    const session = await supabase.auth.getSession();
    const subscription = await getSubscription(supabase);
    const hasSubscription = subscription?.status === 'active';

    if (!session.data.session?.access_token) {
        throw new Error('No access token available');
    }

    const rawCandleData = await fetchApiData(pair, session.data.session.access_token);

    // Return early if no data
    if (!rawCandleData.length) {
        console.error('No candle data available');
        return null;
    }

    // Process chart data only if needed for charting
    const { processedCandles, initialVisibleData } = processInitialChartData(rawCandleData);

    // Use raw candle data directly for box calculations
    const { histogramBoxes, histogramPreProcessed } = processInitialBoxData(rawCandleData, pair);

    const chartData = {
        processedCandles,
        initialVisibleData,
        histogramBoxes,
        histogramPreProcessed,
    };

    if (hasSubscription) {
        return <PairClient pair={pair} chartData={chartData} />;
    }

    return null;
}
