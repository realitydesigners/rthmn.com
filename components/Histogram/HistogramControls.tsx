import React from 'react';
import { ViewType } from '@/types/types';
import {
  ScaledIcon,
  EvenIcon,
  OscillatorIcon,
  MinusIcon,
  PlusIcon
} from '@/components/Icons/icons';

interface HistogramControlsProps {
  boxOffset: number;
  onOffsetChange: (newOffset: number) => void;
  totalBoxes: number;
  visibleBoxesCount: number;
  viewType: ViewType;
  onViewChange: (newViewType: ViewType) => void;
  selectedFrame: any | null;
  height: number;
}

const AdjusterButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}> = ({ icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818] disabled:opacity-50"
    disabled={disabled}
  >
    {icon}
  </button>
);

const ViewIcon: React.FC<{ viewType: ViewType }> = ({ viewType }) => {
  switch (viewType) {
    case 'scaled':
      return <ScaledIcon className="h-6 w-6 text-white" />;
    case 'even':
      return <EvenIcon className="h-6 w-6 text-white" />;
    case 'oscillator':
      return <OscillatorIcon className="h-6 w-6 text-white" />;
  }
};

const HistogramControls: React.FC<HistogramControlsProps> = ({
  boxOffset,
  onOffsetChange,
  totalBoxes,
  visibleBoxesCount,
  viewType,
  onViewChange
}) => {
  const cycleViewType = () => {
    const views: ViewType[] = ['scaled', 'even', 'oscillator'];
    const currentIndex = views.indexOf(viewType);
    const nextIndex = (currentIndex + 1) % views.length;
    onViewChange(views[nextIndex]);
  };

  return (
    <div className="absolute top-0 right-0 flex h-full w-16 flex-col items-center justify-center border-l border-[#181818] bg-black">
      <AdjusterButton
        icon={<PlusIcon />}
        onClick={() => onOffsetChange(Math.max(0, boxOffset - 1))}
        disabled={boxOffset === 0}
      />
      <div className="text-center text-white">
        <div>{boxOffset}</div>
        <div>{totalBoxes - 1}</div>
      </div>
      <AdjusterButton
        icon={<MinusIcon />}
        onClick={() =>
          onOffsetChange(
            Math.min(totalBoxes - visibleBoxesCount, boxOffset + 1)
          )
        }
        disabled={boxOffset >= totalBoxes - visibleBoxesCount}
      />
      <button
        onClick={cycleViewType}
        className="mt-2 flex h-10 w-10 items-center justify-center rounded-sm border border-[#181818] bg-black text-white hover:bg-[#181818]"
      >
        <ViewIcon viewType={viewType} />
      </button>
    </div>
  );
};

export default React.memo(HistogramControls);
