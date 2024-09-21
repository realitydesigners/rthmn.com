import { BoxSlice } from '@/types';

interface ApiResponse {
  status: string;
  data: BoxSlice[];
}

export async function getBoxSlices(
  pair: string,
  lastTimestamp?: string,
  limit?: number
): Promise<BoxSlice[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
  let url = `${baseUrl}/boxslices/${pair}`;

  const params = new URLSearchParams();
  if (lastTimestamp) params.append('lastTimestamp', lastTimestamp);
  if (limit) params.append('limit', limit.toString());

  if (params.toString()) url += `?${params.toString()}`;

  try {
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url);
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

    // If lastTimestamp is provided, return only the latest item
    if (lastTimestamp) {
      return apiResponse.data.slice(-1);
    }

    return apiResponse.data;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}
