import React, { useMemo } from 'react';
import { BoxSlice } from '@/types';

interface DataDotSelectorProps {
  currentFrame: BoxSlice | null;
  onOffsetChange: (offset: number) => void;
  currentOffset: number;
  visibleBoxesCount: number;
}

const DataDotSelector: React.FC<DataDotSelectorProps> = ({
  currentFrame,
  onOffsetChange,
  currentOffset,
  visibleBoxesCount
}) => {
  const dots = useMemo(() => {
    if (!currentFrame) return [];

    return currentFrame.boxes.map((box, index) => ({
      value: box.value,
      isPositive: box.value > 0,
      isSelected:
        index >= currentOffset && index < currentOffset + visibleBoxesCount
    }));
  }, [currentFrame, currentOffset, visibleBoxesCount]);

  return (
    <div className="flex items-center justify-center space-x-1 bg-black p-2">
      {dots.map((dot, index) => (
        <button
          key={index}
          className={`h-3 w-3 rounded-full transition-all duration-200 ${
            dot.isPositive ? 'bg-green-500' : 'bg-red-500'
          } ${
            dot.isSelected
              ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-black'
              : ''
          } ${
            index >= currentOffset && index < currentOffset + visibleBoxesCount
              ? 'opacity-100'
              : 'opacity-50'
          } hover:opacity-100`}
          onClick={() => onOffsetChange(index)}
          title={`Offset: ${index}, Value: ${dot.value}`}
        />
      ))}
    </div>
  );
};

export default DataDotSelector;
