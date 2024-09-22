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

const areFramesEqual = (frame1: BoxSlice, frame2: BoxSlice) => {
  if (frame1.boxes.length !== frame2.boxes.length) return false;
  return frame1.boxes.every((box1, index) => {
    const box2 = frame2.boxes[index];
    return box1.value === box2.value;
  });
};

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

  const renderScaledBoxes = useCallback(
    (
      boxArray: BoxSlice['boxes'],
      idx = 0,
      prevColor: string | null = null,
      isSelected: boolean
    ): JSX.Element | null => {
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
            box.value > 0
              ? 'absolute top-0 right-0'
              : 'absolute bottom-0 right-0';
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
          {renderScaledBoxes(boxArray, idx + 1, boxColor, isSelected)}
        </div>
      );
    },
    [maxSize, height, zoomedBarWidth, initialBarWidth]
  );

  const renderEvenBoxes = useCallback(
    (boxArray: BoxSlice['boxes'], isSelected: boolean): JSX.Element => {
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
    },
    [height, visibleBoxesCount, zoomedBarWidth, initialBarWidth]
  );

  const renderNestedBoxes = useCallback(
    (boxArray: BoxSlice['boxes'], isSelected: boolean): JSX.Element | null => {
      switch (viewType) {
        case 'scaled':
          return renderScaledBoxes(boxArray, 0, null, isSelected);
        case 'even':
          return renderEvenBoxes(boxArray, isSelected);
        default:
          return null;
      }
    },
    [viewType, renderScaledBoxes, renderEvenBoxes]
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
            className="flex h-full w-auto items-end overflow-x-auto" // Add padding-right here
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
