'use client';
import React, { useState, useEffect, useRef } from 'react';
import { BoxSlice, PairData, ViewType } from '@/types';
import HistogramManager from '../../../components/Histogram/HistogramManager';
import RthmnVision from '../../../components/LineChart';
import { useAuth } from '@/providers/SupabaseProvider';
import { useDraggableHeight } from '@/hooks/useDraggableHeight';
import { useBoxSliceData } from '@/hooks/useBoxSliceData';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useSelectedFrame } from '@/hooks/useSelectedFrame';

interface DashboardClientProps {
  initialData: BoxSlice[];
  pair: string;
  allPairsData: Record<string, PairData>;
}

const Client: React.FC<DashboardClientProps> = ({
  initialData,
  pair,
  allPairsData
}) => {
  const { session } = useAuth();
  const { boxOffset, handleOffsetChange } = useUrlParams(pair);
  const { selectedFrame, selectedFrameIndex, handleFrameSelect } =
    useSelectedFrame();
  const [visibleBoxesCount, setVisibleBoxesCount] = useState(16);
  const { data, filteredData, candleData, error, isLoading } = useBoxSliceData(
    pair,
    session,
    initialData,
    boxOffset,
    visibleBoxesCount
  );

  const [viewType, setViewType] = useState<ViewType>('oscillator');
  const containerRef = useRef<HTMLDivElement>(null);
  const [rthmnVisionDimensions, setRthmnVisionDimensions] = useState({
    width: 0,
    height: 0
  });

  const {
    height: histogramHeight,
    isDragging,
    handleDragStart
  } = useDraggableHeight({
    initialHeight: 200,
    minHeight: 100,
    maxHeight: 350
  });

  const handleViewChange = (newViewType: ViewType) => {
    setViewType(newViewType);
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const containerWidth = containerRef.current.clientWidth;
        const newRthmnVisionHeight = containerHeight - histogramHeight - 80;
        setRthmnVisionDimensions({
          width: containerWidth,
          height: Math.max(newRthmnVisionHeight, 200)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [histogramHeight]);

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-full flex-col overflow-hidden bg-black"
    >
      <div
        className="flex-grow overflow-hidden pt-[80px]"
        style={{
          minHeight: `${rthmnVisionDimensions.height}px`
        }}
      >
        {candleData.length > 0 ? (
          <RthmnVision
            pair={pair}
            candles={candleData}
            width={rthmnVisionDimensions.width}
            height={rthmnVisionDimensions.height - 40}
          />
        ) : (
          <div>No candle data available</div>
        )}
      </div>
      <div
        className="flex-shrink-0"
        style={{
          height: `${histogramHeight + 40}px`
        }}
      >
        <HistogramManager
          data={filteredData}
          height={histogramHeight}
          boxOffset={boxOffset}
          onOffsetChange={handleOffsetChange}
          visibleBoxesCount={visibleBoxesCount}
          viewType={viewType}
          onViewChange={handleViewChange}
          selectedFrame={selectedFrame}
          selectedFrameIndex={selectedFrameIndex}
          onFrameSelect={handleFrameSelect}
          isDragging={isDragging}
          onDragStart={handleDragStart}
          containerWidth={rthmnVisionDimensions.width}
        />
      </div>
    </div>
  );
};

export default React.memo(Client);
