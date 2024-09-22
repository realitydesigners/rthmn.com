import React from 'react';
import type { BoxSlice } from '@/types';

export const SquareBoxes = (
  boxArray: BoxSlice['boxes'],
  isSelected: boolean,
  height: number,
  visibleBoxesCount: number,
  zoomedBarWidth: number,
  initialBarWidth: number
): JSX.Element => {
  const boxHeight = height / visibleBoxesCount;
  const sortedBoxes = boxArray.slice(0, visibleBoxesCount);

  const positiveBoxes = sortedBoxes.filter((box) => box.value > 0);
  const negativeBoxes = sortedBoxes.filter((box) => box.value <= 0);

  let positiveOffset = 0;
  let negativeOffset = 0;

  return (
    <div
      className="relative"
      style={{
        width: isSelected ? zoomedBarWidth : initialBarWidth,
        height: `${height}px`,
        position: 'relative'
      }}
    >
      {/* Render negative boxes stacking from the top */}
      {negativeBoxes.map((box, idx) => {
        const boxColor = 'bg-[#212121]'; // Negative color
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
          />
        );
      })}
      {/* Render positive boxes stacking from the bottom */}
      {positiveBoxes.map((box, idx) => {
        const boxColor = 'bg-[#555]'; // Positive color
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
          />
        );
      })}
    </div>
  );
};
