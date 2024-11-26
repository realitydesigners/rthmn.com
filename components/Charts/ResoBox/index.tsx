'use client';
import type React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import type { Box, BoxSlice } from '@/types/types';
import { useDashboard } from '@/providers/DashboardProvider';
import { formatNumber } from '@/utils/formatters';

interface BoxComponentProps {
  slice: BoxSlice | null;
  isLoading: boolean;
}

export const ResoBox: React.FC<BoxComponentProps> = ({ slice, isLoading }) => {
  const { boxColors } = useDashboard();

  const renderShiftedBoxes = (boxArray: Box[]) => {
    if (!boxArray?.length) return null;

    const sortedByMagnitude = boxArray.sort(
      (a, b) => Math.abs(b.value) - Math.abs(a.value)
    );

    const maxBoxCount =
      boxColors.styles?.maxBoxCount ?? sortedByMagnitude.length;
    const sortedBoxes = sortedByMagnitude.slice(0, maxBoxCount);

    const maxSize = Math.abs(sortedBoxes[0].value);

    const renderBox = (
      box: Box,
      index: number,
      prevColor: string | null = null
    ) => {
      const intensity = Math.floor((Math.abs(box.value) / maxSize) * 255);
      const baseColor =
        box.value > 0
          ? boxColors.positive
              .replace('rgba', 'rgb')
              .replace(/, *[0-9.]+\)/, ')')
          : boxColors.negative
              .replace('rgba', 'rgb')
              .replace(/, *[0-9.]+\)/, ')');
      const boxColor = baseColor
        .replace('rgb', 'rgba')
        .replace(')', `, ${intensity / 255})`);

      const size = (Math.abs(box.value) / maxSize) * 250;

      let positionStyle: React.CSSProperties = { top: 0, right: 0 };

      if (prevColor !== null) {
        if (prevColor.includes(boxColors.negative.split(',')[0])) {
          positionStyle = { bottom: 0, right: 0 };
        } else {
          positionStyle = { top: 0, right: 0 };
        }
      }

      const dynamicStyles: React.CSSProperties = {
        backgroundColor: boxColor,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 1,
        borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
        borderWidth: '1px',
        boxShadow: `inset 0 4px 20px rgba(0,0,0,${boxColors.styles?.shadowIntensity ?? 0.25})`,
        ...positionStyle,
        margin: '-1px'
      };

      return (
        <MotionDiv
          key={`${slice?.timestamp}-${index}`}
          className={`absolute border border-black`}
          style={dynamicStyles}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0 }}
        >
          {index < sortedBoxes.length - 1 &&
            renderBox(sortedBoxes[index + 1], index + 1, boxColor)}
        </MotionDiv>
      );
    };

    return renderBox(sortedBoxes[0], 0);
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
