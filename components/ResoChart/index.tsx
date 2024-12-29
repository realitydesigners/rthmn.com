'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';

import { BoxColors } from '@/utils/localStorage';
import type { Box, BoxSlice } from '@/types/types';

interface ResoChartProps {
    slice: BoxSlice | null;
    boxColors: BoxColors;
    className?: string;
    digits: number;
    showSidebar: boolean;
}

export const ResoChart: React.FC<ResoChartProps> = ({ slice, boxColors, className = '', digits, showSidebar }) => {
    console.log(slice);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        let rafId: number;
        const updateSize = () => {
            if (containerRef.current) {
                const element = containerRef.current;
                const rect = element.getBoundingClientRect();
                setDimensions({
                    width: rect.width - (showSidebar ? 80 : 0), // Adjust width based on sidebar visibility
                    height: rect.height,
                });
            }
        };

        const debouncedUpdateSize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateSize);
        };

        const resizeObserver = new ResizeObserver(debouncedUpdateSize);

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        debouncedUpdateSize();

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(rafId);
        };
    }, [showSidebar]);

    const selectedBoxes = useMemo(() => {
        if (!slice?.boxes?.length) return [];
        const boxes = slice.boxes.slice(boxColors.styles?.startIndex ?? 0, (boxColors.styles?.startIndex ?? 0) + (boxColors.styles?.maxBoxCount ?? slice.boxes.length));
        console.log('Boxes in view:', {
            total: slice.boxes.length,
            startIndex: boxColors.styles?.startIndex ?? 0,
            maxBoxCount: boxColors.styles?.maxBoxCount ?? slice.boxes.length,
            visibleBoxes: boxes,
            sortedBoxes: [...boxes].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
        });
        return boxes;
    }, [slice?.boxes, boxColors.styles?.maxBoxCount, boxColors.styles?.startIndex]);

    const { points, priceLines, prices } = useLinePoints(selectedBoxes, dimensions.height, dimensions.width);

    if (!slice?.boxes || slice.boxes.length === 0) {
        return null;
    }

    return (
        <div ref={containerRef} className={`relative flex h-full w-full ${className}`}>
            <div className='relative h-full flex-1 overflow-visible'>
                <svg className='h-full w-full overflow-visible' preserveAspectRatio='none'>
                    <ChartSegments points={points} priceLines={priceLines} boxColors={boxColors} />
                    <PriceLines priceLines={priceLines} boxColors={boxColors} />
                    <ChartPoints points={points} boxColors={boxColors} prices={prices} digits={digits} />
                </svg>
            </div>
            {showSidebar && <PriceSidebar priceLines={priceLines} boxColors={boxColors} digits={digits} prices={prices} />}
        </div>
    );
};

ResoChart.displayName = 'ResoChart';

export interface PriceLine {
    price: number;
    y: number;
    x1: number;
    x2: number;
    isPositive: boolean;
    intersectX: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export const useContainerDimensions = (sidebarWidth = 80) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

    useEffect(() => {
        let rafId: number;
        const updateSize = () => {
            if (containerRef.current) {
                const element = containerRef.current;
                const rect = element.getBoundingClientRect();
                setDimensions({ width: rect.width - sidebarWidth, height: rect.height });
            }
        };

        const debouncedUpdateSize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateSize);
        };

        const resizeObserver = new ResizeObserver(debouncedUpdateSize);

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        debouncedUpdateSize();

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(rafId);
        };
    }, [sidebarWidth]);

    return { containerRef, dimensions };
};

export const useBoxSorting = (boxes: Box[]) => {
    return [...boxes].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
};

export const usePriceMapping = (sortedBoxes: Box[]) => {
    const priceMap = new Map<number, { isPositive: boolean }>();
    sortedBoxes.forEach((box) => {
        const isPositive = box.value > 0;
        if (!priceMap.has(box.high)) priceMap.set(box.high, { isPositive });
        if (!priceMap.has(box.low)) priceMap.set(box.low, { isPositive });
    });
    return priceMap;
};

export const usePriceScale = (priceMap: Map<number, { isPositive: boolean }>, containerHeight: number) => {
    const allPrices = Array.from(priceMap.keys());
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    const scaleFactor = containerHeight / priceRange;

    return { minPrice, maxPrice, scaleFactor, priceToY: (price: number) => containerHeight - (price - minPrice) * scaleFactor };
};

interface ScalingResult {
    priceToY: (price: number) => number;
    xScale: (x: number) => number;
}

// Convert coordinate scaling to a regular function
const getCoordinateScaling = (boxes: Box[], containerHeight: number, containerWidth: number): ScalingResult => {
    if (!boxes.length) return { priceToY: () => 0, xScale: () => 0 };

    const prices = boxes.flatMap((box) => [box.high, box.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const yScaleFactor = containerHeight / priceRange;

    return {
        priceToY: (price: number) => containerHeight - (price - minPrice) * yScaleFactor,
        xScale: (x: number) => x * containerWidth * 0.8,
    };
};

export const useLinePoints = (boxes: Box[], containerHeight: number, containerWidth: number) => {
    return useMemo(() => {
        if (!boxes?.length) return { points: [] as Point[], priceLines: [] as PriceLine[], prices: [] as number[] };

        // Sort boxes by absolute value and get scaling functions
        const sortedBoxes = [...boxes].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        const { priceToY, xScale } = getCoordinateScaling(sortedBoxes, containerHeight, containerWidth);

        // Generate points and price lines in a single pass
        const points: Point[] = [];
        const prices: number[] = [];
        const priceLines = new Map<number, PriceLine>();
        let currentX = 0;

        // Process boxes to generate points and collect price lines
        sortedBoxes.forEach((box, i) => {
            const isPositive = box.value > 0;
            const [highY, lowY] = [priceToY(box.high), priceToY(box.low)];

            // Add price lines
            if (!priceLines.has(box.high)) {
                priceLines.set(box.high, {
                    price: box.high,
                    y: highY,
                    x1: 0,
                    x2: containerWidth,
                    isPositive,
                    intersectX: 0,
                });
            }
            if (!priceLines.has(box.low)) {
                priceLines.set(box.low, {
                    price: box.low,
                    y: lowY,
                    x1: 0,
                    x2: containerWidth,
                    isPositive,
                    intersectX: 0,
                });
            }

            // Add points
            if (i === 0) {
                points.push([currentX, isPositive ? lowY : highY]);
                prices.push(isPositive ? box.low : box.high);
                currentX += Math.abs(highY - lowY);
                points.push([currentX, isPositive ? highY : lowY]);
                prices.push(isPositive ? box.high : box.low);
            } else {
                const prevBox = sortedBoxes[i - 1];
                const prevIsPositive = prevBox.value > 0;

                if (isPositive !== prevIsPositive) {
                    const prevY = points[points.length - 1][1];
                    const nextY = isPositive ? highY : lowY;
                    currentX += Math.abs(nextY - prevY);
                    points.push([currentX, nextY]);
                    prices.push(isPositive ? box.high : box.low);
                }
            }
        });

        // Scale x coordinates and update intersection points
        const maxX = Math.max(...points.map((p) => p[0]));
        const normalizedPoints: Point[] = points.map(([x, y]) => {
            const scaledX = maxX ? xScale(x / maxX) : 0;
            return [scaledX, y];
        });

        // Update price line intersections
        normalizedPoints.forEach(([x, y], i) => {
            if (i === normalizedPoints.length - 1) return;
            const [nextX, nextY] = normalizedPoints[i + 1];

            priceLines.forEach((line) => {
                if ((y <= line.y && nextY >= line.y) || (y >= line.y && nextY <= line.y)) {
                    const t = (line.y - y) / (nextY - y);
                    const intersectX = x + t * (nextX - x);
                    line.intersectX = Math.max(line.intersectX, intersectX);
                    line.x1 = line.intersectX;
                }
            });
        });

        return {
            points: normalizedPoints,
            priceLines: Array.from(priceLines.values()),
            prices,
        };
    }, [boxes, containerHeight, containerWidth]);
};

export interface PriceLine {
    price: number;
    y: number;
    x1: number;
    x2: number;
    isPositive: boolean;
    intersectX: number;
}

type Point = [number, number];

export const PriceLines = ({ priceLines, boxColors }: { priceLines: PriceLine[]; boxColors: BoxColors }) => (
    <>
        {priceLines.map((line, index) => (
            <g key={`line-${index}`}>
                <line
                    x1={!isNaN(line.x1) ? line.x1 : 0}
                    y1={!isNaN(line.y) ? line.y : 0}
                    x2={line.x2}
                    y2={!isNaN(line.y) ? line.y : 0}
                    stroke={line.isPositive ? boxColors.positive : boxColors.negative}
                    strokeWidth='2'
                    strokeOpacity='0.05'
                />
                <line
                    x1={!isNaN(line.x1) ? line.x1 : 0}
                    y1={!isNaN(line.y) ? line.y : 0}
                    x2={line.x2}
                    y2={!isNaN(line.y) ? line.y : 0}
                    stroke={line.isPositive ? boxColors.positive : boxColors.negative}
                    strokeWidth='.5'
                    strokeDasharray='2,4'
                    strokeOpacity='0.3'
                />
            </g>
        ))}
    </>
);

export const ChartSegments = ({ points, priceLines, boxColors }: { points: Point[]; priceLines: PriceLine[]; boxColors: BoxColors }) => {
    return (
        <>
            {/* Draw grid lines first */}
            <g className='price-grid'>
                {priceLines.map((line, index) => (
                    <line
                        key={`grid-${index}`}
                        x1='0'
                        y1={line.y}
                        x2={line.intersectX}
                        y2={line.y}
                        stroke={line.isPositive ? boxColors.positive : boxColors.negative}
                        strokeWidth='0.5'
                        strokeDasharray='2,4'
                        strokeOpacity='0.2'
                    />
                ))}
            </g>

            {/* Draw a layer for each value */}
            {points.map(([x, y], index, arr) => {
                if (index === arr.length - 1) return null;
                const nextPoint = arr[index + 1];
                const isUp = y > nextPoint[1];

                // Find the price lines this segment spans
                const startLine = priceLines.find((line) => Math.abs(line.y - y) < 1);
                const endLine = priceLines.find((line) => Math.abs(line.y - nextPoint[1]) < 1);
                if (!startLine || !endLine) return null;

                // Get all price lines between start and end
                const relevantLines = priceLines.filter((line) => {
                    const isInRange = (y <= line.y && line.y <= nextPoint[1]) || (nextPoint[1] <= line.y && line.y <= y);
                    return isInRange && line.isPositive === isUp;
                });

                // Draw a segment for each relevant line
                return relevantLines.map((line, lineIndex) => {
                    const baseOpacity = 0.08; // Reduced base opacity
                    const opacityIncrement = 0.05; // Smaller increment per layer
                    const opacity = Math.min(baseOpacity + lineIndex * opacityIncrement, 0.4); // Lower max opacity
                    const color = line.isPositive ? boxColors.positive : boxColors.negative;

                    // Calculate intersection with white line
                    const slope = (nextPoint[1] - y) / (nextPoint[0] - x);
                    const intersectX = x + (line.y - y) / slope;

                    return (
                        <g key={`segment-${index}-line-${lineIndex}`}>
                            {/* Fill from the white line to the right edge */}
                            <path
                                d={`M ${intersectX},${line.y} 
                                   L ${line.x2},${line.y}
                                   L ${line.x2},${nextPoint[1]}
                                   L ${nextPoint[0]},${nextPoint[1]} Z`}
                                fill={color}
                                opacity={opacity}
                                className='transition-all duration-300'
                            />
                        </g>
                    );
                });
            })}

            {/* Draw the connecting lines */}
            {points.map(([x, y], index, arr) => {
                if (index === arr.length - 1) return null;
                const nextPoint = arr[index + 1];
                const isUp = y > nextPoint[1];
                const color = isUp ? boxColors.positive : boxColors.negative;

                return (
                    <path
                        key={`line-${index}`}
                        d={`M ${x},${y} L ${nextPoint[0]},${nextPoint[1]}`}
                        stroke={color}
                        strokeWidth='1'
                        fill='none'
                        className='transition-all duration-300'
                    />
                );
            })}
        </>
    );
};

// Chart points component
// Chart points component
export const ChartPoints = ({ points, boxColors, prices, digits = 5 }: { points: Point[]; boxColors: BoxColors; prices: number[]; digits?: number }) => {
    const pathData = points.reduce((acc, [x, y], index) => {
        return index === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');

    return (
        <>
            {/* Draw the line path with glow */}
            <path d={pathData} fill='none' stroke='rgba(255,255,255,0.3)' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' filter='url(#glow)' />
            <path d={pathData} fill='none' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />

            {/* Draw points with technical indicators */}
            {points.map(([x, y], index) => (
                <g key={`point-${index}`}>
                    {/* Middle ring */}
                    <circle cx={!isNaN(x) ? x : 0} cy={!isNaN(y) ? y : 0} r='6' fill='none' stroke='rgba(255,255,255,0.4)' strokeWidth='1' />

                    {/* Center point with glow */}
                    <circle cx={!isNaN(x) ? x : 0} cy={!isNaN(y) ? y : 0} r='3' fill='white' filter='url(#glow)' />

                    {/* Crosshair lines */}
                    <line x1={x - 10} y1={y} x2={x + 10} y2={y} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
                    <line x1={x} y1={y - 10} x2={x} y2={y + 10} stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
                </g>
            ))}
        </>
    );
};

// Price sidebar component
export const PriceSidebar = ({ priceLines, boxColors, digits = 5, prices = [] }: { priceLines: PriceLine[]; boxColors: BoxColors; digits?: number; prices?: number[] }) => (
    <div className='relative w-18 border-l border-[#222] pl-2'>
        {priceLines.map((line, index) => {
            const isHighlightedPrice = prices.includes(line.price);
            return (
                <div
                    key={`price-${index}`}
                    className={`font-kodemono absolute left-0 w-full pl-2 transition-colors ${isHighlightedPrice ? 'z-10 p-1 text-[10px] font-bold text-white' : 'text-[8px] text-[#222]'}`}
                    style={{
                        top: !isNaN(line.y) ? line.y - 6 : 0,
                    }}>
                    {line.price.toFixed(digits)}
                </div>
            );
        })}
    </div>
);
