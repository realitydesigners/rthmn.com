'use client';
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BoxSlice } from '@/types';
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

  return (
    <div>
      <HistogramManager
        data={data}
        height={histogramHeight}
        onResize={handleHistogramResize}
      />
    </div>
  );
};

export default React.memo(PairClient);
