import React from 'react';
import { Box, BoxSlice } from '@/types';

interface BoxOffsetSelectorProps {
  onOffsetChange: (offset: number) => void;
  currentOffset: number;
  selectedFrame: BoxSlice | null;
  data: BoxSlice[];
}

const offsets = [
  { label: '4H', value: 0 },
  { label: '1H', value: 6 },
  { label: '15M', value: 12 },
  { label: '1M', value: 19 }
];

const VISIBLE_BOXES_COUNT = 16;

const BoxOffsetSelector: React.FC<BoxOffsetSelectorProps> = ({
  onOffsetChange,
  currentOffset,
  selectedFrame,
  data
}) => {
  const getTrendForOffset = (offset: number): 'up' | 'down' => {
    const frame = selectedFrame || (data.length > 0 ? data[0] : null);
    if (!frame || frame.boxes.length === 0) {
      return 'down'; // Default to 'down' if no data
    }
    const visibleBoxes = frame.boxes.slice(
      offset,
      offset + VISIBLE_BOXES_COUNT
    );
    if (visibleBoxes.length === 0) {
      return 'down'; // Default to 'down' if no visible boxes
    }
    const largestBox = visibleBoxes.reduce((max, box) =>
      Math.abs(box.value) > Math.abs(max.value) ? box : max
    );
    return largestBox.value > 0 ? 'up' : 'down';
  };

  const renderTrendIcon = (trend: 'up' | 'down') => {
    switch (trend) {
      case 'up':
        return (
          <svg
            className="h-4 w-4 text-teal-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        );
      case 'down':
        return (
          <svg
            className="h-4 w-4 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
        );
    }
  };

  return (
    <div className="flex space-x-2 bg-black p-1">
      {offsets.map(({ label, value }) => {
        const trend = getTrendForOffset(value);
        return (
          <button
            key={label}
            onClick={() => onOffsetChange(value)}
            className={`flex items-center rounded px-2 py-1 text-sm hover:bg-[#181818] ${
              currentOffset === value
                ? 'bg-[#181818] text-white'
                : 'hover:bg-{#333] bg-black text-gray-300'
            }`}
          >
            {renderTrendIcon(trend)}
            <span className="ml-1">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BoxOffsetSelector;
