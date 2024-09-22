'use client';
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';

import type { BoxSlice } from '@/types';
import SelectedFrameDetails from './SelectedFrameDetails';
import { ScaledBoxes } from './ScaledBoxes'; // Import the function
import { SquareBoxes } from './SquareBoxes'; // Import the function

const HistogramBox: React.FC<{
  data: BoxSlice[];
  boxOffset: number;
  viewType: 'scaled' | 'even';
  height: number;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setStartY: React.Dispatch<React.SetStateAction<number>>;
  setStartHeight: React.Dispatch<React.SetStateAction<number>>;
  visibleBoxesCount: number;
  zoomedBarWidth: number;
  initialBarWidth: number;
}> = ({
  data,
  boxOffset,
  viewType,
  height,
  isDragging,
  setIsDragging,
  setStartY,
  setStartHeight,
  visibleBoxesCount,
  zoomedBarWidth,
  initialBarWidth
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleBoxValues, setVisibleBoxValues] = useState<number[]>([]);
  const [totalBoxes, setTotalBoxes] = useState(0);

  let lastUniqueFrame: BoxSlice | null = null;

  const areFramesEqual = (frame1: BoxSlice, frame2: BoxSlice) => {
    if (frame1.boxes.length !== frame2.boxes.length) return false;
    return frame1.boxes.every((box1, index) => {
      const box2 = frame2.boxes[index];
      return box1.value === box2.value;
    });
  };

  const deduplicatedData = useMemo(() => {
    return data.reduce((acc: BoxSlice[], current) => {
      if (!lastUniqueFrame || !areFramesEqual(current, lastUniqueFrame)) {
        acc.push(current);
        lastUniqueFrame = current;
      }
      return acc;
    }, []);
  }, [data]);

  const maxSize = useMemo(() => {
    const sizes = deduplicatedData.flatMap((slice) =>
      slice.boxes
        .slice(boxOffset, boxOffset + visibleBoxesCount)
        .map((box) => Math.abs(box.value))
    );
    return sizes.reduce((max, size) => Math.max(max, size), 0);
  }, [deduplicatedData, boxOffset, visibleBoxesCount]);

  const slicedData = useMemo(() => deduplicatedData, [deduplicatedData]);

  const handleFrameClick = useCallback((slice: BoxSlice, index: number) => {
    setSelectedFrame((prev) => (prev === slice ? null : slice));
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  const renderNestedBoxes = useCallback(
    (boxArray: BoxSlice['boxes'], isSelected: boolean): JSX.Element | null => {
      switch (viewType) {
        case 'scaled':
          return ScaledBoxes(
            boxArray,
            0,
            null,
            isSelected,
            maxSize,
            height,
            zoomedBarWidth,
            initialBarWidth,
            handleFrameClick
          );
        case 'even':
          return SquareBoxes(
            boxArray,
            isSelected,
            height,
            visibleBoxesCount,
            zoomedBarWidth,
            initialBarWidth
          );
        default:
          return null;
      }
    },
    [
      viewType,
      maxSize,
      height,
      zoomedBarWidth,
      initialBarWidth,
      handleFrameClick
    ]
  );

  const renderFrame = useCallback(
    (slice: BoxSlice, index: number) => {
      const boxArray = slice.boxes.slice(
        boxOffset,
        boxOffset + visibleBoxesCount
      );
      const isSelected = index === selectedIndex;

      return (
        <div
          key={`${slice.timestamp}-${index}`}
          className="relative flex-shrink-0 cursor-pointer"
          style={{
            width: isSelected ? zoomedBarWidth : initialBarWidth,
            height: `${height}px`,
            position: 'relative'
          }}
          onClick={() => handleFrameClick(slice, index)}
        >
          {renderNestedBoxes(boxArray, isSelected)}
        </div>
      );
    },
    [
      renderNestedBoxes,
      handleFrameClick,
      selectedIndex,
      boxOffset,
      visibleBoxesCount,
      zoomedBarWidth,
      initialBarWidth
    ]
  );

  const frames = useMemo(
    () => slicedData.map((slice, index) => renderFrame(slice, index)),
    [slicedData, renderFrame]
  );

  useEffect(() => {
    if (data.length > 0) {
      const firstFrame = data[0];
      setTotalBoxes(firstFrame.boxes.length);
      const visibleValues = firstFrame.boxes.map((box) => box.value);
      setVisibleBoxValues(visibleValues);
    }
  }, [data, boxOffset, setTotalBoxes, setVisibleBoxValues]);

  const DraggableBorder = ({
    onMouseDown
  }: {
    onMouseDown: (e: React.MouseEvent) => void;
  }) => {
    return (
      <div
        className={`absolute left-0 right-0 top-0 z-10 h-[1px] cursor-ns-resize rounded-full bg-[#181818] transition-all duration-200 hover:bg-blue-400 ${isDragging ? 'shadow-2xl shadow-blue-500' : 'hover:h-[3px] hover:shadow-2xl hover:shadow-blue-500'}`}
        onMouseDown={onMouseDown}
      />
    );
  };

  return (
    <div
      className="relative w-full border border-[#181818] bg-black pr-60"
      style={{ height: `${height}px`, transition: 'height 0.1s ease-out' }}
      ref={containerRef}
    >
      <DraggableBorder
        onMouseDown={(e) => {
          setIsDragging(true);
          setStartY(e.clientY);
          setStartHeight(height);
        }}
      />
      {selectedFrame && <SelectedFrameDetails selectedFrame={selectedFrame} />}
      {data && data.length > 0 && (
        <div className="h-full">
          <div
            className="flex h-full w-auto items-end overflow-x-auto"
            role="region"
            aria-label="Histogram Chart"
          >
            {frames}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HistogramBox);
