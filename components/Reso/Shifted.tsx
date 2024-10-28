'use client';
import type React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import type { Box, BoxSlice } from '@/types';
import type { ForwardRefComponent } from 'framer-motion';

interface BoxComponentProps {
  slice: BoxSlice | null;
  isLoading: boolean;
}

const ShiftedBox: React.FC<BoxComponentProps> = ({ slice, isLoading }) => {
  // Mock data for Box and BoxSlice
  const mockBoxData: Box[] = [
    { high: 120, low: 80, value: 100 },
    { high: 90, low: 40, value: -50 },
    { high: 110, low: 70, value: 75 }
    // Add more mock data as needed
  ];

  const mockSlice: BoxSlice = {
    timestamp: new Date().toISOString(),
    boxes: mockBoxData
  };

  // Use mockSlice if slice is null
  const currentSlice = slice || mockSlice;

  const renderShiftedBoxes = (boxArray: Box[]) => {
    if (!boxArray || boxArray.length === 0) return null;

    const maxSize = Math.abs(boxArray[0].value);

    const renderBox = (
      box: Box,
      index: number,
      prevColor: string | null = null
    ) => {
      const boxColor = box.value > 0 ? 'bg-[#555]' : 'bg-[#212121]';
      const size = (Math.abs(box.value) / maxSize) * 250;

      let positionStyle: React.CSSProperties = { top: 0, right: 0 };

      if (prevColor !== null) {
        if (prevColor !== boxColor) {
          positionStyle =
            prevColor === 'bg-[#212121]'
              ? { bottom: 0, right: 0 }
              : { top: 0, right: 0 };
        } else {
          positionStyle =
            box.value > 0 ? { top: 0, right: 0 } : { bottom: 0, right: 0 };
        }
      }

      return (
        <MotionDiv
          key={`${currentSlice.timestamp}-${index}`}
          className={`absolute ${boxColor} border border-black`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            ...positionStyle,
            margin: '-1px'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {index < boxArray.length - 1 &&
            renderBox(boxArray[index + 1], index + 1, boxColor)}
        </MotionDiv>
      );
    };

    return renderBox(boxArray[0], 0);
  };

  const MotionDiv = motion.div as React.FC<
    HTMLMotionProps<'div'> & React.HTMLAttributes<HTMLDivElement>
  >;

  return (
    <MotionDiv
      className="relative min-h-[250px] w-[250px] overflow-hidden border border-[#181818] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {(!currentSlice || currentSlice.boxes.length === 0) && !isLoading && (
          <MotionDiv
            key="initial-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          ></MotionDiv>
        )}
        {isLoading && (
          <MotionDiv
            key="loading-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          ></MotionDiv>
        )}
        {currentSlice && currentSlice.boxes.length > 0 && (
          <MotionDiv
            key="box-container"
            className="relative h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {renderShiftedBoxes(
                currentSlice.boxes.sort(
                  (a, b) => Math.abs(b.value) - Math.abs(a.value)
                )
              )}
            </AnimatePresence>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default ShiftedBox;
