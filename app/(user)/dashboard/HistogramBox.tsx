'use client';
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BoxSlice } from '@/types';

interface HistogramProps {
  data: BoxSlice[];
  boxOffset: number;
  onOffsetChange: (change: number) => void;
}

const INITIAL_BAR_WIDTH = 6;
const ZOOMED_BAR_WIDTH = 30;
const INITIAL_LOAD_COUNT = 1000;
const LOAD_MORE_COUNT = 250;
const TOLERANCE = 0.1;
const VISIBLE_BOXES_COUNT = 20;

const areFramesEqual = (frame1: BoxSlice, frame2: BoxSlice) => {
  if (frame1.boxes.length !== frame2.boxes.length) return false;

  return frame1.boxes.every((box1, index) => {
    const box2 = frame2.boxes[index];
    return (
      Math.abs(box1.value - box2.value) < TOLERANCE &&
      Math.abs(box1.high - box2.high) < TOLERANCE &&
      Math.abs(box1.low - box2.low) < TOLERANCE
    );
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

  const deduplicatedData = useMemo(() => {
    return data.reduce((acc: BoxSlice[], current, index, arr) => {
      if (index === 0 || !areFramesEqual(current, arr[index - 1])) {
        acc.push(current);
      } else if (index === arr.length - 1) {
        acc.push(current);
      }
      return acc;
    }, []);
  }, [data]);

  const slicedData = useMemo(
    () =>
      deduplicatedData.slice(
        Math.max(0, deduplicatedData.length - visibleFrames)
      ),
    [deduplicatedData, visibleFrames]
  );

  const maxSize = useMemo(() => {
    const sizes = slicedData.flatMap((slice) =>
      slice.boxes
        .slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT)
        .map((box) => Math.abs(box.high - box.low))
    );
    return sizes.reduce((max, size) => Math.max(max, size), 0);
  }, [slicedData, boxOffset]);

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
      const size = (Math.abs(box.high - box.low) / maxSize) * 250;

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
        <motion.div
          className={`${positionStyle} ${boxColor} border border-black`}
          style={{
            width: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH,
            height: size,
            margin: '-1px'
          }}
          key={idx}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {renderNestedBoxes(boxArray, idx + 1, boxColor, isSelected)}
        </motion.div>
      );
    },
    [maxSize]
  );

  const renderFrame = useCallback(
    (slice: BoxSlice, index: number) => {
      const boxArray = slice.boxes
        .slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT)
        .sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));
      const isSelected = index === selectedIndex;

      return (
        <motion.div
          key={`${slice.timestamp}-${index}`}
          className="relative flex h-[250px] flex-shrink-0 cursor-pointer flex-col"
          style={{ width: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH }}
          onClick={() => handleFrameClick(slice, index)}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {renderNestedBoxes(boxArray, 0, null, isSelected)}
        </motion.div>
      );
    },
    [renderNestedBoxes, handleFrameClick, selectedIndex, boxOffset]
  );

  const frames = useMemo(
    () => slicedData.map((slice, index) => renderFrame(slice, index)),
    [slicedData, renderFrame]
  );

  useEffect(() => {
    if (containerRef.current && isAutoScrolling) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth'
      });
      setIsAutoScrolling(false);
    }
  }, [frames.length, isAutoScrolling]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

      if (scrollLeft === 0) {
        const currentScrollWidth = scrollWidth;
        setVisibleFrames((prev) =>
          Math.min(prev + LOAD_MORE_COUNT, deduplicatedData.length)
        );

        setTimeout(() => {
          if (containerRef.current) {
            const newScrollWidth = containerRef.current.scrollWidth;
            containerRef.current.scrollLeft =
              newScrollWidth - currentScrollWidth;
          }
        }, 0);
      }

      if (scrollWidth - (scrollLeft + clientWidth) < clientWidth * 0.2) {
        setVisibleFrames((prev) =>
          Math.min(prev + LOAD_MORE_COUNT, deduplicatedData.length)
        );
      }
    }
  }, [deduplicatedData.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <div className="relative h-[300px] border border-[#181818] bg-black">
      {' '}
      {/* Set fixed height */}
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
      <AnimatePresence mode="wait">
        {data && data.length > 0 && (
          <motion.div
            key="histogram-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <motion.div
              ref={containerRef}
              className="flex h-full w-auto items-end overflow-x-auto"
              role="region"
              aria-label="Histogram Chart"
            >
              {frames}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedFrame && (
          <MemoizedSelectedFrameDetails selectedFrame={selectedFrame} />
        )}
      </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute top-full z-50 mt-4 w-[450px] rounded-lg bg-gray-800 p-6 text-white shadow-xl"
    >
      <h3 className="mb-4 text-xl font-semibold">Frame Data</h3>
      <p className="mb-4 text-sm text-[#A0A0A0]">
        Time: {selectedFrame.timestamp}
      </p>
      <ul className="space-y-1">
        {selectedFrame.boxes.map((box, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
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
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

const MemoizedSelectedFrameDetails = React.memo(SelectedFrameDetails);

export default React.memo(HistogramBox);
