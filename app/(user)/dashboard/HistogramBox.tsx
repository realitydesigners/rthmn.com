'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoxSlice, Box } from '@/types';

interface HistogramProps {
  data: BoxSlice[];
  isLoading: boolean;
}

const INITIAL_BAR_WIDTH = 6;
const ZOOMED_BAR_WIDTH = 30;
const VISIBLE_BOXES_COUNT = 10;
const HISTOGRAM_HEIGHT = 250;

const HistogramBox: React.FC<HistogramProps> = ({ data, isLoading }) => {
  const [selectedFrame, setSelectedFrame] = useState<BoxSlice | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [boxOffset, setBoxOffset] = useState(0);

  const visibleBoxes = useMemo(() => {
    return data.map((frame) =>
      frame.boxes.slice(boxOffset, boxOffset + VISIBLE_BOXES_COUNT)
    );
  }, [data, boxOffset]);

  const { maxRange, minLow, maxHigh } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    data.forEach((frame) => {
      frame.boxes.forEach((box) => {
        min = Math.min(min, box.low);
        max = Math.max(max, box.high);
      });
    });
    return { maxRange: max - min, minLow: min, maxHigh: max };
  }, [data]);

  const handleFrameClick = useCallback((slice: BoxSlice, index: number) => {
    setSelectedFrame((prev) => (prev === slice ? null : slice));
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleOffsetChange = (change: number) => {
    setBoxOffset((prev) => {
      const newOffset = prev + change;
      const maxOffset = Math.max(
        0,
        Math.max(...data.map((frame) => frame.boxes.length)) -
          VISIBLE_BOXES_COUNT
      );
      return Math.max(0, Math.min(newOffset, maxOffset));
    });
  };

  const renderBox = useCallback(
    (
      box: Box,
      idx: number,
      isSelected: boolean,
      maxBoxValue: number
    ): JSX.Element => {
      const boxColor = box.value > 0 ? 'bg-[#555]' : 'bg-[#212121]';
      const heightPercentage = Math.abs(box.value) / maxBoxValue;
      const height = heightPercentage * HISTOGRAM_HEIGHT;

      return (
        <motion.div
          className={`absolute ${boxColor} border border-black`}
          style={{
            width: '100%',
            height: `${height}px`,
            bottom: 0,
            left: 0,
            right: 0
          }}
          key={idx}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      );
    },
    []
  );

  const renderFrame = useCallback(
    (slice: BoxSlice, index: number) => {
      const isSelected = index === selectedIndex;
      const frameVisibleBoxes = visibleBoxes[index];

      const maxBoxValue = Math.max(
        ...frameVisibleBoxes.map((box) => Math.abs(box.value))
      );

      return (
        <motion.div
          key={`frame-${index}`}
          className="relative flex h-[250px] flex-shrink-0 cursor-pointer flex-col"
          style={{ width: isSelected ? ZOOMED_BAR_WIDTH : INITIAL_BAR_WIDTH }}
          onClick={() => handleFrameClick(slice, index)}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {frameVisibleBoxes.map((box, idx) =>
            renderBox(box, idx, isSelected, maxBoxValue)
          )}
        </motion.div>
      );
    },
    [handleFrameClick, selectedIndex, renderBox, visibleBoxes]
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
          disabled={
            boxOffset >=
            Math.max(...data.map((frame) => frame.boxes.length)) -
              VISIBLE_BOXES_COUNT
          }
        >
          ▼
        </button>
      </div>
      <AnimatePresence mode="wait">
        {!isLoading &&
          (!data || data.length === 0 || !data[0]?.boxes?.length) && (
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
        {!isLoading &&
          data &&
          data.length > 0 &&
          data[0]?.boxes?.length > 0 && (
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
          <SelectedFrameDetails
            selectedFrame={selectedFrame}
            visibleBoxes={visibleBoxes[selectedIndex!]}
            boxOffset={boxOffset}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface SelectedFrameDetailsProps {
  selectedFrame: BoxSlice;
  visibleBoxes: Box[];
  boxOffset: number;
}

const SelectedFrameDetails: React.FC<SelectedFrameDetailsProps> = ({
  selectedFrame,
  visibleBoxes,
  boxOffset
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
      <p className="mb-2">Timestamp: {selectedFrame.timestamp}</p>
      <h4 className="mb-2 text-lg font-semibold">Boxes</h4>
      <ul className="space-y-1">
        {visibleBoxes.map((box, index) => (
          <motion.li
            key={boxOffset + index}
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
              <span>Size: {box.size}</span>
              <span>·</span>
              <span>Value: {Math.abs(box.value)}</span>
              <span>·</span>
              <span>High: {box.high.toFixed(3)}</span>
              <span>·</span>
              <span>Low: {box.low.toFixed(3)}</span>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default React.memo(HistogramBox);
