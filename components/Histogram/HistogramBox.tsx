import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';

import type { BoxSlice } from '@/types';
import { ScaledBoxes } from './ScaledBoxes';
import { SquareBoxes } from './SquareBoxes';
import { LineBoxes } from './LineBoxes';

const HistogramBox: React.FC<{
  data: BoxSlice[];
  boxOffset: number;
  viewType: 'scaled' | 'even' | 'chart';
  height: number;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setStartY: React.Dispatch<React.SetStateAction<number>>;
  setStartHeight: React.Dispatch<React.SetStateAction<number>>;
  visibleBoxesCount: number;
  zoomedBarWidth: number;
  initialBarWidth: number;
  onFrameSelect: (frame: BoxSlice, index: number) => void;
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
  initialBarWidth,
  onFrameSelect
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
    lastUniqueFrame = null;
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

  const handleFrameClick = useCallback(
    (slice: BoxSlice, index: number) => {
      setSelectedFrame((prev) => (prev === slice ? null : slice));
      setSelectedIndex((prev) => (prev === index ? null : index));
      onFrameSelect(slice, index);
    },
    [onFrameSelect]
  );

  const renderNestedBoxes = useCallback(
    (
      boxArray: BoxSlice['boxes'],
      isSelected: boolean,
      meetingPointY: number,
      prevMeetingPointY: number | null,
      nextMeetingPointY: number | null,
      sliceWidth: number
    ): JSX.Element | null => {
      switch (viewType) {
        case 'scaled':
          return (
            <ScaledBoxes
              boxArray={boxArray}
              idx={0}
              prevColor={null}
              isSelected={isSelected}
              maxSize={maxSize}
              height={height}
              zoomedBarWidth={zoomedBarWidth}
              initialBarWidth={initialBarWidth}
              handleFrameClick={handleFrameClick}
            />
          );
        case 'even':
          return (
            <SquareBoxes
              boxArray={boxArray}
              isSelected={isSelected}
              height={height}
              visibleBoxesCount={visibleBoxesCount}
              zoomedBarWidth={zoomedBarWidth}
              initialBarWidth={initialBarWidth}
            />
          );
        case 'chart':
          return (
            <LineBoxes
              boxArray={boxArray}
              isSelected={isSelected}
              height={height}
              visibleBoxesCount={visibleBoxesCount}
              zoomedBarWidth={zoomedBarWidth}
              initialBarWidth={initialBarWidth}
              meetingPointY={meetingPointY}
              prevMeetingPointY={prevMeetingPointY}
              nextMeetingPointY={nextMeetingPointY}
              sliceWidth={sliceWidth}
            />
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
      handleFrameClick,
      visibleBoxesCount
    ]
  );

  const framesWithPoints = useMemo(() => {
    return slicedData.map((slice, index) => {
      const boxArray = slice.boxes.slice(
        boxOffset,
        boxOffset + visibleBoxesCount
      );
      const isSelected = index === selectedIndex;

      const boxHeight = height / visibleBoxesCount;
      const positiveBoxes = boxArray.filter((box) => box.value > 0);
      const negativeBoxes = boxArray.filter((box) => box.value <= 0);

      const totalNegativeHeight = negativeBoxes.length * boxHeight;
      const totalPositiveHeight = positiveBoxes.length * boxHeight;
      const meetingPointY =
        totalNegativeHeight +
        (height - totalNegativeHeight - totalPositiveHeight) / 2;

      const sliceWidth = isSelected ? zoomedBarWidth : initialBarWidth;

      return {
        frameData: {
          boxArray,
          isSelected,
          meetingPointY,
          sliceWidth
        },
        meetingPointY,
        sliceWidth
      };
    });
  }, [
    slicedData,
    selectedIndex,
    boxOffset,
    visibleBoxesCount,
    zoomedBarWidth,
    initialBarWidth,
    height
  ]);

  useEffect(() => {
    if (data.length > 0) {
      const firstFrame = data[0];
      setTotalBoxes(firstFrame.boxes.length);
      const visibleValues = firstFrame.boxes.map((box) => box.value);
      setVisibleBoxValues(visibleValues);
    }
  }, [data, boxOffset]);

  const DraggableBorder = ({
    onMouseDown
  }: {
    onMouseDown: (e: React.MouseEvent) => void;
  }) => {
    return (
      <div
        className={`absolute left-0 right-0 top-0 z-10 h-[1px] cursor-ns-resize rounded-full bg-[#181818] transition-all duration-200 hover:bg-blue-400 ${
          isDragging
            ? 'shadow-2xl shadow-blue-500'
            : 'hover:h-[3px] hover:shadow-2xl hover:shadow-blue-500'
        }`}
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

      {data && data.length > 0 && (
        <div className="h-full" style={{ position: 'relative' }}>
          <div
            className="flex h-full w-auto items-end overflow-x-auto"
            role="region"
            aria-label="Histogram Chart"
          >
            {framesWithPoints.map((frameWithPoint, index) => {
              const { frameData, meetingPointY, sliceWidth } = frameWithPoint;
              const prevMeetingPointY =
                index > 0 ? framesWithPoints[index - 1].meetingPointY : null;
              const nextMeetingPointY =
                index < framesWithPoints.length - 1
                  ? framesWithPoints[index + 1].meetingPointY
                  : null;

              return (
                <div
                  key={`${index}`}
                  className="relative flex-shrink-0 cursor-pointer"
                  style={{
                    width: frameData.sliceWidth,
                    height: `${height}px`,
                    position: 'relative'
                  }}
                  onClick={() => handleFrameClick(slicedData[index], index)}
                >
                  {renderNestedBoxes(
                    frameData.boxArray,
                    frameData.isSelected,
                    meetingPointY,
                    prevMeetingPointY,
                    nextMeetingPointY,
                    frameData.sliceWidth
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HistogramBox);
