import { NextResponse } from 'next/server';
import { PairData, Box, OHLC, BoxSlice } from '@/types/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://server-rthmn-com.onrender.com';

async function fetchLatestBoxSlices(serverToken?: string): Promise<Record<string, PairData>> {
    const url = `${BASE_URL}/latest-boxslices`;

    try {
        const token = serverToken;

        if (!token) {
            console.error('No token available for request');
            return {};
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            return {};
        }
        const apiResponse = await response.json();

        if (!apiResponse || apiResponse.status !== 'success' || typeof apiResponse.data !== 'object') {
            console.error('Invalid API response:', apiResponse);
            return {};
        }

        const convertedData: Record<string, PairData> = {};
        for (const [pair, data] of Object.entries(apiResponse.data)) {
            if (typeof data === 'object' && data !== null && 'boxes' in data && 'currentOHLC' in data) {
                const boxSlice: BoxSlice = {
                    timestamp: new Date().toISOString(),
                    boxes: (data.boxes as Box[]) || [],
                };
                convertedData[pair] = {
                    boxes: [boxSlice],
                    currentOHLC: data.currentOHLC as OHLC,
                };
            }
        }

        return convertedData;
    } catch (error) {
        console.error('Fetch error:', error);
        return {};
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    try {
        const data = await fetchLatestBoxSlices(token);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
