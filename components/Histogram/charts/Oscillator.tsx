import React, { useMemo } from 'react';
import type { BoxSlice } from '@/types';

interface OscillatorProps {
  boxArray: BoxSlice['boxes'];
  height: number;
  visibleBoxesCount: number;
  meetingPointY: number;
  prevMeetingPointY: number | null;
  nextMeetingPointY: number | null;
  sliceWidth: number;
}

export const Oscillator: React.FC<OscillatorProps> = ({
  boxArray,
  height,
  visibleBoxesCount,
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
    if (sortedBoxes.length === 0) {
      return 'gray'; // Default color when there are no boxes
    }
    const largestBox = sortedBoxes.reduce((max, box) =>
      Math.abs(box.value) > Math.abs(max.value) ? box : max
    );
    return largestBox.value > 0 ? 'green' : 'red';
  }, [sortedBoxes]);

  const gradientColors = useMemo(() => {
    if (sectionColor === 'green') {
      return {
        top: '#46FFF9', // Light green
        bottom: '#008000' // Dark green
      };
    } else if (sectionColor === 'red') {
      return {
        top: '#8B0000', // Dark red
        bottom: '#FF4646' // Light red
      };
    }
  }, [sectionColor]);

  const borderColor = useMemo(() => {
    return sectionColor === 'green'
      ? '#008000'
      : sectionColor === 'red'
        ? '#8B0000'
        : '#404040';
  }, [sectionColor]);

  const gradientId = `gradient-${sectionColor}`;

  const renderBox = (
    box: BoxSlice['boxes'][number],
    idx: number,
    isPositive: boolean
  ) => {
    const positionStyle: React.CSSProperties = {
      position: 'absolute',
      [isPositive ? 'bottom' : 'top']:
        `${isPositive ? positiveOffset : negativeOffset}px`,
      width: '100%',
      height: `${boxHeight}px`,
      borderColor: borderColor,
      borderWidth: '1px',
      borderStyle: 'solid'
    };

    if (isPositive) {
      positiveOffset += boxHeight;
    } else {
      negativeOffset += boxHeight;
    }

    return (
      <div
        key={`${isPositive ? 'positive' : 'negative'}-${idx}`}
        style={positionStyle}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 transform"
          style={{
            top: '50%',
            width: '1px',
            height: '1px',
            borderRadius: '50%',
            backgroundColor: borderColor,
            position: 'absolute'
          }}
        />
      </div>
    );
  };

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
              stopColor={gradientColors.top}
              stopOpacity="0.1"
            />
            <stop
              offset="100%"
              stopColor={gradientColors.bottom}
              stopOpacity=".9"
            />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </svg>

      {/* Render negative boxes */}
      {negativeBoxes.map((box, idx) => renderBox(box, idx, false))}

      {/* Render positive boxes */}
      {positiveBoxes.map((box, idx) => renderBox(box, idx, true))}

      {/* Updated SVG for right-angled lines */}
      <svg
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
        style={{ zIndex: 1, overflow: 'visible' }}
      >
        {prevMeetingPointY !== null && (
          <path
            d={`M ${-width / 2} ${prevMeetingPointY} 
                H 0 
                V ${meetingPointY} 
                H ${width / 2}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {nextMeetingPointY !== null && (
          <path
            d={`M ${width / 2} ${meetingPointY} 
                H ${width} 
                V ${nextMeetingPointY} 
                H ${width * 1.5}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};
