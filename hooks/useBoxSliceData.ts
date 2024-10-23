import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { BoxSlice } from '@/types';
import { getBoxSlices, compareSlices } from '@/utils/boxSlices';

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
      return await getBoxSlices(pair, undefined, 500, session.access_token);
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
