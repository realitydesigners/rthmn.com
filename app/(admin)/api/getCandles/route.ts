import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pair = searchParams.get('pair');
    const token = searchParams.get('token');
    const limit = searchParams.get('limit') || '500';

    if (!pair || !token) {
        return NextResponse.json({ error: 'Missing pair or token' }, { status: 400 });
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://server.rthmn.com';
        const url = `${baseUrl}/candles/${pair}?limit=${limit}`;

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
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 500 });
    }
}
