import React from 'react';

interface HistogramControlsProps {
  boxOffset: number;
  onOffsetChange: (change: number) => void;
  totalBoxes: number;
  visibleBoxesCount: number;
  onOpenVisibleBoxesModal: () => void;
}

const HistogramControls: React.FC<HistogramControlsProps> = ({
  boxOffset,
  onOffsetChange,
  totalBoxes,
  visibleBoxesCount,
  onOpenVisibleBoxesModal
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onOffsetChange(-1)}
        className="h-8 w-8 rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
        disabled={boxOffset === 0}
      >
        <ChevronLeftIcon />
      </button>
      <button
        onClick={() => onOffsetChange(1)}
        className="h-8 w-8 rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
        disabled={boxOffset >= totalBoxes - visibleBoxesCount}
      >
        <ChevronRightIcon />
      </button>
      <button
        onClick={onOpenVisibleBoxesModal}
        className="flex items-center rounded border border-[#181818] bg-black p-2 text-white hover:bg-[#181818]"
      >
        <ViewBoxesIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

const ChevronLeftIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const ViewBoxesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export default HistogramControls;
