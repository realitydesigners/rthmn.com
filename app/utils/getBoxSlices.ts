import { BoxSlice } from '@/types';

interface ApiResponse {
  status: string;
  data: Array<{
    timestamp: string;
    boxes: number[];
  }>;
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toISOString();
}

export async function getBoxSlices(
  pair: string,
  lastTimestamp?: string,
  count?: number
): Promise<BoxSlice[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
  let url = `${baseUrl}/boxslices/${pair}`;

  const params = new URLSearchParams();
  if (lastTimestamp)
    params.append('lastTimestamp', formatTimestamp(lastTimestamp));
  if (count) params.append('count', count.toString());

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

    // Transform the data to match the BoxSlice type
    const transformedData: BoxSlice[] = apiResponse.data.map((item) => ({
      timestamp: item.timestamp,
      boxes: item.boxes.map((value) => ({ value }))
    }));

    console.log(`Returning ${transformedData.length} items from getBoxSlices`);
    return transformedData;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}
