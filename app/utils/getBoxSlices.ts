import { BoxSlice } from '@/types';

interface ApiResponse {
  status: string;
  data: BoxSlice[];
}

export async function getBoxSlices(pair: string): Promise<BoxSlice[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
  try {
    console.log(`Fetching from: ${baseUrl}/boxslices/${pair}`);
    const response = await fetch(`${baseUrl}/boxslices/${pair}`);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return [];
    }
    const apiResponse: ApiResponse = await response.json();
    console.log('Received data:', apiResponse);

    if (apiResponse.status !== 'success' || !Array.isArray(apiResponse.data)) {
      console.error('Invalid API response:', apiResponse);
      return [];
    }

    // Slice the last 1000 items
    return apiResponse.data.slice(-1000);
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}
