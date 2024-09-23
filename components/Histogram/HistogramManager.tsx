'use client';
import React, { useState, useCallback, useEffect } from 'react';
import HistogramBox from './HistogramBox';
import HistogramControls from './HistogramControls';
import HistogramSwitcher from './HistogramSwitcher';
import BoxOffsetSelector from './BoxOffsetSelector';
import SelectedFrameDetails from './SelectedFrameDetails';
import type { BoxSlice } from '@/types';

const VISIBLE_BOXES_COUNT = 16;
const MIN_HISTOGRAM_HEIGHT = 100;
const MAX_HISTOGRAM_HEIGHT = 400;
const ZOOMED_BAR_WIDTH = 16;
const INITIAL_BAR_WIDTH = 16;

interface HistogramManagerProps {
  data: BoxSlice[];
  height: number;
  onResize: (newHeight: number) => void;
}

const HistogramManager: React.FC<HistogramManagerProps> = ({
  data,
  height,
  onResize
}) => {
  const [boxOffset, setBoxOffset] = useState(0);
  const [viewType, setViewType] = useState<'scaled' | 'even' | 'chart'>(
    'chart'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(height);
  const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(
    null
  );

  const handleOffsetChange = useCallback((newOffset: number) => {
    setBoxOffset(newOffset);
  }, []);

  const handleViewChange = useCallback(
    (newViewType: 'scaled' | 'even' | 'chart') => {
      setViewType(newViewType);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      const newHeight = Math.min(
        Math.max(startHeight + deltaY, MIN_HISTOGRAM_HEIGHT),
        MAX_HISTOGRAM_HEIGHT
      );
      onResize(newHeight);
    },
    [isDragging, startY, startHeight, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  const handleFrameSelect = useCallback((frame: BoxSlice, index: number) => {
    setSelectedFrame((prev) => (prev === frame ? null : frame));
    setSelectedFrameIndex((prev) => (prev === index ? null : index));
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const visibleBoxes = selectedFrame
    ? selectedFrame.boxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT)
    : [];

  return (
    <div className="absolute bottom-0 m-2 w-full">
      <div className="mb-2 flex justify-center">
        <BoxOffsetSelector
          onOffsetChange={handleOffsetChange}
          currentOffset={boxOffset}
          selectedFrame={selectedFrame}
          data={data}
        />
      </div>
      <div className="absolute right-2 top-2 z-20 flex items-center space-x-2">
        <HistogramControls
          boxOffset={boxOffset}
          onOffsetChange={handleOffsetChange}
          totalBoxes={data[selectedFrameIndex ?? 0]?.boxes.length || 0}
          visibleBoxesCount={VISIBLE_BOXES_COUNT}
        />
        <HistogramSwitcher viewType={viewType} onChange={handleViewChange} />
      </div>
      <HistogramBox
        data={data}
        boxOffset={boxOffset}
        viewType={viewType}
        height={height}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        setStartY={setStartY}
        setStartHeight={setStartHeight}
        visibleBoxesCount={VISIBLE_BOXES_COUNT}
        zoomedBarWidth={ZOOMED_BAR_WIDTH}
        initialBarWidth={INITIAL_BAR_WIDTH}
        onFrameSelect={handleFrameSelect}
      />
      {selectedFrame && (
        <SelectedFrameDetails
          selectedFrame={selectedFrame}
          visibleBoxes={visibleBoxes}
          onClose={() => {
            setSelectedFrame(null);
            setSelectedFrameIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default React.memo(HistogramManager);
