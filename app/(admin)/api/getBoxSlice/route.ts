import { NextResponse } from 'next/server';
import { SERVER_ROUTES } from '../config';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pair = searchParams.get('pair');
    const token = searchParams.get('token');
    const lastTimestamp = searchParams.get('lastTimestamp');
    const count = searchParams.get('count') || '500';

    if (!pair || !token) {
        return NextResponse.json({ error: 'Missing pair or token' }, { status: 400 });
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
        const url = new URL(SERVER_ROUTES.BOX_SLICE(pair), baseUrl);

        if (lastTimestamp) url.searchParams.set('lastTimestamp', lastTimestamp);
        if (count) url.searchParams.set('count', count);

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Fetched ${data.data.length} box slices for pair ${pair} (total count: ${data.count})`);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch box slices' }, { status: 500 });
    }
}
