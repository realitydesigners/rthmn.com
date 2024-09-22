'use client';
import React, { useState, useCallback } from 'react';
import HistogramBox from './HistogramBox';
import HistogramControls from './HistogramControls';
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
    <div className="relative">
      <HistogramControls
        boxOffset={boxOffset}
        onOffsetChange={handleOffsetChange}
        viewType={viewType}
        onViewTypeChange={handleViewTypeChange}
        totalBoxes={data[0]?.boxes.length || 0}
      />
      <HistogramBox
        data={data}
        boxOffset={boxOffset}
        viewType={viewType}
        onOffsetChange={handleOffsetChange}
        onViewTypeChange={handleViewTypeChange}
      />
    </div>
  );
};

export default HistogramManager;
