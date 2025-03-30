import { processInitialBoxData } from '@/utils/boxDataProcessor';
import { processInitialChartData } from '@/utils/chartDataProcessor';
import { getSubscription } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import type { ChartDataPoint } from '@/components/Charts/CandleChart';
import PairClient from './client';

interface PageProps {
    params: Promise<{
        pair: string;
    }>;
}

const CANDLE_LIMIT = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const getUnixTimestamp = (timestamp: any): number => {
    try {
        if (!timestamp) {
            console.warn('Empty timestamp received');
            return NaN;
        }

        // Handle different timestamp formats
        if (typeof timestamp === 'number') {
            const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000;
            return ts;
        }

        if (typeof timestamp === 'string') {
            // Try parsing as unix timestamp string first (server sends as string)
            const unixTime = parseInt(timestamp, 10);
            if (!isNaN(unixTime)) {
                return unixTime > 9999999999 ? unixTime : unixTime * 1000;
            }

            // Fallback to ISO string parsing
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return date.getTime();
            }
        }

        console.error('Invalid timestamp format:', timestamp);
        return NaN;
    } catch (error) {
        console.error('Error processing timestamp:', error);
        return NaN;
    }
};

const processCandles = (rawData: any[]): ChartDataPoint[] => {
    if (!Array.isArray(rawData)) {
        console.error('Invalid data format: expected array');
        return [];
    }

    const processedCandles = rawData
        .map((candle) => {
            try {
                // Skip if candle is not an object
                if (!candle || typeof candle !== 'object') {
                    return null;
                }

                const { open, high, low, close, timestamp } = candle;

                // Silently skip if any OHLC values are missing/null
                if ([open, high, low, close].some((val) => val === null || val === undefined || isNaN(val))) {
                    return null;
                }

                const unixTimestamp = getUnixTimestamp(timestamp);
                if (isNaN(unixTimestamp)) {
                    return null;
                }

                return {
                    timestamp: unixTimestamp,
                    open: parseFloat(open),
                    high: parseFloat(high),
                    low: parseFloat(low),
                    close: parseFloat(close),
                    volume: candle.volume ? parseFloat(candle.volume) : 0,
                };
            } catch (error) {
                // Only log actual errors, not data gaps
                console.error('Error processing candle:', error);
                return null;
            }
        })
        .filter(Boolean) as ChartDataPoint[];

    // Sort candles chronologically (oldest to newest)
    return processedCandles.sort((a, b) => a.timestamp - b.timestamp);
};

async function fetchWithRetry(url: string, token: string, retries = MAX_RETRIES): Promise<Response> {
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
            },
        });

        if (response.ok) {
            return response;
        }

        if (response.status === 401) {
            throw new Error('Authentication failed - invalid or expired token');
        }

        if (retries > 0 && response.status >= 500) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(url, token, retries - 1);
        }

        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
        if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(url, token, retries - 1);
        }
        throw error;
    }
}

async function getLatestValidCandle(pair: string, token: string): Promise<{ timestamp: string } | null> {
    try {
        const response = await fetchWithRetry(`${process.env.NEXT_PUBLIC_SERVER_URL}/latest-candles`, token);
        const responseData = await response.json();

        if (responseData.status === 'error' || !responseData.data) {
            return null;
        }

        // Find the candle for our pair
        const pairCandle = responseData.data.find(
            (candle: any) => candle?.symbol === pair && candle?.open !== null && candle?.high !== null && candle?.low !== null && candle?.close !== null
        );

        return pairCandle || null;
    } catch (error) {
        console.error('Error fetching latest candle:', error);
        return null;
    }
}

export default async function PairPage(props: PageProps) {
    try {
        const params = await props.params;
        const { pair } = params;
        const supabase = await createClient();
        const session = await supabase.auth.getSession();
        const subscription = await getSubscription(supabase);
        const hasSubscription = subscription?.status === 'active';

        if (!session.data.session?.access_token) {
            console.error('No access token available');
            return <div>Please log in to view this content</div>;
        }

        const token = session.data.session.access_token;

        try {
            // First get the latest valid candle
            const latestCandle = await getLatestValidCandle(pair.toUpperCase(), token);

            if (!latestCandle) {
                console.error('No valid latest candle found');
                return <div>No recent market data available. Market might be closed.</div>;
            }

            // Now fetch historical candles from the latest valid timestamp
            const response = await fetchWithRetry(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/candles/${pair.toUpperCase()}?limit=${CANDLE_LIMIT}&interval=1min&from=${latestCandle.timestamp}`,
                token
            );
            const responseData = await response.json();

            // Debug the raw response
            console.log('Raw candle response:', {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                data: responseData,
                latestValidCandle: latestCandle,
            });

            if (responseData.status === 'error') {
                console.error('Server returned error:', responseData.message);
                return <div>Error: {responseData.message}</div>;
            }

            const { data } = responseData;

            if (!data || !Array.isArray(data)) {
                console.error('Invalid data format received:', responseData);
                return <div>Error: Invalid data format received</div>;
            }

            // Filter out any null candles
            const validData = data.filter((candle) => candle && candle.open !== null && candle.high !== null && candle.low !== null && candle.close !== null);

            if (validData.length === 0) {
                return <div>No valid market data available. Market might be closed.</div>;
            }

            // Debug the data array
            console.log('Candle data array:', {
                length: validData.length,
                firstCandle: validData[0],
                lastCandle: validData[validData.length - 1],
            });

            const processedCandles = processCandles(validData);

            // Debug processed candles
            console.log('Processed candles:', {
                originalLength: validData.length,
                processedLength: processedCandles.length,
                firstProcessedCandle: processedCandles[0],
                lastProcessedCandle: processedCandles[processedCandles.length - 1],
            });

            if (processedCandles.length === 0) {
                console.error('No valid candles after processing. Original data:', validData);
                return <div>No valid candle data available</div>;
            }

            const { initialVisibleData } = processInitialChartData(processedCandles);
            const { histogramBoxes, histogramPreProcessed } = processInitialBoxData(processedCandles, pair);

            // Debug chart data
            console.log('Chart data:', {
                initialVisibleDataLength: initialVisibleData.length,
                histogramBoxesLength: histogramBoxes.length,
            });

            const chartData = {
                processedCandles,
                initialVisibleData,
                histogramBoxes,
                histogramPreProcessed,
            };

            if (hasSubscription) {
                return <PairClient pair={pair} chartData={chartData} />;
            }

            return <div>Subscription required to view this content</div>;
        } catch (error) {
            console.error('Error fetching candle data:', error);
            if (error instanceof Error && error.message.includes('Authentication failed')) {
                return <div>Session expired. Please log in again.</div>;
            }
            return <div>Error loading chart data. Please try again later.</div>;
        }
    } catch (error) {
        console.error('Error in PairPage:', error);
        return <div>An unexpected error occurred</div>;
    }
}
