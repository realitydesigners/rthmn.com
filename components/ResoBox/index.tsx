'use client';
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Box, BoxSlice } from '@/types/types';
import { BoxColors } from '@/utils/localStorage';

// Types

// Box Component
const Box: React.FC<{
    box: Box;
    index: number;
    prevColor: string | null;
    boxColors: BoxColors;
    containerSize: number;
    maxSize: number;
    slice: BoxSlice | null;
    sortedBoxes: Box[];
    renderBox: (box: Box, index: number, prevColor: string | null) => React.ReactNode;
}> = ({ box, index, prevColor, boxColors, containerSize, maxSize, slice, sortedBoxes, renderBox }) => {
    const isFirstDifferent = prevColor && ((box.value > 0 && prevColor.includes(boxColors.negative)) || (box.value < 0 && prevColor.includes(boxColors.positive)));

    const baseColor = box.value > 0 ? boxColors.positive : boxColors.negative;
    const opacity = boxColors.styles?.opacity ?? 0.2;
    const shadowIntensity = boxColors.styles?.shadowIntensity ?? 0.25;
    const shadowY = Math.floor(shadowIntensity * 16);
    const shadowBlur = Math.floor(shadowIntensity * 80);
    const shadowColor = (alpha: number) => (box.value > 0 ? boxColors.positive.replace(')', `, ${alpha})`) : boxColors.negative.replace(')', `, ${alpha})`));

    const calculatedSize = (Math.abs(box.value) / maxSize) * containerSize;

    const getPositionStyle = (prevColor: string | null, negativeColor: string): React.CSSProperties => {
        if (!prevColor) return { top: 0, right: 0 };
        return prevColor.includes(negativeColor.split(',')[0]) ? { bottom: 0, right: 0 } : { top: 0, right: 0 };
    };

    const positionStyle = getPositionStyle(prevColor, boxColors.negative);

    const baseStyles: React.CSSProperties = {
        width: `${calculatedSize}px`,
        height: `${calculatedSize}px`,
        ...positionStyle,
        margin: boxColors.styles?.showBorder ? '-1px' : '0',
        borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
        borderWidth: boxColors.styles?.showBorder ? '1px' : '0',
    };

    return (
        <motion.div
            key={`${slice?.timestamp}-${index}`}
            className='absolute border border-black'
            style={baseStyles}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.2 }}>
            {/* Base color layer */}

            {/* Gradient overlay */}
            {/* <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${baseColor.replace(')', `, ${opacity})`)} 0%, transparent 100%)`,
          borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`
        }}
      /> */}

            {/* Shadow effect */}
            <div
                className='absolute inset-0'
                style={{
                    borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
                    boxShadow: `inset 0 ${shadowY}px ${shadowBlur}px ${shadowColor(shadowIntensity)}`,
                }}
            />

            {/* Additional gradient layer */}
            <div
                className='absolute inset-0'
                style={{
                    borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
                    background: `linear-gradient(to bottom right, ${baseColor.replace(')', `, ${opacity}`)} 100%, transparent 100%)`,
                    opacity: opacity,
                }}
            />

            {/* Enhanced effects for first different box */}
            {isFirstDifferent && (
                <>
                    {/* Base color layer for first different */}
                    <div
                        className='absolute inset-0'
                        style={{
                            borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
                            backgroundColor: baseColor,
                            opacity: opacity * 0.5,
                            boxShadow: `inset 0 2px 15px ${shadowColor(0.2)}`,
                        }}
                    />
                    {/* Gradient fade */}
                </>
            )}

            {/* Recursive rendering of next box */}
            {index < sortedBoxes.length - 1 && renderBox(sortedBoxes[index + 1], index + 1, baseColor)}
        </motion.div>
    );
};

export const ResoBox = React.memo(
    ({ slice, boxColors, className = '' }: { slice: BoxSlice | null; boxColors: BoxColors; className?: string }) => {
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
            const resizeObserver = new ResizeObserver(() => {
                requestAnimationFrame(updateSize);
            });

            if (boxRef.current) {
                resizeObserver.observe(boxRef.current);
            }
            requestAnimationFrame(updateSize);

            return () => resizeObserver.disconnect();
        }, [slice]);

        const sortedBoxes = useMemo(() => {
            if (!slice?.boxes?.length) return [];

            // First slice the array based on startIndex and maxBoxCount
            const selectedBoxes = slice.boxes.slice(boxColors.styles?.startIndex ?? 0, (boxColors.styles?.startIndex ?? 0) + (boxColors.styles?.maxBoxCount ?? slice.boxes.length));

            // Then sort the selected boxes by absolute value
            const sorted = selectedBoxes.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

            return sorted;
        }, [slice?.boxes, boxColors.styles?.maxBoxCount, boxColors.styles?.startIndex]);

        const maxSize = useMemo(() => {
            if (!sortedBoxes.length) return 0;
            return Math.abs(sortedBoxes[0].value);
        }, [sortedBoxes]);

        const renderBox = useCallback(
            (box: Box, index: number, prevColor: string | null = null) => (
                <Box
                    box={box}
                    index={index}
                    prevColor={prevColor}
                    boxColors={boxColors}
                    containerSize={containerSize}
                    maxSize={maxSize}
                    slice={slice}
                    sortedBoxes={sortedBoxes}
                    renderBox={renderBox}
                />
            ),
            [boxColors, containerSize, maxSize, slice, sortedBoxes]
        );

        const renderShiftedBoxes = useCallback(
            (boxArray: Box[]) => {
                if (!boxArray?.length) return null;
                return renderBox(boxArray[0], 0, null);
            },
            [renderBox]
        );

        return (
            <motion.div
                ref={boxRef}
                className={`relative aspect-square h-full w-full overflow-hidden border border-[#181818] bg-black ${className}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0 }}>
                <AnimatePresence>
                    {slice?.boxes && slice.boxes.length > 0 && (
                        <motion.div
                            key='box-container'
                            className='relative h-full w-full'
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 1 }}
                            transition={{ duration: 0 }}>
                            {renderShiftedBoxes(sortedBoxes)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.slice?.timestamp === nextProps.slice?.timestamp &&
            prevProps.className === nextProps.className &&
            prevProps.boxColors.positive === nextProps.boxColors.positive &&
            prevProps.boxColors.negative === nextProps.boxColors.negative
        );
    }
);
