'use client';
import React, { useState, useCallback, useEffect } from 'react';
import HistogramBox from './HistogramBox';
import HistogramControls from './HistogramControls';
import HistogramSwitcher from './HistogramSwitcher';
import type { BoxSlice } from '@/types';

const VISIBLE_BOXES_COUNT = 15; // Move the constant here
const MIN_HISTOGRAM_HEIGHT = 100; // Move the constant here
const MAX_HISTOGRAM_HEIGHT = 600; // Move the constant here

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
  const [viewType, setViewType] = useState<'scaled' | 'even'>('scaled');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(height);

  const handleOffsetChange = useCallback((change: number) => {
    setBoxOffset((prevOffset) => Math.max(0, prevOffset + change));
  }, []);

  const handleViewTypeChange = useCallback((newViewType: 'scaled' | 'even') => {
    setViewType(newViewType);
  }, []);

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

  return (
    <div className="absolute bottom-0 left-0 right-0">
      <div className="absolute right-2 top-2 z-20 flex items-center space-x-2">
        <HistogramControls
          boxOffset={boxOffset}
          onOffsetChange={handleOffsetChange}
          totalBoxes={data[0]?.boxes.length || 0}
          visibleBoxesCount={VISIBLE_BOXES_COUNT} // Pass the constant here
        />
        <HistogramSwitcher
          viewType={viewType}
          onChange={handleViewTypeChange}
        />
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
        visibleBoxesCount={VISIBLE_BOXES_COUNT} // Pass the constant here
      />
    </div>
  );
};

export default React.memo(HistogramManager);
