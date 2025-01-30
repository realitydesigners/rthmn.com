'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuX } from 'react-icons/lu';
import { ResoBox } from '@/components/ResoBox';
import { LineChart } from '@/components/CandleChart';
import { BoxSlice, OHLC, PairData } from '@/types/types';
import { useDashboard } from '@/providers/DashboardProvider/client';
import { useAuth } from '@/providers/SupabaseProvider';

interface ModalContentProps {
    pair: string;
}

export function ModalContent({ pair }: ModalContentProps) {
    const router = useRouter();
    const { pairData, boxColors } = useDashboard();

    const data = pairData[pair];
    const [initialData, setInitialData] = useState<BoxSlice[]>([]);
    const [boxOffset] = useState(0);
    const [visibleBoxesCount] = useState(16);

    function onDismiss() {
        router.back();
    }

    const hasData = data?.boxes?.length > 0;

    return (
        <div className='fixed inset-0 z-[100] h-full w-full bg-transparent'>
            <div className='animate-in fade-in slide-in-from-top-4 fixed inset-x-0 top-4 z-[100] mx-auto w-full max-w-2xl px-4 duration-300'>
                <div className='overflow-hidden rounded-2xl border border-[#222] bg-black shadow-2xl'>
                    {/* h-[calc(100vh-190px)] */}
                    <div className='h-auto overflow-y-auto'>
                        <div className='flex items-center justify-between border-b border-[#222] px-4 py-3'>
                            <div className='flex w-full items-center justify-center gap-3'>
                                <h3 className='font-outfit text-2xl font-bold tracking-wider text-white'>{pair.replace('_', '/')}</h3>
                                {data?.currentOHLC?.close && (
                                    <span className='font-kodemono text-sm font-medium text-gray-200'>{data.currentOHLC.close.toFixed(pair.includes('JPY') ? 3 : 5)}</span>
                                )}
                            </div>
                        </div>
                        {hasData ? (
                            <div className='flex h-auto flex-col'>
                                <div className='flex-1 p-4'>
                                    <ResoBox key={`${pair}-${data.boxes[0].timestamp}`} slice={data.boxes[0]} boxColors={boxColors} className='h-auto w-full' />
                                </div>
                            </div>
                        ) : (
                            <div className='flex h-full items-center justify-center'>
                                <div className='text-center text-white'>No data available</div>
                            </div>
                        )}
                        {/* {isLoading ? (
              <div className="flex h-[200px] items-center justify-center border-t border-[#222] bg-[#111]">
                <div className="text-sm text-gray-400">Loading chart...</div>
              </div>
            ) : (
              <div className="h-[200px] w-full">
                <LineChart pair={pair} candles={candleData} height={200} />
              </div>
            )} */}
                    </div>
                </div>
            </div>
            <div className='fixed inset-0' onClick={onDismiss} />
        </div>
    );
}
