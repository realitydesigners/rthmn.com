'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoxSlice } from '@/types';
import { oxanium } from '@/app/fonts';
import HistogramLine from './HistogramLine';
import { getBoxSlices } from '@/app/utils/getBoxSlices';
import HistogramManager from './HistogramManager';

const MIN_HISTOGRAM_HEIGHT = 100;
const MAX_HISTOGRAM_HEIGHT = 600;

interface DashboardClientProps {
  initialData: BoxSlice[];
}

const DashboardClient: React.FC<DashboardClientProps> = ({ initialData }) => {
  const [data, setData] = useState<BoxSlice[]>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [histogramHeight, setHistogramHeight] = useState(300); // Default height
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
          const finalData = updatedData.slice(-1000); // Keep this slice to maintain max 1000 items
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

  const handleHistogramResize = useCallback((newHeight: number) => {
    setHistogramHeight(
      Math.min(Math.max(newHeight, MIN_HISTOGRAM_HEIGHT), MAX_HISTOGRAM_HEIGHT)
    );
  }, []);

  useEffect(() => {
    const intervalId = setInterval(fetchUpdates, 1000);
    return () => clearInterval(intervalId);
  }, [fetchUpdates]);

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${oxanium.className}`}
    >
      <div
        className="overflow-auto bg-black p-4"
        style={{ height: `calc(100vh - ${histogramHeight}px)` }}
      ></div>
      <HistogramManager
        data={data}
        height={histogramHeight}
        onResize={handleHistogramResize}
        minHeight={MIN_HISTOGRAM_HEIGHT}
        maxHeight={MAX_HISTOGRAM_HEIGHT}
      />
    </div>
  );
};

export default React.memo(DashboardClient);
