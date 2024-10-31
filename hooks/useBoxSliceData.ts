import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { BoxSlice } from '@/types';
import { getBoxSlices } from '@/utils/boxSlices';

function compareSlices(
  slice1: BoxSlice,
  slice2: BoxSlice,
  offset: number,
  visibleBoxesCount: number
): boolean {
  const boxes1 = slice1.boxes.slice(offset, offset + visibleBoxesCount);
  const boxes2 = slice2.boxes.slice(offset, offset + visibleBoxesCount);

  if (boxes1.length !== boxes2.length) return false;

  for (let i = 0; i < boxes1.length; i++) {
    if (boxes1[i].value !== boxes2[i].value) return false;
  }

  return true;
}

export const useBoxSliceData = (
  pair: string,
  session: any,
  initialData: BoxSlice[],
  boxOffset: number,
  visibleBoxesCount: number
) => {
  const fetchData = useCallback(async () => {
    if (!session?.access_token) {
      console.error('No token available in the session');
      return [];
    }
    try {
      const data = await getBoxSlices(
        pair,
        undefined,
        500,
        session.access_token
      );
      console.log('Fetched data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching box slices:', error);
      return [];
    }
  }, [pair, session]);

  const { data, error, isLoading } = useQuery<BoxSlice[]>({
    queryKey: ['boxSlices', pair, session?.access_token],
    queryFn: fetchData,
    initialData: initialData,
    refetchInterval: 10000,
    enabled: !!session?.access_token
  });

  console.log('Query data:', data);
  console.log('Query error:', error);
  console.log('Query isLoading:', isLoading);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.reduce((acc: BoxSlice[], currentSlice, index) => {
      if (
        index === 0 ||
        !compareSlices(
          currentSlice,
          acc[acc.length - 1],
          boxOffset,
          visibleBoxesCount
        )
      ) {
        acc.push(currentSlice);
      }
      return acc;
    }, []);
  }, [data, boxOffset, visibleBoxesCount]);

  const candleData = useMemo(() => {
    if (!data || data.length === 0) {
      console.warn('No data available for candles');
      return [];
    }
    console.log('Data for candleData:', data);
    return data.map((slice) => ({
      time: new Date(slice.timestamp).toISOString(),
      open: slice.currentOHLC?.open ?? slice.boxes[0]?.high ?? 0,
      high:
        slice.currentOHLC?.high ??
        Math.max(...slice.boxes.map((box) => box.high)),
      low:
        slice.currentOHLC?.low ??
        Math.min(...slice.boxes.map((box) => box.low)),
      close:
        slice.currentOHLC?.close ??
        slice.boxes[slice.boxes.length - 1]?.low ??
        0
    }));
  }, [data]);

  return { data, filteredData, candleData, error, isLoading };
};
