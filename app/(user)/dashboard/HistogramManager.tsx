'use client';
import React, { useState, useCallback } from 'react';
import HistogramBox from './HistogramBox';
import HistogramControls from './HistogramControls';
import HistogramSwitcher from './HistogramSwitcher';
import type { BoxSlice } from '@/types';

interface HistogramManagerProps {
  data: BoxSlice[];
  height: number;
  onResize: (newHeight: number) => void;
  minHeight: number;
  maxHeight: number;
}

const HistogramManager: React.FC<HistogramManagerProps> = ({
  data,
  height,
  onResize,
  minHeight,
  maxHeight
}) => {
  const [boxOffset, setBoxOffset] = useState(0);
  const [viewType, setViewType] = useState<'scaled' | 'even'>('scaled');

  const handleOffsetChange = useCallback((change: number) => {
    setBoxOffset((prevOffset) => Math.max(0, prevOffset + change));
  }, []);

  const handleViewTypeChange = useCallback((newViewType: 'scaled' | 'even') => {
    setViewType(newViewType);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0">
      <div className="absolute right-2 top-2 z-20 flex items-center space-x-2">
        <HistogramControls
          boxOffset={boxOffset}
          onOffsetChange={handleOffsetChange}
          totalBoxes={data[0]?.boxes.length || 0}
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
        onResize={onResize}
        minHeight={minHeight}
        maxHeight={maxHeight}
      />
    </div>
  );
};

export default React.memo(HistogramManager);
