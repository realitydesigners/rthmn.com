import React from 'react';
import { Box } from '@/types';

interface BoxOffsetSelectorProps {
  onOffsetChange: (offset: number) => void;
  currentOffset: number;
  data: Box[];
}

const offsets = [
  { label: 'Swing', value: 0 },
  { label: 'IntraDay', value: 6 },
  { label: 'Short', value: 12 },
  { label: 'Now', value: 19 }
];

const BoxOffsetSelector: React.FC<BoxOffsetSelectorProps> = ({
  onOffsetChange,
  currentOffset,
  data
}) => {
  const getColorForOffset = (offset: number) => {
    const relevantBoxes = data.slice(offset, offset + 16);
    if (relevantBoxes.length === 0) {
      return '#808080'; // Default color when no boxes are available
    }
    const largestBox = relevantBoxes.reduce((max, box) =>
      Math.abs(box.value) > Math.abs(max.value) ? box : max
    );
    return largestBox.value > 0 ? '#10B981' : '#EF4444';
  };

  return (
    <div className="flex space-x-2">
      {offsets.map(({ label, value }) => {
        const color = getColorForOffset(value);
        return (
          <button
            key={label}
            onClick={() => onOffsetChange(value)}
            className={`flex items-center rounded px-2 py-1 text-sm ${
              currentOffset === value
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <svg
              className="mr-1 h-4 w-4"
              viewBox="0 0 24 24"
              fill={color}
              stroke={color}
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default BoxOffsetSelector;
