'use client';
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import type { Box, BoxSlice } from '@/types/types';
import { BoxColors } from '@/utils/localStorage';
import { INSTRUMENTS } from '@/utils/instruments';

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

const getBoxStyles = (box: Box, prevColor: string | null, boxColors: BoxColors, containerSize: number, maxSize: number, colors: ReturnType<typeof getBoxColors>, index: number) => {
    // Calculate size based on nesting level (90% of parent)
    const calculatedSize = containerSize * Math.pow(0.86, index);
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
    const { baseStyles, isFirstDifferent } = getBoxStyles(box, prevColor, boxColors, containerSize, maxSize, colors, index);
    const digits = getInstrumentDigits(pair);
    const isFirstInColorSequence = !prevColor || (box.value > 0 && !prevColor.includes(boxColors.positive)) || (box.value < 0 && !prevColor.includes(boxColors.negative));

    const HighPrice = (
        <div className='absolute top-0 -right-16 z-10 w-16 opacity-60'>
            <div className='w-5 border-[0.05px] transition-all' style={{ borderColor: `${colors.baseColor.replace(')', ', 0.3)')}` }} />
            <div className='absolute -top-3.5 right-0'>
                <span className='font-kodemono text-[8px] tracking-wider' style={{ color: colors.baseColor }}>
                    {box.high.toFixed(digits)}
                </span>
            </div>
        </div>
    );

    const LowPrice = (
        <div className='absolute -right-16 bottom-0 z-10 w-16 opacity-60'>
            <div className='w-5 border-[0.05px] transition-all' style={{ borderColor: `${colors.baseColor.replace(')', ', 0.3)')}` }} />
            <div className='absolute -top-3.5 right-0'>
                <span className='font-kodemono text-[8px] tracking-wider' style={{ color: colors.baseColor }}>
                    {box.low.toFixed(digits)}
                </span>
            </div>
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

            {/* Show prices based on color sequence */}
            {isFirstDifferent ? (
                <>
                    {box.value > 0 && HighPrice}
                    {box.value < 0 && LowPrice}
                </>
            ) : (
                <>
                    {/* For positive boxes: show low always, but high only if first in sequence */}
                    {box.value > 0 && (
                        <>
                            {isFirstInColorSequence && HighPrice}
                            {LowPrice}
                        </>
                    )}
                    {/* For negative boxes: show high always, but low only if first in sequence */}
                    {box.value < 0 && (
                        <>
                            {HighPrice}
                            {isFirstInColorSequence && LowPrice}
                        </>
                    )}
                </>
            )}

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

    const selectedBoxes = slice.boxes.slice(boxColors.styles?.startIndex ?? 0, (boxColors.styles?.startIndex ?? 0) + (boxColors.styles?.maxBoxCount ?? slice.boxes.length));
    const sortedBoxes = selectedBoxes.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    const maxSize = sortedBoxes.length ? Math.abs(sortedBoxes[0].value) : 0;

    const renderBox = (box: Box, index: number, prevColor: string | null = null) => (
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
            pair={pair}
        />
    );

    return (
        <div ref={boxRef} className={`relative aspect-square h-full w-full ${className}`}>
            <div className='relative h-full w-full'>{sortedBoxes.length > 0 && renderBox(sortedBoxes[0], 0, null)}</div>
        </div>
    );
};
