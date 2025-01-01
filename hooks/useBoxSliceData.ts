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
    return response.json();
}

function compareSlices(slice1: BoxSlice, slice2: BoxSlice, offset: number, visibleBoxesCount: number): boolean {
    const boxes1 = slice1.boxes.slice(offset, offset + visibleBoxesCount);
    const boxes2 = slice2.boxes.slice(offset, offset + visibleBoxesCount);

    if (boxes1.length !== boxes2.length) return false;

    for (let i = 0; i < boxes1.length; i++) {
        if (boxes1[i].value !== boxes2[i].value) return false;
    }

    return true;
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

    const { data, error, isLoading } = useQuery<BoxSlice[]>({
        queryKey: ['boxSlices', pair, session?.access_token],
        queryFn: fetchData,
        initialData: initialData,
        refetchInterval: 10000,
        enabled: !!session?.access_token,
    });

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.reduce((acc: BoxSlice[], currentSlice, index) => {
            if (index === 0 || !compareSlices(currentSlice, acc[acc.length - 1], boxOffset, visibleBoxesCount)) {
                acc.push(currentSlice);
            }
            return acc;
        }, []);
    }, [data, boxOffset, visibleBoxesCount]);

    const formattedCandleData = useMemo(() => {
        if (!data) return [];

        return data.map((item) => ({
            ...item,
            time: new Date(item.timestamp).getTime(),
            open: Number(item.currentOHLC.open),
            high: Number(item.currentOHLC.high),
            low: Number(item.currentOHLC.low),
            close: Number(item.currentOHLC.close),
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
