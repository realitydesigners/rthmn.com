'use client';

import React, { useEffect, useRef, useState, memo, useMemo } from 'react';
import type { Box, BoxSlice } from '@/types/types';
import { INSTRUMENTS } from '@/utils/instruments';
import type { BoxColors } from '@/stores/colorStore';
import { useUser } from '@/providers/UserProvider';

const getInstrumentDigits = (pair: string): number => {
    const categories = INSTRUMENTS as Record<string, Record<string, { digits: number }>>;
    for (const [category, pairs] of Object.entries(categories)) {
        if (pair in pairs) {
            return pairs[pair].digits;
        }
    }
    return 5;
};

// Optimized color computation
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

// Optimized style computation
const useBoxStyles = (box: Box, prevBox: Box | null, boxColors: BoxColors, containerSize: number, index: number) => {
    return useMemo(() => {
        const calculatedSize = containerSize * Math.pow(0.86, index);
        const isFirstDifferent = prevBox && ((box.value > 0 && prevBox.value < 0) || (box.value < 0 && prevBox.value > 0));

        const positionStyle = !prevBox
            ? { top: 0, right: 0 }
            : isFirstDifferent
              ? prevBox.value > 0
                  ? { top: 0, right: 0 }
                  : { bottom: 0, right: 0 }
              : box.value < 0
                ? { bottom: 0, right: 0 }
                : { top: 0, right: 0 };

        const baseStyles: React.CSSProperties = {
            width: `${calculatedSize}px`,
            height: `${calculatedSize}px`,
            ...positionStyle,
            margin: boxColors.styles?.showBorder ? '-1px' : '0',
            borderRadius: `${boxColors.styles?.borderRadius ?? 0}px`,
            borderWidth: boxColors.styles?.showBorder ? '1px' : '0',
            transition: 'all 0.15s ease-out',
            position: 'absolute',
            border: boxColors.styles?.showBorder ? '1px solid black' : 'none',
        };

        return {
            baseStyles,
            isFirstDifferent,
        };
    }, [box.value, prevBox?.value, boxColors.styles, containerSize, index]);
};

interface BoxProps {
    box: Box;
    index: number;
    prevBox: Box | null;
    boxColors: BoxColors;
    containerSize: number;
    slice: BoxSlice;
    sortedBoxes: Box[];
    pair: string;
    showPriceLines?: boolean;
}

// Recursive Box component
const Box = memo(({ box, index, prevBox, boxColors, containerSize, slice, sortedBoxes, pair, showPriceLines = true }: BoxProps) => {
    const colors = useBoxColors(box, boxColors);
    const { baseStyles, isFirstDifferent } = useBoxStyles(box, prevBox, boxColors, containerSize, index);
    const digits = getInstrumentDigits(pair);

    const isConsecutivePositive = prevBox?.value > 0 && box.value > 0 && !isFirstDifferent;
    const isConsecutiveNegative = prevBox?.value < 0 && box.value < 0 && !isFirstDifferent;

    // Only show price lines for largest box and first different boxes when we have more than 15 boxes
    const shouldLimitPriceLines = sortedBoxes.length > 12;
    const shouldShowTopPrice = (!isFirstDifferent || (isFirstDifferent && box.value > 0)) && (!shouldLimitPriceLines || isFirstDifferent || index === 0) && !isConsecutivePositive;
    const shouldShowBottomPrice =
        (!isFirstDifferent || (isFirstDifferent && box.value < 0)) && (!shouldLimitPriceLines || isFirstDifferent || index === 0) && !isConsecutiveNegative;

    return (
        <div key={`${slice.timestamp}-${index}`} className='absolute border border-black' style={baseStyles}>
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

            {showPriceLines && shouldShowTopPrice && (
                <div className='absolute top-0 -right-16 z-10 w-16 opacity-90'>
                    <div className='w-5 border-[0.05px] transition-all' style={{ borderColor: `${colors.baseColor.replace(')', ', 1)')}` }} />
                    <div className='absolute -top-3.5 right-0'>
                        <span className='font-kodemono text-[8px] tracking-wider' style={{ color: colors.baseColor }}>
                            {box.high.toFixed(digits)}
                        </span>
                    </div>
                </div>
            )}

            {showPriceLines && shouldShowBottomPrice && (
                <div className='absolute -right-16 bottom-0 z-10 w-16 opacity-90'>
                    <div className='w-5 border-[0.05px] transition-all' style={{ borderColor: `${colors.baseColor.replace(')', ', 1)')}` }} />
                    <div className='absolute -top-3.5 right-0'>
                        <span className='font-kodemono text-[8px] tracking-wider' style={{ color: colors.baseColor }}>
                            {box.low.toFixed(digits)}
                        </span>
                    </div>
                </div>
            )}

            {index < sortedBoxes.length - 1 && (
                <Box
                    box={sortedBoxes[index + 1]}
                    index={index + 1}
                    prevBox={box}
                    boxColors={boxColors}
                    containerSize={containerSize}
                    slice={slice}
                    sortedBoxes={sortedBoxes}
                    pair={pair}
                    showPriceLines={showPriceLines}
                />
            )}
        </div>
    );
});

interface ResoBoxProps {
    slice: BoxSlice;
    className?: string;
    pair?: string;
    boxColors?: BoxColors;
    showPriceLines?: boolean;
}

// Main ResoBox component with optimized rendering
export const ResoBox = memo(({ slice, className = '', pair = '', boxColors: propBoxColors, showPriceLines = true }: ResoBoxProps) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(0);
    const { boxColors: userBoxColors } = useUser();

    // Merge boxColors from props with userBoxColors, preferring props
    const mergedBoxColors = useMemo(() => {
        if (!propBoxColors) return userBoxColors;
        return {
            ...userBoxColors,
            ...propBoxColors,
            styles: {
                ...userBoxColors.styles,
                ...propBoxColors.styles,
            },
        };
    }, [propBoxColors, userBoxColors]);

    useEffect(() => {
        if (!boxRef.current) return;

        const element = boxRef.current;
        const observer = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const rect = entries[0].contentRect;
            setContainerSize(Math.min(rect.width, rect.height));
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    if (!slice?.boxes || slice.boxes.length === 0) {
        return null;
    }

    const sortedBoxes = slice.boxes.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    return (
        <div ref={boxRef} className={`relative aspect-square h-full w-full ${className}`}>
            <div className='relative h-full w-full'>
                {sortedBoxes.length > 0 && (
                    <Box
                        box={sortedBoxes[0]}
                        index={0}
                        prevBox={null}
                        boxColors={mergedBoxColors}
                        containerSize={containerSize}
                        slice={slice}
                        sortedBoxes={sortedBoxes}
                        pair={pair}
                        showPriceLines={showPriceLines}
                    />
                )}
            </div>
        </div>
    );
});
