'use client';
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import type { Box, BoxSlice } from '@/types/types';
import { BoxColors } from '@/utils/localStorage';

// Memoize color calculations
const useBoxColors = (box: Box, boxColors: BoxColors) => {
    return useMemo(() => {
        const baseColor = box.value > 0 ? boxColors.positive : boxColors.negative;
        const opacity = boxColors.styles?.opacity ?? 0.2;
        const shadowIntensity = boxColors.styles?.shadowIntensity ?? 0.25;
        const shadowY = Math.floor(shadowIntensity * 16);
        const shadowBlur = Math.floor(shadowIntensity * 80);
        const shadowColor = (alpha: number) => (box.value > 0 ? boxColors.positive : boxColors.negative).replace(')', `, ${alpha})`);

        return {
            baseColor,
            opacity,
            shadowIntensity,
            shadowY,
            shadowBlur,
            shadowColor,
        };
    }, [box.value, boxColors.positive, boxColors.negative, boxColors.styles?.opacity, boxColors.styles?.shadowIntensity]);
};

// Memoize style calculations
const useBoxStyles = (box: Box, prevColor: string | null, boxColors: BoxColors, containerSize: number, maxSize: number, colors: ReturnType<typeof useBoxColors>) => {
    return useMemo(() => {
        const calculatedSize = (Math.abs(box.value) / maxSize) * containerSize;
        const positionStyle = !prevColor ? { top: 0, right: 0 } : prevColor.includes(boxColors.negative.split(',')[0]) ? { bottom: 0, right: 0 } : { top: 0, right: 0 };

        const baseStyles: React.CSSProperties = {
            width: `${calculatedSize}px`,
            height: `${calculatedSize}px`,
            ...positionStyle,
            margin: boxColors.styles?.showBorder ? '-1px' : '0',
            borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
            borderWidth: boxColors.styles?.showBorder ? '1px' : '0',
            transition: 'all 0.15s ease-out',
        };

        const isFirstDifferent = prevColor && ((box.value > 0 && prevColor.includes(boxColors.negative)) || (box.value < 0 && prevColor.includes(boxColors.positive)));

        return {
            baseStyles,
            isFirstDifferent,
        };
    }, [box.value, prevColor, boxColors.negative, boxColors.positive, boxColors.styles?.showBorder, boxColors.styles?.borderRadius, containerSize, maxSize]);
};

const Box = React.memo(
    ({
        box,
        index,
        prevColor,
        boxColors,
        containerSize,
        maxSize,
        slice,
        sortedBoxes,
        renderBox,
    }: {
        box: Box;
        index: number;
        prevColor: string | null;
        boxColors: BoxColors;
        containerSize: number;
        maxSize: number;
        slice: BoxSlice | null;
        sortedBoxes: Box[];
        renderBox: (box: Box, index: number, prevColor: string | null) => React.ReactNode;
    }) => {
        const colors = useBoxColors(box, boxColors);
        const { baseStyles, isFirstDifferent } = useBoxStyles(box, prevColor, boxColors, containerSize, maxSize, colors);

        return (
            <div key={`${slice?.timestamp}-${index}`} className='absolute border border-black' style={baseStyles}>
                <div
                    className='absolute inset-0'
                    style={{
                        borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
                        boxShadow: `inset 0 ${colors.shadowY}px ${colors.shadowBlur}px ${colors.shadowColor(colors.shadowIntensity)}`,
                        transition: 'all 0.15s ease-out',
                    }}
                />

                <div
                    className='absolute inset-0'
                    style={{
                        borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
                        background: `linear-gradient(to bottom right, ${colors.baseColor.replace(')', `, ${colors.opacity}`)} 100%, transparent 100%)`,
                        opacity: colors.opacity,
                        transition: 'all 0.15s ease-out',
                    }}
                />

                {isFirstDifferent && (
                    <div
                        className='absolute inset-0'
                        style={{
                            borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
                            backgroundColor: colors.baseColor,
                            opacity: colors.opacity * 0.5,
                            boxShadow: `inset 0 2px 15px ${colors.shadowColor(0.2)}`,
                            transition: 'all 0.15s ease-out',
                        }}
                    />
                )}

                {index < sortedBoxes.length - 1 && renderBox(sortedBoxes[index + 1], index + 1, colors.baseColor)}
            </div>
        );
    }
);

Box.displayName = 'Box';

export const ResoBox = React.memo(
    ({ slice, boxColors, className = '' }: { slice: BoxSlice | null; boxColors: BoxColors; className?: string }) => {
        const boxRef = useRef<HTMLDivElement>(null);
        const [containerSize, setContainerSize] = useState(0);

        // Debounced resize handler
        useEffect(() => {
            let rafId: number;
            const updateSize = () => {
                if (boxRef.current) {
                    const element = boxRef.current;
                    const rect = element.getBoundingClientRect();
                    setContainerSize(Math.min(rect.width, rect.height));
                }
            };

            const debouncedUpdateSize = () => {
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(updateSize);
            };

            const resizeObserver = new ResizeObserver(debouncedUpdateSize);

            if (boxRef.current) {
                resizeObserver.observe(boxRef.current);
            }
            debouncedUpdateSize();

            return () => {
                resizeObserver.disconnect();
                cancelAnimationFrame(rafId);
            };
        }, []);

        const sortedBoxes = useMemo(() => {
            if (!slice?.boxes?.length) return [];
            const selectedBoxes = slice.boxes.slice(boxColors.styles?.startIndex ?? 0, (boxColors.styles?.startIndex ?? 0) + (boxColors.styles?.maxBoxCount ?? slice.boxes.length));
            return selectedBoxes.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
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

        if (!slice?.boxes || slice.boxes.length === 0) {
            return null;
        }

        return (
            <div ref={boxRef} className={`relative aspect-square h-full w-full overflow-hidden border border-[#181818] bg-black ${className}`}>
                <div className='relative h-full w-full'>{renderShiftedBoxes(sortedBoxes)}</div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        if (prevProps.slice?.timestamp !== nextProps.slice?.timestamp || prevProps.className !== nextProps.className) {
            return false;
        }

        const colorsDiff = prevProps.boxColors.positive === nextProps.boxColors.positive && prevProps.boxColors.negative === nextProps.boxColors.negative;

        if (!colorsDiff) return false;

        // Only do the expensive JSON.stringify if the colors match
        return JSON.stringify(prevProps.boxColors.styles) === JSON.stringify(nextProps.boxColors.styles);
    }
);

ResoBox.displayName = 'ResoBox';
