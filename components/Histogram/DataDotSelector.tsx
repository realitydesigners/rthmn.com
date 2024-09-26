import React, { useMemo, useState, useCallback } from 'react';
import { BoxSlice } from '@/types';

interface DataDotSelectorProps {
  currentFrame: BoxSlice | null;
  onRangeChange: (start: number, end: number) => void;
  currentOffset: number;
  visibleBoxesCount: number;
}

const DataDotSelector: React.FC<DataDotSelectorProps> = ({
  currentFrame,
  onRangeChange
}) => {
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);

  const dots = useMemo(() => {
    if (!currentFrame) return [];

    return currentFrame.boxes.map((box, index) => ({
      value: box.value,
      isPositive: box.value > 0,
      isInRange:
        rangeStart !== null &&
        rangeEnd !== null &&
        index >= Math.min(rangeStart, rangeEnd) &&
        index <= Math.max(rangeStart, rangeEnd)
    }));
  }, [currentFrame, rangeStart, rangeEnd]);

  const handleDotClick = useCallback(
    (index: number) => {
      if (rangeStart === null) {
        setRangeStart(index);
        setRangeEnd(null);
      } else if (rangeEnd === null) {
        setRangeEnd(index);
        onRangeChange(Math.min(rangeStart, index), Math.max(rangeStart, index));
      } else {
        setRangeStart(index);
        setRangeEnd(null);
      }
    },
    [rangeStart, rangeEnd, onRangeChange]
  );

  return (
    <div className="space-x- flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-900 to-gray-900/75 p-3 shadow-lg">
      {dots.map((dot, index) => (
        <button
          key={index}
          className={`l h-2 w-2 transition-all duration-200 ${
            dot.isPositive
              ? 'h-2 w-2 rounded-full bg-gradient-to-r from-teal-400 to-green-500'
              : 'h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500'
          } ${
            dot.isInRange
              ? 'h-2 w-2 rounded-full ring-1 ring-blue-400/50 ring-offset-2 ring-offset-gray-800'
              : ''
          } ${
            index === rangeStart || index === rangeEnd
              ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800'
              : ''
          } transform hover:scale-110 hover:opacity-100`}
          onClick={() => handleDotClick(index)}
          title={`Offset: ${index}, Value: ${dot.value}`}
        >
          <span className="sr-only">Select dot {index}</span>
        </button>
      ))}
    </div>
  );
};

export default DataDotSelector;
