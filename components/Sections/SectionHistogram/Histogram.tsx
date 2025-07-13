import { getAnimationSequence } from "@/components/Constants/constants";
import type React from "react";

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

export const Histogram: React.FC<HistoricalPatternViewProps> = ({
  tableRef,
  demoStep,
  patterns,
  dimensions,
}) => {
  const animationSequence = getAnimationSequence();
  const currentSequenceIndex = Math.floor(demoStep / 1) % patterns.length;
  const { availableHeight, boxSize, patternWidth } = dimensions;

  return (
    <div
      className="font-kodemono border-neutral flex w-full items-center justify-center overflow-hidden rounded-lg"
      style={{
        height: `${availableHeight + 25}px`,
        padding: "0px",
      }}
    >
      <div className="relative z-10 h-full items-center justify-center overflow-x-auto">
        <div
          ref={tableRef}
          className="relative flex h-full"
          style={{
            width: `${patternWidth * animationSequence.length}px`,
          }}
        >
          {animationSequence
            .slice(0, currentSequenceIndex + 1)
            .map((sequence, patternIndex) => {
              const isCurrentPattern = patternIndex === currentSequenceIndex;

              return (
                <div
                  key={patternIndex}
                  className={`relative shrink-0 transition-all duration-300 ${
                    isCurrentPattern
                      ? "scale-105 opacity-100"
                      : "scale-100 opacity-70"
                  } hover:scale-105 hover:opacity-100`}
                  style={{
                    width: `${patternWidth}px`,
                    height: "calc(100% - 12px)",
                  }}
                >
                  <div className="relative h-full">
                    {sequence.positions.map(({ boxNumber, position, isUp }) => (
                      <div
                        key={boxNumber}
                        className={`group absolute left-0 cursor-pointer transition-all duration-300 ${
                          isUp
                            ? "border-blue-500/50 bg-blue-500/40 shadow-blue-500/30"
                            : "border-red-500/40 bg-red-500/30 shadow-red-500/30"
                        } border shadow-[0_0_4px]`}
                        style={{
                          width: `${boxSize}px`,
                          height: `${boxSize}px`,
                          bottom: `${position * boxSize}px`,
                          left: "0px",
                          zIndex: 10,
                          transform: `scale(${isUp ? 1.02 : 1})`,
                          opacity: isUp ? 1 : 0.9,
                          willChange: "transform, opacity",
                        }}
                      >
                        <div className="h-full w-full transition-opacity hover:opacity-80" />
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
