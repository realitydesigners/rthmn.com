'use client';
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';
import type { BoxSlice } from '@/types';

interface HistogramProps {
  data: BoxSlice[];
  boxOffset: number;
  onOffsetChange: (change: number) => void;
}

const INITIAL_BAR_WIDTH = 6;
const ZOOMED_BAR_WIDTH = 30;
const INITIAL_LOAD_COUNT = 1000;
const VISIBLE_BOXES_COUNT = 20;

const areFramesEqual = (frame1: BoxSlice, frame2: BoxSlice) => {
  if (frame1.boxes.length !== frame2.boxes.length) return false;

  return frame1.boxes.every((box1, index) => {
    const box2 = frame2.boxes[index];
    return box1.value === box2.value;
  });
};

const HistogramBox: React.FC<HistogramProps> = ({
  data,
  boxOffset,
  onOffsetChange
}) => {
  const [visibleFrames, setVisibleFrames] =
    useState<number>(INITIAL_LOAD_COUNT);
  const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  let lastUniqueFrame: BoxSlice | null = null; // Keep track of the last unique frame

  const deduplicatedData = useMemo(() => {
    return data.reduce((acc: BoxSlice[], current) => {
      if (!lastUniqueFrame || !areFramesEqual(current, lastUniqueFrame)) {
        acc.push(current);
        lastUniqueFrame = current;
      }
      return acc;
    }, []);
  }, [data]);

  // Calculate max size based on the visible slices
  const maxSize = useMemo(() => {
    const sizes = deduplicatedData.flatMap((slice) =>
      slice.boxes
        .slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT)
        .map((box) => Math.abs(box.value))
    );
    return sizes.reduce((max, size) => Math.max(max, size), 0);
  }, [deduplicatedData, boxOffset]);

  const slicedData = useMemo(
    () =>
      deduplicatedData.slice(
        Math.max(0, deduplicatedData.length - visibleFrames)
      ),
    [deduplicatedData, visibleFrames]
  );

  const handleFrameClick = useCallback((slice: BoxSlice, index: number) => {
    setSelectedFrame((prev) => (prev === slice ? null : slice));
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  const renderNestedBoxes = useCallback(
    (
      boxArray: BoxSlice['boxes'],
      idx = 0,
      prevColor: string | null = null,
      isSelected: boolean
    ): JSX.Element | null => {
      if (idx >= boxArray.length) return null;

      const box = boxArray[idx];
      const boxColor = box.value > 0 ? 'bg-[#555]' : 'bg-[#212121]';
      const size = (Math.abs(box.value) / maxSize) * 250; // Scale the box height based on the max value

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
            width: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH,
            height: size,
            margin: '-1px'
          }}
          key={idx}
        >
          {renderNestedBoxes(boxArray, idx + 1, boxColor, isSelected)}
        </div>
      );
    },
    [maxSize]
  );

  const renderFrame = useCallback(
    (slice: BoxSlice, index: number) => {
      const boxArray = slice.boxes
        .slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT)
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      const isSelected = index === selectedIndex;

      return (
        <div
          key={`${slice.timestamp}-${index}`}
          className="relative flex h-[250px] flex-shrink-0 cursor-pointer flex-col"
          style={{ width: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH }}
          onClick={() => handleFrameClick(slice, index)}
        >
          {renderNestedBoxes(boxArray, 0, null, isSelected)}
        </div>
      );
    },
    [renderNestedBoxes, handleFrameClick, selectedIndex, boxOffset]
  );

  const frames = useMemo(
    () => slicedData.map((slice, index) => renderFrame(slice, index)),
    [slicedData, renderFrame]
  );

  return (
    <div className="relative h-[300px] border border-[#181818] bg-black">
      <div className="absolute left-2 top-2 z-10 flex space-x-2">
        <button
          onClick={() => onOffsetChange(-1)}
          className="rounded bg-gray-700 px-2 py-1 text-white hover:bg-gray-600"
          disabled={boxOffset === 0}
        >
          +
        </button>
        <button
          onClick={() => onOffsetChange(1)}
          className="rounded bg-gray-700 px-2 py-1 text-white hover:bg-gray-600"
          disabled={
            boxOffset >=
            Math.max(...data.map((frame) => frame.boxes.length)) -
              VISIBLE_BOXES_COUNT
          }
        >
          -
        </button>
      </div>
      {data && data.length > 0 && (
        <div className="h-full">
          <div
            ref={containerRef}
            className="flex h-full w-auto items-end overflow-x-auto"
            role="region"
            aria-label="Histogram Chart"
          >
            {frames}
          </div>
        </div>
      )}
      {selectedFrame && (
        <MemoizedSelectedFrameDetails selectedFrame={selectedFrame} />
      )}
    </div>
  );
};

interface SelectedFrameDetailsProps {
  selectedFrame: BoxSlice;
}

const SelectedFrameDetails: React.FC<SelectedFrameDetailsProps> = ({
  selectedFrame
}) => {
  return (
    <div className="absolute top-full z-50 mt-4 w-[450px] rounded-lg bg-gray-800 p-6 text-white shadow-xl">
      <h3 className="mb-4 text-xl font-semibold">Frame Data</h3>
      <p className="mb-4 text-sm text-[#A0A0A0]">
        Time: {selectedFrame.timestamp}
      </p>
      <ul className="space-y-1">
        {selectedFrame.boxes.map((box, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded p-3"
          >
            <div className="flex items-center space-x-1">
              <span
                className={`inline-block h-3 w-3 rounded-full ${
                  box.value > 0 ? 'bg-teal-500' : 'bg-red-500'
                }`}
              />
              <span className="font-medium">
                {box.value > 0 ? 'Up' : 'Down'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-[#A0A0A0]">
              <span>·</span>
              <span>Value: {Math.abs(box.value)}</span>
              <span>·</span>
              <span>High: {box.high.toFixed(5)}</span>
              <span>·</span>
              <span>Low: {box.low.toFixed(5)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const MemoizedSelectedFrameDetails = React.memo(SelectedFrameDetails);

export default React.memo(HistogramBox);
