import React from 'react';
import type { Box } from '@/types';

interface VisibleBoxesModalProps {
  visibleBoxes: Box[];
  onClose: () => void;
}

const VisibleBoxesModal: React.FC<VisibleBoxesModalProps> = ({
  visibleBoxes,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="max-h-[80vh] w-[80vw] overflow-auto rounded-lg bg-gray-800 p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-white">Visible Boxes</h2>
        <div className="grid grid-cols-4 gap-4">
          {visibleBoxes.map((box, index) => (
            <div
              key={index}
              className="rounded border border-gray-600 bg-gray-700 p-3 shadow"
            >
              <p className="font-semibold text-white">Box {index + 1}</p>
              <p className="text-gray-300">Value: {box.value}</p>
              <p className="text-gray-300">High: {box.high.toFixed(5)}</p>
              <p className="text-gray-300">Low: {box.low.toFixed(5)}</p>
            </div>
          ))}
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

export default VisibleBoxesModal;
