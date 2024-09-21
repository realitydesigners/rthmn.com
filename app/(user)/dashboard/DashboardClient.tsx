'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoxSlice } from '@/types';
import HistogramLine from './HistogramLine';
import { oxanium } from '@/app/fonts';
import { getBoxSlices } from '@/app/utils/getBoxSlices';

const VISIBLE_BOXES_COUNT = 4; // or whatever number you want to show

interface DashboardClientProps {
  initialData: BoxSlice[];
}

const DashboardClient: React.FC<DashboardClientProps> = ({ initialData }) => {
  const [data, setData] = useState<BoxSlice[]>(initialData.slice(-1000));
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [boxOffset, setBoxOffset] = useState(0);
  const lastTimestampRef = useRef<string | undefined>(
    initialData[initialData.length - 1]?.timestamp
  );

  const fetchUpdates = useCallback(async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('Fetching updates since:', lastTimestampRef.current);
      const newData = await getBoxSlices('USD_JPY', lastTimestampRef.current);
      console.log('New data fetched:', newData.length, 'items');

      if (newData.length > 0) {
        setData((prevData) => {
          const updatedData = [...prevData, ...newData];
          const finalData = updatedData.slice(-1000);
          console.log('Updated data:', finalData.length, 'items');
          return finalData;
        });
        lastTimestampRef.current = newData[newData.length - 1].timestamp;
        setLastUpdateTime(new Date());
      } else {
        console.log('No new data to update');
      }
    } catch (error) {
      console.error('Error fetching box slice updates:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating]);

  useEffect(() => {
    const intervalId = setInterval(fetchUpdates, 5000);
    return () => clearInterval(intervalId);
  }, [fetchUpdates]);

  const handleOffsetChange = (change: number) => {
    setBoxOffset((prev) => {
      const newOffset = prev + change;
      const maxOffset = Math.max(
        0,
        (data[0]?.boxes.length || 0) - VISIBLE_BOXES_COUNT
      );
      return Math.max(0, Math.min(newOffset, maxOffset));
    });
  };

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
          Last Data Timestamp:{' '}
          {formatTimestamp(data[data.length - 1]?.timestamp)} (UTC)
        </p>
        <p className="mb-2">
          Last Update: {lastUpdateTime?.toLocaleString() || 'N/A'} (Local Time)
        </p>
        <p className="mb-2">
          Status:{' '}
          {isUpdating ? 'Updating...' : 'Idle (updates every 5 seconds)'}
        </p>
        <button
          onClick={fetchUpdates}
          className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Refresh Data'}
        </button>
        <div className="relative mt-6 h-[400px] pr-[300px]">
          <HistogramLine
            data={data}
            boxOffset={boxOffset}
            onOffsetChange={handleOffsetChange}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
