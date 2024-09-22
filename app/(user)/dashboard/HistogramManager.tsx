'use client';
import React, { useState, useCallback } from 'react';
import HistogramBox from './HistogramBox';
import HistogramControls from './HistogramControls';
import HistogramSwitcher from './HistogramSwitcher';
import type { BoxSlice } from '@/types';

interface HistogramManagerProps {
  data: BoxSlice[];
}

const HistogramManager: React.FC<HistogramManagerProps> = ({ data }) => {
  const [boxOffset, setBoxOffset] = useState(0);
  const [viewType, setViewType] = useState<'scaled' | 'even'>('scaled');

  const handleOffsetChange = useCallback((change: number) => {
    setBoxOffset((prevOffset) => Math.max(0, prevOffset + change));
  }, []);

  const handleViewTypeChange = useCallback((newViewType: 'scaled' | 'even') => {
    setViewType(newViewType);
  }, []);

  return (
    <div className="absolute bottom-0 w-full bg-gray-200 bg-red-600 p-2">
      <div className="absolute right-2 top-2 z-10 flex items-center space-x-2">
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
      <HistogramBox data={data} boxOffset={boxOffset} viewType={viewType} />
    </div>
  );
};

export default HistogramManager;
