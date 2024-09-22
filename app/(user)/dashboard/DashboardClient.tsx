'use client';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import { BoxSlice } from '@/types';
import { oxanium } from '@/app/fonts';
import HistogramLine from './HistogramLine';
import { getBoxSlices } from '@/app/utils/getBoxSlices';
import HistogramManager from './HistogramManager';

const VISIBLE_BOXES_COUNT = 20;

interface DashboardClientProps {
  initialData: BoxSlice[];
}

const DashboardClient: React.FC<DashboardClientProps> = ({ initialData }) => {
  const [data, setData] = useState<BoxSlice[]>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
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

  useEffect(() => {
    const intervalId = setInterval(fetchUpdates, 5000);
    return () => clearInterval(intervalId);
  }, [fetchUpdates]);

  const formatTimestamp = useCallback((timestamp: string | null) => {
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
  }, []);

  return (
    <div className={`w-full sm:px-6 lg:px-8 ${oxanium.className}`}>
      <div className="mt-20">
        {/* <HistogramLine data={data} /> */}
        <div className="bottom-0 mr-[400px] mt-6">
          <HistogramManager data={data} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(DashboardClient);
