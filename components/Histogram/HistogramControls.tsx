import React, { useState, useRef, useEffect } from 'react';
import { getTrendForOffset } from '@/app/utils/getTrendForOffset';
import { BoxSlice } from '@/types';

interface HistogramControlsProps {
  boxOffset: number;
  onOffsetChange: (offset: number) => void;
  totalBoxes: number;
  visibleBoxesCount: number;
  viewType: 'scaled' | 'even' | 'oscillator';
  onViewChange: (viewType: 'scaled' | 'even' | 'oscillator') => void;
  selectedFrame: BoxSlice | null;
  height: number;
}

const offsets = [
  { label: '4H', value: 0 },
  { label: '1H', value: 6 },
  { label: '15M', value: 12 },
  { label: '1M', value: 19 }
];

const HistogramControls: React.FC<HistogramControlsProps> = ({
  boxOffset,
  onOffsetChange,
  totalBoxes,
  visibleBoxesCount,
  viewType,
  onViewChange,
  selectedFrame,
  height
}) => {
  const [isOffsetSelectorOpen, setIsOffsetSelectorOpen] = useState(false);
  const [isViewSwitcherOpen, setIsViewSwitcherOpen] = useState(false);
  const [trends, setTrends] = useState<Record<number, 'up' | 'down'>>({});
  const offsetSelectorRef = useRef<HTMLDivElement>(null);
  const viewSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFrame && selectedFrame.boxes) {
      const newTrends: Record<number, 'up' | 'down'> = {};
      offsets.forEach(({ value }) => {
        newTrends[value] = getTrendForOffset(selectedFrame.boxes, value);
      });
      setTrends(newTrends);
    }
  }, [selectedFrame]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        viewSwitcherRef.current &&
        !viewSwitcherRef.current.contains(event.target as Node)
      ) {
        setIsViewSwitcherOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOffsetClick = (offset: number) => {
    onOffsetChange(offset);
    setIsOffsetSelectorOpen(false);
  };

  const renderTrendIcon = (trend: 'up' | 'down') => {
    const color = trend === 'up' ? 'text-teal-500' : 'text-red-500';
    return (
      <svg
        className={`h-4 w-4 ${color}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {trend === 'up' ? (
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        ) : (
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        )}
        <polyline
          points={trend === 'up' ? '17 6 23 6 23 12' : '17 18 23 18 23 12'}
        />
      </svg>
    );
  };

  const getCurrentViewIcon = () => {
    switch (viewType) {
      case 'scaled':
        return <ScaledIcon className="h-6 w-6" />;
      case 'even':
        return <EvenIcon className="h-6 w-6" />;

      case 'oscillator':
        return <OscillatorIcon className="h-6 w-6" />;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-between bg-black p-2"
      style={{ height: '100%', width: '100%' }}
    >
      <div className="flex flex-col space-y-2">
        <div className="relative" ref={offsetSelectorRef}>
          <button
            onClick={() => setIsOffsetSelectorOpen(!isOffsetSelectorOpen)}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
          >
            <ClockIcon />
          </button>
          {isOffsetSelectorOpen && (
            <div className="absolute right-0 mt-2 w-24 rounded border border-[#181818] bg-black shadow-lg">
              {offsets.map(({ label, value }) => {
                const trend = trends[value] || 'down';
                return (
                  <button
                    key={label}
                    onClick={() => handleOffsetClick(value)}
                    className={`flex w-full items-center px-2 py-1 text-xs hover:bg-[#181818] ${
                      boxOffset === value
                        ? 'bg-[#181818] text-white'
                        : 'bg-black text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    {renderTrendIcon(trend)}
                    <span className="ml-1">{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button
          onClick={() => onOffsetChange(Math.max(0, boxOffset - 1))}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
          disabled={boxOffset === 0}
        >
          <MinusIcon />
        </button>
        <button
          onClick={() =>
            onOffsetChange(
              Math.min(totalBoxes - visibleBoxesCount, boxOffset + 1)
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded border border-[#181818] bg-black text-white hover:bg-[#181818]"
          disabled={boxOffset >= totalBoxes - visibleBoxesCount}
        >
          <PlusIcon />
        </button>
      </div>
      <div className="relative" ref={viewSwitcherRef}>
        <button
          onClick={() => setIsViewSwitcherOpen(!isViewSwitcherOpen)}
          className="rounded border border-[#181818] bg-black p-1 hover:bg-[#181818]"
          title={`Current: ${viewType} View`}
        >
          {getCurrentViewIcon()}
        </button>
        {isViewSwitcherOpen && (
          <div className="absolute right-0 mt-2 w-32 rounded border border-[#181818] bg-black shadow-lg">
            {['scaled', 'even', 'oscillator'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  onViewChange(type as 'scaled' | 'even' | 'oscillator');
                  setIsViewSwitcherOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                  viewType === type
                    ? 'bg-[#181818] text-white'
                    : 'text-gray-300 hover:bg-[#181818] hover:text-white'
                }`}
              >
                {type === 'scaled' && <ScaledIcon className="mr-2 h-5 w-5" />}
                {type === 'even' && <EvenIcon className="mr-2 h-5 w-5" />}
                {type === 'oscillator' && (
                  <OscillatorIcon className="mr-2 h-5 w-5" />
                )}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MinusIcon: React.FC = () => (
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
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const PlusIcon: React.FC = () => (
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
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ScaledIcon: React.FC<{ className: string }> = ({ className }) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
    <line x1="21" y1="9" x2="3" y2="9"></line>
    <line x1="21" y1="15" x2="3" y2="15"></line>
  </svg>
);

const EvenIcon: React.FC<{ className: string }> = ({ className }) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="9" x2="15" y2="15"></line>
    <line x1="15" y1="9" x2="9" y2="15"></line>
  </svg>
);

const OscillatorIcon: React.FC<{ className: string }> = ({ className }) => (
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
    <path d="M14 3a4 4 0 0 0-4 4v4a4 4 0 0 0-4 4"></path>
    <path d="M20 3a4 4 0 0 0-4 4v4a4 4 0 0 0-4 4"></path>
    <path d="M14 17a4 4 0 0 0 4 4h4"></path>
    <path d="M20 17a4 4 0 0 0 4 4h4"></path>
  </svg>
);

const ClockIcon: React.FC = () => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default HistogramControls;
