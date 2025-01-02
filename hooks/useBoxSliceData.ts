import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { BoxSlice } from '@/types/types';

async function fetchBoxSlices(pair: string, lastTimestamp: string | undefined, count: number, token: string): Promise<BoxSlice[]> {
    const params = new URLSearchParams({
        pair,
        token,
    });
    if (lastTimestamp) params.append('lastTimestamp', lastTimestamp);
    if (count) params.append('count', count.toString());

    const response = await fetch(`/api/getBoxSlice?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch box slices');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export const useBoxSliceData = (pair: string, session: any, initialData: BoxSlice[], boxOffset: number, visibleBoxesCount: number) => {
    const fetchData = useCallback(async () => {
        if (!session?.access_token) {
            console.error('No token available in the session');
            return [];
        }
        try {
            const data = await fetchBoxSlices(pair, undefined, 500, session.access_token);
            console.log('Fetched data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching box slices:', error);
            return [];
        }
    }, [pair, session]);

    const {
        data = [],
        error,
        isLoading,
    } = useQuery<BoxSlice[]>({
        queryKey: ['boxSlices', pair, session?.access_token],
        queryFn: fetchData,
        initialData: initialData,
        refetchInterval: 10000,
        enabled: !!session?.access_token,
    });

    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        let lastUniqueSlice: BoxSlice | null = null;
        return data.filter((currentSlice, index) => {
            if (index === 0) {
                lastUniqueSlice = currentSlice;
                return true;
            }

            const boxes1 = currentSlice.boxes.slice(boxOffset, boxOffset + visibleBoxesCount);
            const boxes2 = lastUniqueSlice!.boxes.slice(boxOffset, boxOffset + visibleBoxesCount);

            const isUnique = boxes1.some((box, i) => box.value !== boxes2[i]?.value);

            if (isUnique) {
                lastUniqueSlice = currentSlice;
                return true;
            }
            return false;
        });
    }, [data, boxOffset, visibleBoxesCount]);

    const formattedCandleData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        return data.map((item) => ({
            ...item,
            time: new Date(item.timestamp).getTime(),
            open: Number(item.currentOHLC?.open || 0),
            high: Number(item.currentOHLC?.high || 0),
            low: Number(item.currentOHLC?.low || 0),
            close: Number(item.currentOHLC?.close || 0),
        }));
    }, [data]);

    return {
        data,
        filteredData,
        candleData: formattedCandleData,
        error,
        isLoading,
    };
};
