import { client } from '@/sanity/lib/client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('Received market data update request');

    const { pair, candles } = await req.json();

    console.log('Processing market data for pair:', pair);

    // First, check if document exists
    const existingDoc = await client.fetch(
      '*[_type == "marketData" && pair == $pair][0]',
      { pair }
    );

    let result;

    if (existingDoc) {
      console.log('Updating existing document:', existingDoc._id);
      // Update existing document
      result = await client
        .patch(existingDoc._id)
        .set({
          lastUpdated: new Date().toISOString(),
          candleData: JSON.stringify(candles)
        })
        .commit();
    } else {
      console.log('Creating new document');
      // Create new document
      result = await client.create({
        _type: 'marketData',
        pair,
        lastUpdated: new Date().toISOString(),
        candleData: JSON.stringify(candles)
      });
    }

    console.log('Operation completed successfully:', result._id);

    return NextResponse.json({
      success: true,
      message: existingDoc ? 'Market data updated' : 'Market data created',
      documentId: result._id
    });
  } catch (error) {
    console.error('Error in update-market-data:', error);
    return NextResponse.json(
      {
        error: 'Failed to update market data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
