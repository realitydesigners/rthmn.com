import React from 'react';
import { SVGProps } from 'react';

interface HistogramSwitcherProps {
  viewType: 'scaled' | 'even';
  onChange: (viewType: 'scaled' | 'even') => void;
}

const HistogramSwitcher: React.FC<HistogramSwitcherProps> = ({
  viewType,
  onChange
}) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onChange('scaled')}
        className={`rounded p-1 ${
          viewType === 'scaled' ? 'bg-blue-500' : 'bg-gray-700'
        }`}
        title="Scaled View"
      >
        <ScaledIcon className="h-6 w-6" />
      </button>
      <button
        onClick={() => onChange('even')}
        className={`rounded p-1 ${
          viewType === 'even' ? 'bg-blue-500' : 'bg-gray-700'
        }`}
        title="Even View"
      >
        <EvenIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

const ScaledIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

const EvenIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

export default HistogramSwitcher;
