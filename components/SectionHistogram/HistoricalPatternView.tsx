import React, { useEffect } from 'react';
import { getAnimationSequence } from '@/app/constants/constants';

interface HistoricalPatternViewProps {
  tableRef: React.RefObject<HTMLDivElement>;
  demoStep: number;
  patterns: any[];
  dimensions: {
    totalHeight: number;
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
      className={`text-kodemono border-gray flex w-full items-center justify-center overflow-hidden rounded-lg`}
      style={{
        height: `${availableHeight + 25}px`,
        padding: '0px'
      }}
    >
      <div className="relative z-10 h-full items-center justify-center overflow-x-auto">
        <div
          ref={tableRef}
          className="relative flex h-full"
          style={{
            width: `${patternWidth * animationSequence.length}px`
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
                    height: 'calc(100% - 12px)'
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
                          background: isUp
                            ? 'linear-gradient(to right, rgba(16,185,129,0.15), rgba(52,211,153,0.15), rgba(110,231,183,0.15))'
                            : 'linear-gradient(to right, rgba(239,68,68,0.15), rgba(239,68,68,0.18), rgba(248,113,113,0.15))',
                          boxShadow: isUp
                            ? '0 0 20px rgba(16,185,129,0.2), inset 0 0 2px rgba(52,211,153,0.3)'
                            : '0 0 20px rgba(239,68,68,0.25), inset 0 0 2px rgba(248,113,113,0.3)',
                          border: isUp
                            ? '1px solid rgba(52,211,153,0.3)'
                            : '1px solid rgba(248,113,113,0.3)',
                          left: '0px',
                          zIndex: 10,
                          transform: `scale(${isUp ? 1.05 : 1})`,
                          opacity: isUp ? 1 : 0.95,
                          willChange: 'transform, opacity'
                        }}
                      >
                        <div
                          className="h-full w-full"
                          style={{
                            background: isUp
                              ? 'linear-gradient(to right, rgba(16,185,129,0.25), rgba(52,211,153,0.25), rgba(110,231,183,0.25))'
                              : 'linear-gradient(to right, rgba(239,68,68,0.25), rgba(248,113,113,0.25), rgba(239,68,68,0.25))',
                            animation: 'pulse 2s ease-in-out infinite'
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
