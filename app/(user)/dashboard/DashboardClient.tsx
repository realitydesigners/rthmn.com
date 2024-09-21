'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { BoxSlice } from '@/types';
import HistogramLine from './HistogramLine';
import { oxanium } from '@/app/fonts';
import { getBoxSlices } from '@/app/utils/getBoxSlices';

interface DashboardClientProps {
  initialData: BoxSlice[];
}

const DashboardClient: React.FC<DashboardClientProps> = ({ initialData }) => {
  const [data, setData] = useState<BoxSlice[]>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [chartKey, setChartKey] = useState(0);

  const fetchData = useCallback(async () => {
    setIsUpdating(true);
    try {
      const newData = await getBoxSlices('USD_JPY');
      setData(newData);
      setLastUpdateTime(new Date());
      setChartKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error('Error fetching box slices:', error);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  };

  return (
    <div className={`w-full sm:px-6 lg:px-8 ${oxanium.className}`}>
      <h1 className="mb-6 pt-32 text-3xl font-bold">Trading Dashboard</h1>
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          Box Slices Histogram (USD_JPY)
        </h2>
        <p className="mb-2">Total Box Slices: {data.length}</p>
        <p className="mb-2">
          Last Data Timestamp: {formatTimestamp(data[0]?.timestamp)} (UTC)
        </p>
        <p className="mb-2">
          Last Update: {lastUpdateTime?.toLocaleString() || 'N/A'} (Local Time)
        </p>
        <p className="mb-2">
          Status:{' '}
          {isUpdating ? 'Updating...' : 'Idle (updates every 5 seconds)'}
        </p>
        <button
          onClick={fetchData}
          className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Refresh Data'}
        </button>
        <div className="mt-6 h-[400px] pr-[300px]">
          <HistogramLine data={data} key={chartKey} />
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
