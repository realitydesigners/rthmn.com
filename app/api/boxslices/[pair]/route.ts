import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { pair: string } }
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
  const { pair } = params;
  const lastTimestamp = request.nextUrl.searchParams.get('lastTimestamp');

  const url = `${baseUrl}/boxslices/${pair}${lastTimestamp ? `?lastTimestamp=${lastTimestamp}` : ''}`;
  console.log(`Fetching from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const responseText = await response.text();
      console.error(`Response text: ${responseText}`);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }
    const data = await response.json();
    console.log('Data received from Bun server:', data);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Fetch error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
}
