import React, { useState, useRef, useEffect } from 'react';
import { SVGProps } from 'react';

interface HistogramSwitcherProps {
  viewType: 'scaled' | 'even' | 'chart';
  onChange: (viewType: 'scaled' | 'even' | 'chart') => void;
}

const HistogramSwitcher: React.FC<HistogramSwitcherProps> = ({
  viewType,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleIconClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (newViewType: 'scaled' | 'even' | 'chart') => {
    onChange(newViewType);
    setIsOpen(false);
  };

  const getCurrentIcon = () => {
    switch (viewType) {
      case 'scaled':
        return <ScaledIcon className="h-6 w-6" />;
      case 'even':
        return <EvenIcon className="h-6 w-6" />;
      case 'chart':
        return <ChartIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleIconClick}
        className="bg-black p-1 hover:bg-[#181818]"
        title={`Current: ${viewType} View`}
      >
        {getCurrentIcon()}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 shadow-lg">
          {['scaled', 'even', 'chart'].map((type) => (
            <button
              key={type}
              onClick={() =>
                handleOptionClick(type as 'scaled' | 'even' | 'chart')
              }
              className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                viewType === type
                  ? 'bg-[#181818] text-white'
                  : 'text-gray-300 hover:bg-[#181818] hover:text-white'
              }`}
            >
              {type === 'scaled' && <ScaledIcon className="mr-2 h-5 w-5" />}
              {type === 'even' && <EvenIcon className="mr-2 h-5 w-5" />}
              {type === 'chart' && <ChartIcon className="mr-2 h-5 w-5" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Icon components remain the same
const ChartIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 17h18M3 13h12M3 9h6" />
    <path d="M3 21V3" />
  </svg>
);

const ScaledIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
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
    strokeWidth="1.5"
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
