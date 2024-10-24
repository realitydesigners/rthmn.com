import { NextResponse } from 'next/server';
import { getBoxSlices } from '@/utils/boxSlices';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = searchParams.get('pair');
  const token = searchParams.get('token');

  if (!pair || !token) {
    return NextResponse.json(
      { error: 'Missing pair or token' },
      { status: 400 }
    );
  }

  try {
    const data = await getBoxSlices(pair, undefined, 500, token);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
