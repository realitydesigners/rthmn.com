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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="max-h-[70vh] w-[70vw] overflow-auto rounded-lg bg-[#000] p-4 text-gray-300 shadow-xl">
        <h2 className="mb-3 text-xl font-bold">Frame Data</h2>
        <p className="mb-3 text-sm text-gray-400">
          Time: {selectedFrame.timestamp}
        </p>
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">All Boxes</h3>
          <div className="grid grid-cols-8 gap-3">
            {selectedFrame.boxes.map((box, index) => (
              <div
                key={index}
                className="flex flex-col rounded bg-gray-900 p-2"
              >
                <div className="mb-1 flex items-center space-x-1">
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${
                      box.value > 0 ? 'bg-teal-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {box.value > 0 ? 'Up' : 'Down'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Value: {Math.abs(box.value)}</p>
                  <p>High: {box.high.toFixed(5)}</p>
                  <p>Low: {box.low.toFixed(5)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold">Visible Boxes</h3>
          <div className="grid grid-cols-4 gap-3">
            {visibleBoxes.map((box, index) => (
              <div
                key={index}
                className="rounded border border-gray-700 bg-gray-800 p-2 text-xs shadow"
              >
                <p className="font-semibold">Box {index + 1}</p>
                <p className="text-gray-400">Value: {box.value}</p>
                <p className="text-gray-400">High: {box.high.toFixed(5)}</p>
                <p className="text-gray-400">Low: {box.low.toFixed(5)}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default React.memo(SelectedFrameDetails);
