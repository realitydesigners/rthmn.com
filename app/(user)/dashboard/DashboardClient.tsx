'use client';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import { BoxSlice } from '@/types';
import HistogramBox from './HistogramBox';
import { oxanium } from '@/app/fonts';
import { getBoxSlices } from '@/app/utils/getBoxSlices';

const VISIBLE_BOXES_COUNT = 20;

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

  const handleOffsetChange = useCallback((change: number) => {
    setBoxOffset((prev) => {
      const newOffset = prev + change;
      const maxOffset = Math.max(
        0,
        (data[0]?.boxes.length || 0) - VISIBLE_BOXES_COUNT
      );
      return Math.max(0, Math.min(newOffset, maxOffset));
    });
  }, []); // Remove the dependency on data

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

  const memoizedHistogramBox = useMemo(
    () => (
      <HistogramBox
        data={data}
        boxOffset={boxOffset}
        onOffsetChange={handleOffsetChange}
      />
    ),
    [data, boxOffset, handleOffsetChange]
  );
  return (
    <div className={`w-full sm:px-6 lg:px-8 ${oxanium.className}`}>
      <div className="mt-20">
        <div className="bottom-0 mr-[400px] mt-6">{memoizedHistogramBox}</div>
      </div>
    </div>
  );
};

export default React.memo(DashboardClient); // Memoize the entire component
