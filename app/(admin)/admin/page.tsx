'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/app/(admin)/_components/AdminSidebar';
import { RightSidebar } from '@/app/(admin)/_components/RightSidebar';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';

const fetchCandles = async (pair: string, limit: number, token: string) => {
    const response = await fetch(`/api/getCandles?pair=${pair}&limit=${limit}&token=${token}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const { data } = await response.json();
    return data;
};

const fetchPairBoxSlices = async (pair: string, count: number, token: string) => {
    const response = await fetch(`/api/getBoxSlice?pair=${pair}&token=${token}&count=${count}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
};

const useFetchState = <T,>(initialState: T | null = null) => {
    const [data, setData] = useState<T | null>(initialState);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFetch = async (fetchFn: () => Promise<T>) => {
        setIsLoading(true);
        setError('');
        try {
            const result = await fetchFn();
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, handleFetch, setData };
};

const BoxValidationTable = ({ pairData, selectedPairs }) => {
    if (!selectedPairs.length) return null;

    const validateBox = (box) => {
        const diff = Number((box.high - box.low).toFixed(5));
        const absValue = Math.abs(Number(box.value));
        const isValid = Math.abs(diff - absValue) < 0.00001;
        return isValid;
    };

    // Find the maximum number of boxes across all pairs
    const maxBoxes = Math.max(...selectedPairs.map((pair) => pairData[pair]?.boxes?.[0]?.boxes?.length || 0));

    // Calculate validation summary for each pair
    const validationSummary = selectedPairs.reduce((acc, pair) => {
        const boxes = pairData[pair]?.boxes?.[0]?.boxes || [];
        const validCount = boxes.filter((box) => validateBox(box)).length;
        acc[pair] = {
            valid: validCount,
            invalid: boxes.length - validCount,
            total: boxes.length,
        };
        return acc;
    }, {});

    return (
        <div className='w-full overflow-x-auto'>
            <div className='mb-4 flex flex-wrap items-center gap-4 border-b border-[#181818] pb-4'>
                <div className='text-gray-400'>Summary:</div>
                {selectedPairs.map((pair) => (
                    <div key={pair} className='flex items-center gap-3'>
                        <span className='font-medium text-white'>{pair}:</span>
                        <div className='flex items-center gap-2 text-xs'>
                            <span className='text-green-400'>✓{validationSummary[pair].valid}</span>
                            <span className='text-red-400'>✗{validationSummary[pair].invalid}</span>
                            <span className='text-gray-500'>({validationSummary[pair].total})</span>
                        </div>
                    </div>
                ))}
            </div>
            <table className='w-full text-xs'>
                <thead>
                    <tr className='border-b border-[#181818]'>
                        <th className='p-2 text-left text-gray-400'>Box #</th>
                        {selectedPairs.map((pair) => (
                            <th key={pair} className='p-2 text-left'>
                                <span className='font-medium text-white'>{pair}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(maxBoxes)].map((_, idx) => (
                        <tr key={idx} className='border-b border-[#181818]/50'>
                            <td className='p-2 text-gray-500'>Box {idx + 1}</td>
                            {selectedPairs.map((pair) => {
                                const box = pairData[pair]?.boxes?.[0]?.boxes?.[idx];
                                if (!box)
                                    return (
                                        <td key={pair} className='p-2 text-gray-500'>
                                            -
                                        </td>
                                    );

                                const isValid = validateBox(box);
                                return (
                                    <td key={pair} className='p-2'>
                                        <div className='flex flex-col gap-1'>
                                            <div className='flex items-center gap-2'>
                                                <span className={`font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>{isValid ? '✓' : '✗'}</span>
                                                <span className='text-gray-400'>H:</span>
                                                <span className='text-green-400'>{box.high.toFixed(5)}</span>
                                                <span className='text-gray-400'>L:</span>
                                                <span className='text-red-400'>{box.low.toFixed(5)}</span>
                                            </div>
                                            <div className='text-[10px] text-gray-500'>
                                                <span>Box Size: {(box.high - box.low).toFixed(5)}</span>
                                                <span className='ml-2'>Value: {box.value}</span>
                                            </div>
                                            {!isValid && (
                                                <div className='text-[10px] text-red-400'>Difference: {Math.abs(box.high - box.low - Math.abs(box.value)).toFixed(5)}</div>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const boxColors = {
    positive: '#00ff00',
    negative: '#ff0000',
    styles: {
        startIndex: 0,
        maxBoxCount: 38,
        showLineChart: false,
        globalTimeframeControl: false,
        borderRadius: 0,
        shadowIntensity: 0.5,
        opacity: 0.5,
        showBorder: true,
    },
} as const;

export default function AdminPage() {
    const { session } = useAuth();
    const { isConnected, selectedPairs } = useDashboard();
    const { priceData } = useWebSocket();
    const { pairData } = useDashboard();
    const [selectedPair, setSelectedPair] = useState<string | null>(null);
    const [boxCount, setBoxCount] = useState(500);
    const [limit, setLimit] = useState(100);
    const [isChronological, setIsChronological] = useState(false);
    const { data: candles, error, isLoading, handleFetch: fetchWithState } = useFetchState<any[]>([]);
    const { data: pairBoxSlices, handleFetch: fetchBoxSlicesWithState } = useFetchState<any>(null);

    const handleFetchCandles = async (candleLimit: number) => {
        if (!session?.access_token || !selectedPair) return;
        await fetchWithState(() => fetchCandles(selectedPair, candleLimit, session.access_token));
    };

    const handleFetchBoxSlices = async () => {
        if (!session?.access_token || !selectedPair) return;
        const data = await fetchBoxSlicesWithState(() => fetchPairBoxSlices(selectedPair, boxCount, session.access_token));
        console.log(`Received ${data.length} box slices for ${selectedPair}`);
    };

    useEffect(() => {
        if (session?.access_token && selectedPair) {
            handleFetchCandles(limit).catch(console.error);
            handleFetchBoxSlices().catch(console.error);
        }
    }, [session, selectedPair]);

    return (
        <div className='mt-10 flex'>
            <AdminSidebar priceData={priceData} selectedPairs={selectedPairs} onPairSelect={setSelectedPair} selectedPair={selectedPair} />
            <div className='ml-[300px] min-h-screen flex-1 bg-black p-4 text-white lg:mr-[400px]'>
                <div className='mt-4 rounded border border-[#181818] bg-[#0a0a0a] p-4'>
                    <BoxValidationTable pairData={pairData} selectedPairs={selectedPairs} />
                </div>
            </div>
            <RightSidebar
                selectedPair={selectedPair}
                candles={candles}
                isLoading={isLoading}
                error={error}
                limit={limit}
                setLimit={setLimit}
                isChronological={isChronological}
                setIsChronological={setIsChronological}
                handleFetchCandles={handleFetchCandles}
                pairBoxSlices={pairBoxSlices}
                handleFetchBoxSlices={handleFetchBoxSlices}
            />
        </div>
    );
}
