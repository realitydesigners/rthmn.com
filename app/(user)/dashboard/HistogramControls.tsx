import React from 'react';

interface HistogramControlsProps {
  boxOffset: number;
  onOffsetChange: (change: number) => void;
  totalBoxes: number;
}

const VISIBLE_BOXES_COUNT = 15;

const HistogramControls: React.FC<HistogramControlsProps> = ({
  boxOffset,
  onOffsetChange,
  totalBoxes
}) => {
  return (
    <>
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
    </>
  );
};

export default HistogramControls;
