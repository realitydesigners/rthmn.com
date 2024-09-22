// LineBoxes.jsx
import React from 'react';
import type { BoxSlice } from '@/types';

interface LineBoxesProps {
  boxArray: BoxSlice['boxes'];
  isSelected: boolean;
  height: number;
  visibleBoxesCount: number;
  zoomedBarWidth: number;
  initialBarWidth: number;
  meetingPointY: number;
  prevMeetingPointY: number | null;
  nextMeetingPointY: number | null;
  sliceWidth: number;
}

export const LineBoxes: React.FC<LineBoxesProps> = ({
  boxArray,
  isSelected,
  height,
  visibleBoxesCount,
  zoomedBarWidth,
  initialBarWidth,
  meetingPointY,
  prevMeetingPointY,
  nextMeetingPointY,
  sliceWidth
}) => {
  const boxHeight = height / visibleBoxesCount;
  const sortedBoxes = boxArray.slice(0, visibleBoxesCount);

  const positiveBoxes = sortedBoxes.filter((box) => box.value > 0);
  const negativeBoxes = sortedBoxes.filter((box) => box.value <= 0);

  let positiveOffset = 0;
  let negativeOffset = 0;

  const width = sliceWidth;

  return (
    <div
      className="relative"
      style={{
        width: width,
        height: `${height}px`,
        position: 'relative'
      }}
    >
      {/* Render negative boxes stacking from the top */}
      {negativeBoxes.map((box, idx) => {
        const boxColor = 'bg-[#222]'; // Negative color
        const positionStyle: React.CSSProperties = {
          position: 'absolute',
          top: `${negativeOffset}px`,
          width: '100%',
          height: `${boxHeight}px`
        };
        negativeOffset += boxHeight;
        return (
          <div
            key={`negative-${idx}`}
            className={`${boxColor} border border-black`}
            style={{
              ...positionStyle,
              margin: '0px'
            }}
          >
            {/* Dot in the middle of the negative box */}
            <div
              className="absolute left-1/2 -translate-x-1/2 transform"
              style={{
                top: '50%',
                width: '2px',
                height: '2px',
                borderRadius: '50%',
                backgroundColor: 'red',
                position: 'absolute'
              }}
            />
          </div>
        );
      })}

      {/* Render positive boxes stacking from the bottom */}
      {positiveBoxes.map((box, idx) => {
        const boxColor = 'bg-[#444]'; // Positive color
        const positionStyle: React.CSSProperties = {
          position: 'absolute',
          bottom: `${positiveOffset}px`,
          width: '100%',
          height: `${boxHeight}px`
        };
        positiveOffset += boxHeight;
        return (
          <div
            key={`positive-${idx}`}
            className={`${boxColor} border border-black`}
            style={{
              ...positionStyle,
              margin: '0px'
            }}
          >
            {/* Dot in the middle of the positive box */}
            <div
              className="absolute left-1/2 -translate-x-1/2 transform"
              style={{
                top: '50%',
                width: '2px',
                height: '2px',
                borderRadius: '50%',
                backgroundColor: 'green',
                position: 'absolute'
              }}
            />
          </div>
        );
      })}

      {/* Draw lines to previous and next meeting points */}
      <svg
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
        style={{ zIndex: 1, overflow: 'visible' }}
      >
        {prevMeetingPointY !== null && (
          <line
            x1={-width / 2}
            y1={prevMeetingPointY}
            x2={width / 2}
            y2={meetingPointY}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        {nextMeetingPointY !== null && (
          <line
            x1={width / 2}
            y1={meetingPointY}
            x2={width + width / 2}
            y2={nextMeetingPointY}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};
