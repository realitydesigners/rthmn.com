import { NextResponse } from 'next/server';
import { SERVER_ROUTES } from '../config';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
        const url = new URL(SERVER_ROUTES.LATEST_BOX_SLICES, baseUrl);

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
        return NextResponse.json({ error: 'Failed to fetch latest box slices' }, { status: 500 });
    }
}
