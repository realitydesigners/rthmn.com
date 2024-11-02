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

  useEffect(() => {
    const container = tableRef.current;
    if (!container) return;

    const scrollTo = patternWidth * currentSequenceIndex;
    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    });
  }, [currentSequenceIndex, patternWidth]);

  return (
    <div className="space-y-8">
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
                    className={`relative flex-shrink-0 transition-all duration-300 ${isCurrentPattern ? 'scale-105 opacity-100' : 'scale-100 opacity-60'} hover:scale-105 hover:opacity-100`}
                    style={{
                      width: `${patternWidth}px`,
                      height: 'calc(100% - 16px)',
                      transformOrigin: 'center center'
                    }}
                  >
                    <div className="relative" style={{ height: '100%' }}>
                      {sequence.positions.map(
                        ({ boxNumber, position, isUp }) => (
                          <div
                            key={boxNumber}
                            className="group absolute left-0 cursor-pointer transition-all duration-500"
                            style={{
                              width: `${boxSize}px`,
                              height: `${boxSize}px`,
                              bottom: `${position * boxSize}px`,
                              background: isUp
                                ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.1))'
                                : 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(255,0,0,0.1))',
                              boxShadow: isUp
                                ? '0 0 15px rgba(16,185,129,0.2), inset 0 0 5px rgba(16,185,129,0.1)'
                                : '0 0 15px rgba(255,0,0,0.2), inset 0 0 5px rgba(255,0,0,0.1)',
                              border: isUp
                                ? '1px solid rgba(16,185,129,0.3)'
                                : '1px solid rgba(255,0,0,0.3)',
                              left: '2px',
                              zIndex: 10
                            }}
                          ></div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
