// LineBoxes.jsx
import React, { useMemo } from 'react';
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
  const sectionColor = useMemo(() => {
    const largestBox = sortedBoxes.reduce((max, box) =>
      Math.abs(box.value) > Math.abs(max.value) ? box : max
    );
    return largestBox.value > 0 ? 'green' : 'red';
  }, [sortedBoxes]);

  const gradientId = `gradient-${sectionColor}`;

  return (
    <div
      className="relative"
      style={{
        width: width,
        height: `${height}px`,
        position: 'relative'
      }}
    >
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={sectionColor === 'green' ? '#0F766E' : '#B91C1C'}
              stopOpacity="0.7"
            />
            <stop
              offset="100%"
              stopColor={sectionColor === 'green' ? '#0F766E' : '#B91C1C'}
              stopOpacity="0.01"
            />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </svg>

      {/* Render negative boxes stacking from the top */}
      {negativeBoxes.map((box, idx) => {
        const boxColor = ''; // Negative color
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
                width: '1px',
                height: '1px',
                borderRadius: '50%',
                backgroundColor: '#999',
                position: 'absolute'
              }}
            />
          </div>
        );
      })}

      {/* Render positive boxes stacking from the bottom */}
      {positiveBoxes.map((box, idx) => {
        const boxColor = ''; // Positive color
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
                width: '1px',
                height: '1px',
                borderRadius: '50%',
                backgroundColor: '#999',
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
      </svg>
    </div>
  );
};
