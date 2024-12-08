'use client';
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import { AnimatePresence } from 'motion/react';
import type { Box, BoxSlice } from '@/types/types';
import { useDashboard } from '@/providers/DashboardProvider';
import { motion } from 'framer-motion';

interface BoxComponentProps {
  slice: BoxSlice | null;
  isLoading: boolean;
  className?: string;
}

export const ResoBox: React.FC<BoxComponentProps> = React.memo(
  ({ slice, isLoading, className = '' }) => {
    const { boxColors } = useDashboard();
    const boxRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(0);

    useEffect(() => {
      const updateSize = () => {
        if (boxRef.current) {
          const element = boxRef.current;
          const rect = element.getBoundingClientRect();
          setContainerSize(Math.min(rect.width, rect.height));
        }
      };

      // Create a ResizeObserver to watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        // Add small delay to ensure DOM is ready
        requestAnimationFrame(updateSize);
      });

      if (boxRef.current) {
        resizeObserver.observe(boxRef.current);
      }

      // Initial size update with small delay
      requestAnimationFrame(updateSize);

      return () => {
        resizeObserver.disconnect();
      };
    }, [slice]);

    // Memoize the sorted boxes calculation
    const sortedBoxes = useMemo(() => {
      if (!slice?.boxes?.length) return [];
      return slice.boxes
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, boxColors.styles?.maxBoxCount ?? slice.boxes.length);
    }, [slice?.boxes, boxColors.styles?.maxBoxCount]);

    // Memoize the max size calculation
    const maxSize = useMemo(() => {
      if (!sortedBoxes.length) return 0;
      return Math.abs(sortedBoxes[0].value);
    }, [sortedBoxes]);

    // Memoize the renderBox function
    const renderBox = useCallback(
      (box: Box, index: number, prevColor: string | null = null) => {
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

        const calculatedSize = (Math.abs(box.value) / maxSize) * containerSize;

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
          width: `${calculatedSize}px`,
          height: `${calculatedSize}px`,
          opacity: 1,
          borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
          borderWidth: '1px',
          boxShadow: `inset 0 4px 20px rgba(0,0,0,${boxColors.styles?.shadowIntensity ?? 0.25})`,
          ...positionStyle,
          margin: '-1px'
        };

        return (
          <motion.div
            key={`${slice?.timestamp}-${index}`}
            className={`absolute border border-black`}
            style={dynamicStyles}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {index < sortedBoxes.length - 1 &&
              renderBox(sortedBoxes[index + 1], index + 1, boxColor)}
          </motion.div>
        );
      },
      [maxSize, containerSize, boxColors, slice?.timestamp]
    );

    const renderShiftedBoxes = useCallback(
      (boxArray: Box[]) => {
        if (!boxArray?.length) return null;
        return renderBox(sortedBoxes[0], 0);
      },
      [sortedBoxes, renderBox]
    );

    return (
      <motion.div
        ref={boxRef}
        className={`relative h-full w-full overflow-hidden border border-[#181818] bg-black ${className}`}
        style={{
          aspectRatio: '1 / 1'
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 0 }}
      >
        <AnimatePresence>
          {(!slice || !slice.boxes || slice.boxes.length === 0) &&
            !isLoading && (
              <motion.div
                key="initial-state"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0 }}
              ></motion.div>
            )}
          {isLoading && (
            <motion.div
              key="loading-spinner"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0 }}
            ></motion.div>
          )}
          {slice?.boxes && slice.boxes.length > 0 && (
            <motion.div
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.slice?.timestamp === nextProps.slice?.timestamp &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.className === nextProps.className
    );
  }
);
