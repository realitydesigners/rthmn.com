'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoxSlice } from '@/types';
import { oxanium } from '@/app/fonts';
import HistogramManager from '../../../components/Histogram/HistogramManager';
import { getBoxSlices } from '@/app/utils/getBoxSlices';

interface DashboardClientProps {
  initialData: BoxSlice[];
  pair: string;
}

const DashboardClient: React.FC<DashboardClientProps> = ({
  initialData,
  pair
}) => {
  const [data, setData] = useState<BoxSlice[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [histogramHeight, setHistogramHeight] = useState(200); // Default height
  const lastTimestampRef = useRef<string | undefined>(
    initialData[initialData.length - 1]?.timestamp
  );
  console.log(data, 'data');

  // Update the areFramesEqual function
  const areFramesEqual = useCallback(
    (frame1: BoxSlice, frame2: BoxSlice): boolean => {
      if (frame1.boxes.length !== frame2.boxes.length) return false;

      for (let i = 0; i < frame1.boxes.length; i++) {
        if (frame1.boxes[i].value !== frame2.boxes[i].value) {
          return false;
        }
      }
      return true;
    },
    []
  );

  // Deduplicate initialData by comparing each frame to the previous one
  const deduplicateData = useCallback(
    (data: BoxSlice[]): BoxSlice[] => {
      if (data.length === 0) return data;
      const deduplicatedData = [data[0]];

      for (let i = 1; i < data.length; i++) {
        const prevFrame = deduplicatedData[deduplicatedData.length - 1];
        const currentFrame = data[i];
        if (!areFramesEqual(prevFrame, currentFrame)) {
          deduplicatedData.push(currentFrame);
        }
      }
      return deduplicatedData;
    },
    [areFramesEqual]
  );

  // Initialize data with deduplicated initialData
  useEffect(() => {
    console.log(
      'Initial data received in DashboardClient:',
      initialData.length,
      'items'
    );
    const deduplicatedInitialData = deduplicateData(initialData);
    console.log(
      'Deduplicated initial data:',
      deduplicatedInitialData.length,
      'items'
    );
    setData(deduplicatedInitialData);
  }, [initialData, deduplicateData]);

  // Log whenever data state changes
  useEffect(() => {
    console.log('Data state updated:', data.length, 'items');
  }, [data]);

  const fetchUpdates = useCallback(async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('Fetching updates since:', lastTimestampRef.current);
      const newData = await getBoxSlices(
        pair, // Use the pair prop here
        lastTimestampRef.current,
        250
      );
      console.log('New data fetched:', newData.length, 'items');

      if (newData.length > 0) {
        setData((prevData) => {
          const updatedData = [...prevData, ...newData];
          const deduplicatedData = deduplicateData(updatedData);
          const finalData = deduplicatedData.slice(-250);
          console.log(
            'Updated data after deduplication:',
            finalData.length,
            'items'
          );
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
  }, [isUpdating, deduplicateData, pair]); // Add pair to the dependency array

  const handleHistogramResize = useCallback((newHeight: number) => {
    setHistogramHeight(newHeight);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(fetchUpdates, 5000);
    return () => clearInterval(intervalId);
  }, [fetchUpdates]);

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${oxanium.className}`}
    >
      <div
        className="overflow-auto bg-black p-4"
        style={{ height: `calc(100vh - ${histogramHeight}px)` }}
      >
        <p>Current pair: {pair}</p>
        {/* You can add a debug display here if needed */}
        <p>Current data length: {data.length}</p>
      </div>

      <HistogramManager
        data={data}
        height={histogramHeight}
        onResize={handleHistogramResize}
      />
    </div>
  );
};

export default React.memo(DashboardClient);
