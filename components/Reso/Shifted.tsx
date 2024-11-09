'use client';
import type React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import type { Box, BoxSlice } from '@/types/types';
import { useDashboard } from '@/providers/DashboardProvider';

interface BoxComponentProps {
  slice: BoxSlice | null;
  isLoading: boolean;
}

const ShiftedBox: React.FC<BoxComponentProps> = ({ slice, isLoading }) => {
  const { boxColors } = useDashboard();

  const renderShiftedBoxes = (boxArray: Box[]) => {
    if (!boxArray?.length) return null;

    const maxSize = Math.abs(boxArray[0].value);

    const renderBox = (
      box: Box,
      index: number,
      prevColor: string | null = null
    ) => {
      const intensity = Math.floor((Math.abs(box.value) / maxSize) * 255);
      const boxColor =
        box.value > 0
          ? `${boxColors.positive}, ${intensity / 255})`
          : `${boxColors.negative}, ${intensity / 255})`;

      const size = (Math.abs(box.value) / maxSize) * 250;

      let positionStyle: React.CSSProperties = { top: 0, right: 0 };

      if (prevColor !== null) {
        if (prevColor.includes(boxColors.negative.split(',')[0])) {
          positionStyle = { bottom: 0, right: 0 };
        } else {
          positionStyle = { top: 0, right: 0 };
        }
      }

      return (
        <MotionDiv
          key={`${slice?.timestamp}-${index}`}
          className={`absolute border border-black`}
          style={{
            backgroundColor: boxColor,
            width: `${size}px`,
            height: `${size}px`,
            ...positionStyle,
            margin: '-1px'
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0 }}
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
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0 }}
    >
      <AnimatePresence>
        {(!slice || !slice.boxes || slice.boxes.length === 0) && !isLoading && (
          <MotionDiv
            key="initial-state"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0 }}
          ></MotionDiv>
        )}
        {isLoading && (
          <MotionDiv
            key="loading-spinner"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0 }}
          ></MotionDiv>
        )}
        {slice?.boxes && slice.boxes.length > 0 && (
          <MotionDiv
            key="box-container"
            className="relative h-full w-full"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0 }}
          >
            <AnimatePresence>
              {renderShiftedBoxes(
                slice.boxes.sort(
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
