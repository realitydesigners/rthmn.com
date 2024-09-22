import React from 'react';
import HistogramSwitcher from './HistogramSwitcher';

interface HistogramControlsProps {
  boxOffset: number;
  onOffsetChange: (change: number) => void;
  viewType: 'scaled' | 'even';
  onViewTypeChange: (viewType: 'scaled' | 'even') => void;
  totalBoxes: number;
}

const VISIBLE_BOXES_COUNT = 15;

const HistogramControls: React.FC<HistogramControlsProps> = ({
  boxOffset,
  onOffsetChange,
  viewType,
  onViewTypeChange,
  totalBoxes
}) => {
  return (
    <div className="absolute left-2 top-2 z-10 flex items-center space-x-2">
      <button
        onClick={() => onOffsetChange(-1)}
        className="rounded bg-gray-700 px-2 py-1 text-white hover:bg-gray-600"
        disabled={boxOffset === 0}
      >
        -
      </button>
      <button
        onClick={() => onOffsetChange(1)}
        className="rounded bg-gray-700 px-2 py-1 text-white hover:bg-gray-600"
        disabled={boxOffset >= totalBoxes - VISIBLE_BOXES_COUNT}
      >
        +
      </button>
      <HistogramSwitcher viewType={viewType} onChange={onViewTypeChange} />
    </div>
  );
};

export default HistogramControls;
