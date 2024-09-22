'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoxSlice } from '@/types';
import { oxanium } from '@/app/fonts';
import HistogramManager from '../../../components/Histogram/HistogramManager';
import { getBoxSlices } from '@/app/utils/getBoxSlices';

interface DashboardClientProps {
  initialData: BoxSlice[];
}

const DashboardClient: React.FC<DashboardClientProps> = ({ initialData }) => {
  const [data, setData] = useState<BoxSlice[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [histogramHeight, setHistogramHeight] = useState(200); // Default height
  const lastTimestampRef = useRef<string | undefined>(
    initialData[initialData.length - 1]?.timestamp
  );

  // Function to compare two frames
  const areFramesEqual = useCallback(
    (frame1: BoxSlice, frame2: BoxSlice): boolean => {
      if (frame1.boxes.length !== frame2.boxes.length) return false;

      for (let i = 0; i < frame1.boxes.length; i++) {
        const box1 = frame1.boxes[i];
        const box2 = frame2.boxes[i];

        if (box1.value !== box2.value) {
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
    const deduplicatedInitialData = deduplicateData(initialData);
    setData(deduplicatedInitialData);
  }, [initialData, deduplicateData]);

  const fetchUpdates = useCallback(async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      console.log('Fetching updates since:', lastTimestampRef.current);
      const newData = await getBoxSlices('USD_JPY', lastTimestampRef.current);
      console.log('New data fetched:', newData.length, 'items');

      if (newData.length > 0) {
        setData((prevData) => {
          const updatedData = [...prevData];

          for (const newFrame of newData) {
            const lastFrame = updatedData[updatedData.length - 1];
            if (lastFrame && areFramesEqual(lastFrame, newFrame)) {
              // The new frame is identical to the last frame, skip adding it
              continue;
            }
            updatedData.push(newFrame);
          }

          const finalData = updatedData.slice(-250); // Keep this slice to maintain max 500 items
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
  }, [isUpdating, areFramesEqual]);

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
      ></div>

      <HistogramManager
        data={data}
        height={histogramHeight}
        onResize={handleHistogramResize}
      />
    </div>
  );
};

export default React.memo(DashboardClient);
