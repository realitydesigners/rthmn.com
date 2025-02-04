'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Box, BoxSlice } from '@/types/types';
import { INSTRUMENTS } from '@/utils/instruments';
import { BoxColors } from '@/utils/localStorage';

// Convert memoized functions to regular functions
const getBoxColors = (box: Box, boxColors: BoxColors) => {
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
};

const getBoxStyles = (box: Box, boxColors: BoxColors, containerSize: number, maxSize: number, colors: ReturnType<typeof getBoxColors>, index: number) => {
    // Calculate size based on nesting level (90% of parent)
    const calculatedSize = containerSize * Math.pow(0.86, index);
    const positionStyle = box.value > 0 ? { top: 0, right: 0 } : { bottom: 0, right: 0 };

    const baseStyles: React.CSSProperties = {
        width: `${calculatedSize}px`,
        height: `${calculatedSize}px`,
        ...positionStyle,
        margin: boxColors.styles?.showBorder ? '-1px' : '0',
        borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
        borderWidth: boxColors.styles?.showBorder ? '1px' : '0',
        transition: 'all 0.15s ease-out',
    };

    return {
        baseStyles,
    };
};

const getInstrumentDigits = (pair: string): number => {
    const categories = INSTRUMENTS as Record<string, Record<string, { digits: number }>>;
    for (const [category, pairs] of Object.entries(categories)) {
        if (pair in pairs) {
            return pairs[pair].digits;
        }
    }
    return 5;
};

const Box = ({
    box,
    index,
    prevColor,
    boxColors,
    containerSize,
    maxSize,
    slice,
    sortedBoxes,
    renderBox,
    pair,
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
    pair: string;
}) => {
    const colors = getBoxColors(box, boxColors);
    const { baseStyles } = getBoxStyles(box, boxColors, containerSize, maxSize, colors, index);
    const digits = getInstrumentDigits(pair);

    const shouldShowPrice = (currentBox: Box, nextBox: Box | undefined, isHigh: boolean) => {
        if (!nextBox) return true;
        // For negative boxes, show the shared low value once, and show each unique high
        if (currentBox.value < 0) {
            return isHigh ? true : currentBox.low !== nextBox.low;
        }
        // For positive boxes, show the shared high value once, and show each unique low
        return isHigh ? currentBox.high !== nextBox.high : true;
    };

    const TopPrice = (
        <div className='absolute top-0 -right-16 z-10 w-16 opacity-90'>
            <div className='w-5 border-[0.05px] transition-all' style={{ borderColor: `${colors.baseColor.replace(')', ', 1)')}` }} />
            <div className='absolute -top-3.5 right-0'>
                <span className='font-kodemono text-[8px] tracking-wider' style={{ color: colors.baseColor }}>
                    {shouldShowPrice(box, sortedBoxes[index + 1], true) && box.low.toFixed(digits)}
                </span>
            </div>
        </div>
    );

    const BottomPrice = (
        <div className='absolute -right-16 bottom-0 z-10 w-16 opacity-90'>
            <div className='w-5 border-[0.05px] transition-all' style={{ borderColor: `${colors.baseColor.replace(')', ', 1)')}` }} />
            <div className='absolute -top-3.5 right-0'>
                <span className='font-kodemono text-[8px] tracking-wider' style={{ color: colors.baseColor }}>
                    {shouldShowPrice(box, sortedBoxes[index + 1], false) && box.high.toFixed(digits)}
                </span>
            </div>
        </div>
    );

    const ValueDisplay = (
        <div className={`absolute ${box.value < 0 ? '-top-2' : 'bottom-1'} left-1 z-20`}>
            <span className='font-kodemono text-[6px] tracking-wider text-white'>
                {box.value < 0 ? '-' : ''}
                {Math.round(Math.abs(box.value) * 100000)}
            </span>
        </div>
    );

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

            {/* Show the value inside the box */}
            {ValueDisplay}

            {/* Show prices */}
            {TopPrice}
            {BottomPrice}

            {index < sortedBoxes.length - 1 && renderBox(sortedBoxes[index + 1], index + 1, colors.baseColor)}
        </div>
    );
};

export const ResoBox = ({ slice, boxColors, className = '', pair = '' }: { slice: BoxSlice | null; boxColors: BoxColors; className?: string; pair?: string }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(0);

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

    if (!slice?.boxes || slice.boxes.length === 0) {
        return null;
    }

    // Get the current timeframe window
    const startIndex = boxColors.styles?.startIndex ?? 0;
    const maxBoxCount = boxColors.styles?.maxBoxCount ?? 10;

    // Filter boxes to only show those in the current timeframe window
    const visibleBoxes = slice.boxes.slice(startIndex, startIndex + maxBoxCount);

    // First transform the data to reverse high/low for negative boxes
    const transformedBoxes = visibleBoxes.map((box) => {
        if (box.value < 0) {
            // For negative boxes, swap high and low and reverse the order
            return {
                ...box,
                high: box.high, // Keep original high
                low: box.low, // Keep original low
            };
        }
        return box;
    });

    // Sort boxes by actual value
    const sortedBoxes = transformedBoxes.sort((a, b) => {
        // For negative boxes, most negative (lowest value) should be first
        if (a.value < 0 && b.value < 0) {
            return a.value - b.value; // Keep the box order the same
        }
        // For positive boxes, highest value should be first
        return b.value - a.value;
    });

    // Now reverse the high/low values for negative boxes after sorting
    const finalBoxes = sortedBoxes.map((box) => {
        if (box.value < 0) {
            return {
                ...box,
                high: box.low,
                low: box.high,
            };
        }
        return box;
    });

    const maxSize = finalBoxes.length ? Math.abs(finalBoxes[0].value) : 0;

    const renderBox = (box: Box, index: number, prevColor: string | null = null) => {
        return (
            <Box
                box={box}
                index={index}
                prevColor={prevColor}
                boxColors={boxColors}
                containerSize={containerSize}
                maxSize={maxSize}
                slice={slice}
                sortedBoxes={finalBoxes}
                renderBox={renderBox}
                pair={pair}
            />
        );
    };

    return (
        <div ref={boxRef} className={`relative aspect-square h-full w-full ${className}`}>
            <div className='relative h-full w-full'>{finalBoxes.length > 0 && renderBox(finalBoxes[0], 0, null)}</div>
        </div>
    );
};
