import React from 'react';
import type { BoxSlice } from '@/types';

interface SelectedFrameDetailsProps {
  selectedFrame: BoxSlice;
}

const SelectedFrameDetails: React.FC<SelectedFrameDetailsProps> = ({
  selectedFrame
}) => {
  return (
    <div className="bottom absolute left-0 z-50 mb-4 h-full w-[450px] rounded-lg bg-gray-800 p-6 text-white shadow-xl">
      <h3 className="mb-4 text-xl font-semibold">Frame Data</h3>
      <p className="mb-4 text-sm text-[#A0A0A0]">
        Time: {selectedFrame.timestamp}
      </p>
      <ul className="space-y-1">
        {selectedFrame.boxes.map((box, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded p-3"
          >
            <div className="flex items-center space-x-1">
              <span
                className={`inline-block h-3 w-3 rounded-full ${
                  box.value > 0 ? 'bg-teal-500' : 'bg-red-500'
                }`}
              />
              <span className="font-medium">
                {box.value > 0 ? 'Up' : 'Down'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-[#A0A0A0]">
              <span>·</span>
              <span>Value: {Math.abs(box.value)}</span>
              <span>·</span>
              <span>High: {box.high.toFixed(5)}</span>
              <span>·</span>
              <span>Low: {box.low.toFixed(5)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(SelectedFrameDetails);
