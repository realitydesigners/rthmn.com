import React from 'react';
import type { BoxSlice } from '@/types';

interface SelectedFrameDetailsProps {
  selectedFrame: BoxSlice;
  visibleBoxes: BoxSlice['boxes'];
  onClose: () => void;
}

const SelectedFrameDetails: React.FC<SelectedFrameDetailsProps> = ({
  selectedFrame,
  visibleBoxes,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="max-h-[80vh] w-[80vw] overflow-auto rounded-lg bg-gray-800 p-6 text-white shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">Frame Data</h2>
        <p className="mb-4 text-lg text-gray-300">
          Time: {selectedFrame.timestamp}
        </p>
        <div className="mb-6">
          <h3 className="mb-2 text-xl font-semibold">All Boxes</h3>
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
                <div className="flex items-center space-x-1 text-sm text-gray-300">
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
        <div>
          <h3 className="mb-2 text-xl font-semibold">Visible Boxes</h3>
          <div className="grid grid-cols-4 gap-4">
            {visibleBoxes.map((box, index) => (
              <div
                key={index}
                className="rounded border border-gray-600 bg-gray-700 p-3 shadow"
              >
                <p className="font-semibold">Box {index + 1}</p>
                <p className="text-gray-300">Value: {box.value}</p>
                <p className="text-gray-300">High: {box.high.toFixed(5)}</p>
                <p className="text-gray-300">Low: {box.low.toFixed(5)}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default React.memo(SelectedFrameDetails);
