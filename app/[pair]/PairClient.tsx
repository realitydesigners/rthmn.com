'use client';
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BoxSlice } from '@/types';
import { oxanium } from '@/app/fonts';
import HistogramManager from '../../components/Histogram/HistogramManager';
import { getBoxSlices } from '@/app/utils/getBoxSlices';

interface DashboardClientProps {
  initialData: BoxSlice[];
  pair: string;
}

const PairClient: React.FC<DashboardClientProps> = ({ initialData, pair }) => {
  const [histogramHeight, setHistogramHeight] = useState(200);

  const fetchData = useCallback(async () => {
    const newData = await getBoxSlices(pair, undefined, 250);
    console.log('New data fetched:', newData.length, 'items');
    return newData;
  }, [pair]);

  const { data, isLoading, error, refetch } = useQuery<BoxSlice[]>({
    queryKey: ['boxSlices', pair],
    queryFn: fetchData,
    initialData: initialData,
    refetchInterval: 5000
  });

  const handleHistogramResize = useCallback((newHeight: number) => {
    setHistogramHeight(newHeight);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${oxanium.className}`}
    >
      <div
        className="overflow-auto bg-black p-4"
        style={{ height: `calc(100vh - ${histogramHeight}px)` }}
      >
        <p>Current pair: {pair}</p>
        <p>Current data length: {data.length}</p>
        <button onClick={() => refetch()}>Refresh Data</button>
      </div>

      <HistogramManager
        data={data}
        height={histogramHeight}
        onResize={handleHistogramResize}
      />
    </div>
  );
};

export default React.memo(PairClient);
