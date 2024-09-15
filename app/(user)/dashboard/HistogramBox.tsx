'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BoxSlice } from '@/types';

interface HistogramProps {
  data: BoxSlice[];
  isLoading: boolean;
}

const INITIAL_BAR_WIDTH = 6;
const ZOOMED_BAR_WIDTH = 30;
const VISIBLE_BOXES_COUNT = 5;
const HISTOGRAM_HEIGHT = 250; // Fixed height of the histogram

const HistogramBox: React.FC<HistogramProps> = ({ data, isLoading }) => {
  const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [boxOffset, setBoxOffset] = useState(0);

  const allBoxes = useMemo(() => data[0]?.boxes || [], [data]);

  const visibleBoxes = useMemo(() => {
    return allBoxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT);
  }, [allBoxes, boxOffset]);

  const totalValue = useMemo(() => {
    return visibleBoxes.reduce((sum, box) => sum + Math.abs(box.value), 0);
  }, [visibleBoxes]);

  const handleFrameClick = useCallback((slice: BoxSlice, index: number) => {
    setSelectedFrame((prev) => (prev === slice ? null : slice));
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleOffsetChange = (change: number) => {
    setBoxOffset((prev) => {
      const newOffset = prev + change;
      return Math.max(
        0,
        Math.min(newOffset, allBoxes.length - VISIBLE_BOXES_COUNT)
      );
    });
  };

  const renderNestedBoxes = useCallback(
    (boxArray: BoxSlice['boxes'], isSelected: boolean): JSX.Element[] => {
      let accumulatedHeight = 0;
      return boxArray.map((box, idx) => {
        const boxColor = box.value > 0 ? 'bg-[#555]' : 'bg-[#212121]';
        const relativeSize = Math.abs(box.value) / totalValue;
        const height = relativeSize * HISTOGRAM_HEIGHT;
        const positionStyle = box.value > 0 ? 'bottom' : 'top';

        const element = (
          <motion.div
            className={`absolute ${boxColor} border border-black`}
            style={{
              width: '100%',
              height: `${height}px`,
              [positionStyle]: `${accumulatedHeight}px`,
              left: 0,
              right: 0
            }}
            key={idx}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        );

        accumulatedHeight += height;
        return element;
      });
    },
    [totalValue]
  );

  const renderFrame = useCallback(
    (slice: BoxSlice, index: number) => {
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
          {renderNestedBoxes(visibleBoxes, isSelected)}
        </motion.div>
      );
    },
    [renderNestedBoxes, handleFrameClick, selectedIndex, visibleBoxes]
  );

  return (
    <div className="relative min-h-[250px] border border-[#181818] bg-black">
      <div className="absolute left-2 top-2 z-10 flex space-x-2">
        <button
          onClick={() => handleOffsetChange(-1)}
          className="rounded bg-gray-700 px-2 py-1 text-white hover:bg-gray-600"
          disabled={boxOffset === 0}
        >
          ▲
        </button>
        <button
          onClick={() => handleOffsetChange(1)}
          className="rounded bg-gray-700 px-2 py-1 text-white hover:bg-gray-600"
          disabled={boxOffset >= allBoxes.length - VISIBLE_BOXES_COUNT}
        >
          ▼
        </button>
      </div>
      <AnimatePresence mode="wait">
        {!isLoading && (!data || data.length === 0) && (
          <motion.div
            key="initial-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            No data available
          </motion.div>
        )}
        {isLoading && (
          <motion.div
            key="loading-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            Loading...
          </motion.div>
        )}
        {!isLoading && data && data.length > 0 && (
          <motion.div
            key="histogram-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="flex w-auto items-center overflow-x-auto"
              role="region"
              aria-label="Histogram Chart"
            >
              {data.map((slice, index) => renderFrame(slice, index))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedFrame && (
          <MemoizedSelectedFrameDetails
            selectedFrame={{
              ...selectedFrame,
              boxes: visibleBoxes
            }}
          />
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
