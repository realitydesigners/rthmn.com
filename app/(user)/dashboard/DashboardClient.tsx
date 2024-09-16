'use client';
import React, { useState, useEffect } from 'react';
import { BoxSlice } from '@/types';
import HistogramLine from './HistogramLine';
import { oxanium } from '@/app/fonts';

interface DashboardClientProps {
  initialData: BoxSlice[];
}

const isActualData = (slice: BoxSlice): boolean =>
  slice.boxes.some((box) => box.high !== 1);

const extractActualData = (data: BoxSlice[] | unknown): BoxSlice[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(isActualData);
};

const limitBoxSlices = (data: BoxSlice[], limit: number): BoxSlice[] => {
  return data.slice(0, limit);
};

const DashboardClient: React.FC<DashboardClientProps> = ({ initialData }) => {
  const [limitedData, setLimitedData] = useState(initialData);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(
    initialData[0]?.timestamp || null
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!lastTimestamp) return;

      try {
        const response = await fetch(
          `http://localhost:8080/boxslices/USD_JPY?since=${lastTimestamp}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newData: BoxSlice[] = await response.json();
        const actualNewData = extractActualData(newData);

        if (actualNewData.length > 0) {
          setLimitedData((prevData) => {
            const updatedData = [...actualNewData, ...prevData];
            const newLimitedData = limitBoxSlices(updatedData, 5000);
            setLastTimestamp(newLimitedData[0].timestamp);
            return newLimitedData;
          });
        }
      } catch (error) {
        console.error('Error fetching box slices:', error);
      }
    };

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, [lastTimestamp]);

  return (
    <div className={`w-full sm:px-6 lg:px-8 ${oxanium.className}`}>
      <h1 className="mb-6 pt-32 text-3xl font-bold">Trading Dashboard</h1>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">
          Box Slices Histogram (USD_JPY)
        </h2>
        <p className="mb-2">Total Box Slices: {limitedData.length}</p>
        <div className="mt-6 h-[400px] pr-[300px]">
          <HistogramLine data={limitedData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
