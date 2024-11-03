import React, { useEffect } from 'react';
import { getAnimationSequence } from '@/app/_components/constants';

interface HistoricalPatternViewProps {
  tableRef: React.RefObject<HTMLDivElement>;
  demoStep: number;
  patterns: any[];
  dimensions: {
    totalHeight: number;
    headerHeight: number;
    footerHeight: number;
    availableHeight: number;
    boxSize: number;
    patternWidth: number;
  };
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isPaused: boolean;
}

export const HistoricalPatternView: React.FC<HistoricalPatternViewProps> = ({
  tableRef,
  demoStep,
  patterns,
  dimensions
}) => {
  const animationSequence = getAnimationSequence();
  const currentSequenceIndex = Math.floor(demoStep / 1) % patterns.length;
  const { availableHeight, boxSize, patternWidth } = dimensions;

  return (
    <div
      className={`text-kodemono border-gray relative flex w-full items-center justify-center overflow-hidden rounded-lg`}
      style={{
        height: `${availableHeight + 35}px`,
        padding: '0px'
      }}
    >
      <div className="relative z-10 h-full items-center justify-center overflow-x-auto px-4">
        <div
          ref={tableRef}
          className="relative flex"
          style={{
            height: '100%',
            width: `${patternWidth * animationSequence.length}px`,
            transform: 'translateY(0px)'
          }}
        >
          {animationSequence
            .slice(0, currentSequenceIndex + 1)
            .map((sequence, patternIndex) => {
              const isCurrentPattern = patternIndex === currentSequenceIndex;

              return (
                <div
                  key={patternIndex}
                  className={`relative flex-shrink-0 transition-all duration-300 ${
                    isCurrentPattern
                      ? 'scale-105 opacity-100'
                      : 'scale-100 opacity-70'
                  } hover:scale-105 hover:opacity-100`}
                  style={{
                    width: `${patternWidth}px`,
                    height: 'calc(100% - 16px)',
                    transformOrigin: 'center center'
                  }}
                >
                  <div className="relative h-full">
                    {sequence.positions.map(({ boxNumber, position, isUp }) => (
                      <div
                        key={boxNumber}
                        className="group absolute left-0 cursor-pointer transition-all duration-500"
                        style={{
                          width: `${boxSize}px`,
                          height: `${boxSize}px`,
                          bottom: `${position * boxSize}px`,
                          background: isUp ? '#22c55e10 ' : '#ef444433',
                          boxShadow: isUp
                            ? '0 0 25px #22c55e50 , inset 0 0 0px #22c55e33'
                            : '0 0 25px #ef444466, inset 0 0 0px #ef444433',
                          border: isUp
                            ? '1px solid #22c55e15 '
                            : '1px solid #ef444499',
                          left: '0px',
                          zIndex: 10,
                          transform: `scale(${isUp ? 1.05 : 1})`,
                          opacity: isUp ? 1 : 1,
                          willChange: 'transform, opacity'
                        }}
                      >
                        <div
                          className="h-full w-full"
                          style={{
                            background: isUp ? '#22c55e50 ' : '#ef44441a',
                            animation: 'pulse 2s ease-in-out infinite',
                            willChange: 'opacity, transform'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
