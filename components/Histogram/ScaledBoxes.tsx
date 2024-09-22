import React from 'react';
import type { BoxSlice } from '@/types';

export const ScaledBoxes: React.FC<{
  boxArray: BoxSlice['boxes'];
  idx: number;
  prevColor: string | null;
  isSelected: boolean;
  maxSize: number;
  height: number;
  zoomedBarWidth: number;
  initialBarWidth: number;
  handleFrameClick: (slice: BoxSlice, index: number) => void;
}> = ({
  boxArray,
  idx,
  prevColor,
  isSelected,
  maxSize,
  height,
  zoomedBarWidth,
  initialBarWidth,
  handleFrameClick
}) => {
  if (idx >= boxArray.length) return null;

  const box = boxArray[idx];
  const boxColor = box.value > 0 ? 'bg-[#555]' : 'bg-[#212121]';
  const size = (Math.abs(box.value) / maxSize) * height;

  let positionStyle = 'absolute top-0 right-0';

  if (prevColor !== null) {
    if (prevColor !== boxColor) {
      positionStyle =
        prevColor === 'bg-[#212121]'
          ? 'absolute bottom-0 right-0'
          : 'absolute top-0 right-0';
    } else {
      positionStyle =
        box.value > 0 ? 'absolute top-0 right-0' : 'absolute bottom-0 right-0';
    }
  }

  return (
    <div
      className={`${positionStyle} ${boxColor} border border-black`}
      style={{
        width: isSelected ? zoomedBarWidth : initialBarWidth,
        height: size,
        margin: '-1px'
      }}
      key={idx}
    >
      <ScaledBoxes
        boxArray={boxArray}
        idx={idx + 1}
        prevColor={boxColor}
        isSelected={isSelected}
        maxSize={maxSize}
        height={height}
        zoomedBarWidth={zoomedBarWidth}
        initialBarWidth={initialBarWidth}
        handleFrameClick={handleFrameClick}
      />
    </div>
  );
};
