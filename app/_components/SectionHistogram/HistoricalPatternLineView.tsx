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

export const HistoricalPatternLineView: React.FC<
  HistoricalPatternViewProps
> = ({ tableRef, demoStep, patterns, dimensions }) => {
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

  const createBoxPath = (isUp: boolean) => {
    const width = boxSize;
    const height = boxSize;
    const angleOffset = width * 0.3;

    if (isUp) {
      return `
        M 0,0
        H ${width - angleOffset}
        L ${width},${angleOffset}
        V ${height}
        H 0
        Z
      `;
    } else {
      return `
        M 0,0
        H ${width}
        V ${height - angleOffset}
        L ${width - angleOffset},${height}
        H 0
        Z
      `;
    }
  };

  const createMeetingPointPath = (
    prevY: number | null,
    currentY: number,
    nextY: number | null,
    x: number,
    sliceWidth: number
  ) => {
    const cornerRadius = sliceWidth / 8;
    let path = '';

    // Draw connection to previous point if it exists
    if (prevY !== null) {
      path += `M ${x - sliceWidth / 2} ${prevY} 
               H ${x - cornerRadius}
               Q ${x} ${prevY}, ${x} ${prevY + Math.sign(currentY - prevY) * cornerRadius}
               V ${currentY - Math.sign(currentY - prevY) * cornerRadius}
               Q ${x} ${currentY}, ${x + cornerRadius} ${currentY}
               H ${x + sliceWidth / 2}`;
    }

    // Draw connection to next point if it exists
    if (nextY !== null) {
      path += `M ${x + sliceWidth / 2} ${currentY} 
               H ${x + sliceWidth - cornerRadius}
               Q ${x + sliceWidth} ${currentY}, ${x + sliceWidth} ${currentY + Math.sign(nextY - currentY) * cornerRadius}
               V ${nextY - Math.sign(nextY - currentY) * cornerRadius}
               Q ${x + sliceWidth} ${nextY}, ${x + sliceWidth + cornerRadius} ${nextY}
               H ${x + sliceWidth * 1.5}`;
    }

    return path;
  };

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
            <svg
              className="absolute inset-0"
              width="100%"
              height="100%"
              style={{ overflow: 'visible' }}
            >
              {animationSequence
                .slice(0, currentSequenceIndex + 1)
                .map((sequence, index) => {
                  const changedBox = sequence.changes.find(
                    (change) => change.fromPosition !== change.toPosition
                  );
                  if (!changedBox) return null;

                  const currentY =
                    availableHeight -
                    (changedBox.toPosition * boxSize + boxSize / 2);
                  const x = index * patternWidth + boxSize / 2;

                  const prevSequence =
                    index > 0
                      ? animationSequence[index - 1].changes.find(
                          (change) => change.fromPosition !== change.toPosition
                        )
                      : null;
                  const nextSequence =
                    index < currentSequenceIndex
                      ? animationSequence[index + 1].changes.find(
                          (change) => change.fromPosition !== change.toPosition
                        )
                      : null;

                  const prevY = prevSequence
                    ? availableHeight -
                      (prevSequence.toPosition * boxSize + boxSize / 2)
                    : null;
                  const nextY = nextSequence
                    ? availableHeight -
                      (nextSequence.toPosition * boxSize + boxSize / 2)
                    : null;

                  return (
                    <path
                      key={index}
                      d={createMeetingPointPath(
                        prevY,
                        currentY,
                        nextY,
                        x,
                        patternWidth
                      )}
                      fill="none"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="2"
                      className="transition-all duration-300"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="20"
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </path>
                  );
                })}
            </svg>

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
                        : 'scale-100 opacity-60'
                    } hover:scale-105 hover:opacity-100`}
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
                              left: '2px',
                              zIndex: 10
                            }}
                          >
                            <svg
                              width={boxSize}
                              height={boxSize}
                              className="absolute"
                            >
                              <path
                                d={createBoxPath(isUp)}
                                fill={
                                  isUp
                                    ? 'rgba(16,185,129,0.1)'
                                    : 'rgba(255,0,0,0.1)'
                                }
                                stroke={
                                  isUp
                                    ? 'rgba(16,185,129,0.3)'
                                    : 'rgba(255,0,0,0.3)'
                                }
                                strokeWidth="1"
                                filter={`drop-shadow(0 0 8px ${
                                  isUp
                                    ? 'rgba(16,185,129,0.2)'
                                    : 'rgba(255,0,0,0.2)'
                                })`}
                              />
                            </svg>
                          </div>
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
