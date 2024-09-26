import React from 'react';
import { Box } from '@/types';

interface OffsetModalProps {
  offset: number;
  visibleBoxes: Box[];
  onClose: () => void;
}

const OffsetModal: React.FC<OffsetModalProps> = ({
  offset,
  visibleBoxes,
  onClose
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded bg-white p-4 shadow-lg">
        <h2 className="mb-2 text-lg font-bold">Current Offset: {offset}</h2>
        <ul className="list-disc pl-5">
          {visibleBoxes.map((box, index) => (
            <li key={index}>Value: {box.value}</li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OffsetModal;
