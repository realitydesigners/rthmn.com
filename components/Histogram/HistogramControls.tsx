import React from 'react';

interface HistogramControlsProps {
  boxOffset: number;
  onOffsetChange: (change: number) => void;
  totalBoxes: number;
  visibleBoxesCount: number; // Accept the prop here
}

const HistogramControls: React.FC<HistogramControlsProps> = ({
  boxOffset,
  onOffsetChange,
  totalBoxes,
  visibleBoxesCount // Use the prop here
}) => {
  return (
    <>
      <button
        onClick={() => onOffsetChange(-1)}
        className="h-8 w-8 rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
        disabled={boxOffset === 0}
      >
        -
      </button>
      <button
        onClick={() => onOffsetChange(1)}
        className="h-8 w-8 rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
        disabled={boxOffset >= totalBoxes - visibleBoxesCount} // Use the prop here
      >
        +
      </button>
    </>
  );
};

export default HistogramControls;
