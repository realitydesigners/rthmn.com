import { NextResponse } from 'next/server';
import type { CandleData } from '@/types/types'; // Assuming you have a type for candle data

// Define the robust timestamp parsing function (copied from page.tsx)
const getUnixTimestamp = (tsInput: string | number | undefined | null): number => {
    if (tsInput === null || typeof tsInput === 'undefined') {
        console.error('API Route: Invalid timestamp received (null or undefined)', tsInput);
        return NaN;
    }
    if (typeof tsInput === 'number') {
        return tsInput > 9999999999 ? tsInput : tsInput * 1000; // ms vs s
    }
    if (typeof tsInput === 'string') {
        if (!isNaN(Number(tsInput))) {
            const numTs = Number(tsInput);
            return numTs > 9999999999 ? numTs : numTs * 1000;
        }

        const parsedDate = new Date(tsInput);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.getTime();
        }
    }
    console.error('API Route: Invalid or unparseable timestamp format received:', tsInput);
    return NaN;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pair = searchParams.get('pair');
    const token = searchParams.get('token'); // NOTE: See security comment below
    const limit = searchParams.get('limit') || '500';
    const interval = searchParams.get('interval') || '1min'; // Add interval param

    if (!pair || !token) {
        return NextResponse.json({ error: 'Missing pair or token' }, { status: 400 });
    }

    try {
        // Fetch from the actual external data source
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://server.rthmn.com';
        // Make sure pair is uppercase and include interval
        const url = `${baseUrl}/candles/${pair.toUpperCase()}?limit=${limit}&interval=${interval}`;

        const externalResponse = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store', // Or configure caching as needed
        });

        if (!externalResponse.ok) {
            // Forward the error status and message if possible
            const errorBody = await externalResponse.text();
            console.error(`API Route: External API error! Status: ${externalResponse.status}, Body: ${errorBody}`);
            throw new Error(`External API error! status: ${externalResponse.status}`);
        }

        // Assuming the external API returns { data: [...] }
        const externalData = await externalResponse.json();

        // --- START: Data Processing Logic ---
        const processedData = externalData.data
            .map((candle: any) => {
                // Use 'any' or a less strict input type
                const timestamp = getUnixTimestamp(candle.timestamp);

                if (isNaN(timestamp)) {
                    console.error('API Route: Skipping candle due to invalid timestamp:', candle);
                    return null;
                }

                const candleOpen = Number(candle.open);
                const candleHigh = Number(candle.high);
                const candleLow = Number(candle.low);
                const candleClose = Number(candle.close);

                if (isNaN(candleOpen) || isNaN(candleHigh) || isNaN(candleLow) || isNaN(candleClose)) {
                    console.error('API Route: Skipping candle due to invalid OHLC:', candle);
                    return null;
                }

                return {
                    timestamp, // Already in ms
                    open: candleOpen,
                    high: candleHigh,
                    low: candleLow,
                    close: candleClose,
                };
            })
            // Filter out nulls and provide type safety for the response
            .filter((candle): candle is CandleData => candle !== null);
        // --- END: Data Processing Logic ---

        // Reverse the data so it's chronological (oldest first)
        const reversedData = processedData.reverse();

        // Return the processed and reversed data
        return NextResponse.json({ data: reversedData });
    } catch (error: any) {
        console.error('API Route: Failed to fetch or process candles:', error);
        // Return a generic error message to the client
        return NextResponse.json({ error: `Failed to fetch candles: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}
