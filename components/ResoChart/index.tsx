'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { Box, BoxSlice } from '@/types/types';
import { BoxColors } from '@/utils/localStorage';

interface PriceLine {
    price: number;
    y: number;
    x1: number;
    x2: number;
    isPositive: boolean;
    intersectX: number;
}

// Calculate points for the line visualization
const useLinePoints = (boxes: Box[], containerHeight: number, containerWidth: number, maxSize: number) => {
    return useMemo(() => {
        if (!boxes?.length) return { points: [], priceLines: [] };

        // Sort boxes by absolute value (largest to smallest)
        const sortedBoxes = [...boxes].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        console.log('Sorted boxes:', sortedBoxes);

        // Get unique price levels and their associated box values
        const priceMap = new Map<number, { isPositive: boolean }>();
        sortedBoxes.forEach((box) => {
            const isPositive = box.value > 0;
            if (!priceMap.has(box.high)) {
                priceMap.set(box.high, { isPositive });
            }
            if (!priceMap.has(box.low)) {
                priceMap.set(box.low, { isPositive });
            }
        });

        // Find the price range for scaling
        const allPrices = Array.from(priceMap.keys());
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        const priceRange = maxPrice - minPrice;
        const scaleFactor = containerHeight / priceRange;

        // Helper to convert price to Y coordinate
        const priceToY = (price: number) => containerHeight - (price - minPrice) * scaleFactor;

        // Generate line chart points
        const points: [number, number][] = [];
        let currentX = 0;

        // Process each box to generate all points
        sortedBoxes.forEach((box, i) => {
            const isPositive = box.value > 0;

            if (i === 0) {
                // First box: add both low and high points
                if (isPositive) {
                    points.push([currentX, priceToY(box.low)]);
                    const yDiff = Math.abs(priceToY(box.high) - priceToY(box.low));
                    currentX += yDiff;
                    points.push([currentX, priceToY(box.high)]);
                } else {
                    points.push([currentX, priceToY(box.high)]);
                    const yDiff = Math.abs(priceToY(box.low) - priceToY(box.high));
                    currentX += yDiff;
                    points.push([currentX, priceToY(box.low)]);
                }
            } else {
                // For subsequent boxes, add point at the opposite level
                const prevBox = sortedBoxes[i - 1];
                const prevIsPositive = prevBox.value > 0;

                if (isPositive !== prevIsPositive) {
                    const prevY = points[points.length - 1][1];
                    const nextY = priceToY(isPositive ? box.high : box.low);
                    const yDiff = Math.abs(nextY - prevY);
                    currentX += yDiff;
                    points.push([currentX, nextY]);
                }
            }
        });

        // Scale x coordinates
        const maxX = Math.max(...points.map((p) => p[0]));
        const xScale = maxX > 0 ? containerWidth / maxX : 1;
        const normalizedPoints = points.map(([x, y]) => {
            const scaledX = x * xScale;
            if (isNaN(scaledX) || isNaN(y)) {
                console.warn('Invalid coordinates detected:', { x, y, xScale, containerWidth, maxX });
                return [0, 0];
            }
            return [scaledX, y];
        });

        // Generate horizontal price lines with intersection points
        const priceLines: PriceLine[] = Array.from(priceMap.entries()).map(([price, info]) => {
            const y = priceToY(price);

            // Find the rightmost intersection point for this price level
            let intersectX = 0;

            // Check each line segment for intersection
            for (let i = 0; i < normalizedPoints.length - 1; i++) {
                const [x1, y1] = normalizedPoints[i];
                const [x2, y2] = normalizedPoints[i + 1];

                // If the price level is between the two points
                if ((y1 <= y && y2 >= y) || (y1 >= y && y2 <= y)) {
                    // Linear interpolation to find x at this y
                    const t = (y - y1) / (y2 - y1);
                    const x = x1 + t * (x2 - x1);
                    intersectX = Math.max(intersectX, x);
                }
            }

            return {
                price,
                y,
                x1: intersectX,
                x2: containerWidth,
                isPositive: info.isPositive,
                intersectX,
            };
        });

        console.log('Line points:', normalizedPoints, { containerWidth, containerHeight, maxX, xScale });
        return { points: normalizedPoints, priceLines };
    }, [boxes, containerHeight, containerWidth, maxSize]);
};

export const ResoChart = React.memo(
    ({ slice, boxColors, className = '' }: { slice: BoxSlice | null; boxColors: BoxColors; className?: string }) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

        useEffect(() => {
            let rafId: number;
            const updateSize = () => {
                if (containerRef.current) {
                    const element = containerRef.current;
                    const rect = element.getBoundingClientRect();
                    setDimensions({ width: rect.width - 80, height: rect.height }); // Subtract sidebar width
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
        }, []);

        const selectedBoxes = useMemo(() => {
            if (!slice?.boxes?.length) return [];
            return slice.boxes.slice(boxColors.styles?.startIndex ?? 0, (boxColors.styles?.startIndex ?? 0) + (boxColors.styles?.maxBoxCount ?? slice.boxes.length));
        }, [slice?.boxes, boxColors.styles?.maxBoxCount, boxColors.styles?.startIndex]);

        const maxSize = useMemo(() => {
            if (!selectedBoxes.length) return 0;
            return Math.max(...selectedBoxes.map((box) => Math.abs(box.value)));
        }, [selectedBoxes]);

        const { points, priceLines } = useLinePoints(selectedBoxes, dimensions.height, dimensions.width, maxSize);

        if (!slice?.boxes || slice.boxes.length === 0) {
            return null;
        }

        // Create the SVG path data
        const pathData = points.reduce((acc, [x, y], index) => {
            return index === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
        }, '');

        return (
            <div ref={containerRef} className={`relative flex h-full w-full ${className}`}>
                {/* Chart Area */}
                <div className='relative h-full flex-1'>
                    <svg className='h-full w-full' preserveAspectRatio='none'>
                        {/* Price level lines */}
                        {priceLines.map((line, index) => (
                            <line
                                key={`line-${index}`}
                                x1={!isNaN(line.x1) ? line.x1 : 0}
                                y1={!isNaN(line.y) ? line.y : 0}
                                x2={line.x2}
                                y2={!isNaN(line.y) ? line.y : 0}
                                stroke={line.isPositive ? boxColors.positive : boxColors.negative}
                                strokeWidth='0.5'
                                strokeDasharray='2,2'
                            />
                        ))}
                        {/* Line chart */}
                        <path d={pathData} fill='none' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                        {points.map(([x, y], index) => (
                            <circle key={`point-${index}`} cx={!isNaN(x) ? x : 0} cy={!isNaN(y) ? y : 0} r='2' fill='white' />
                        ))}
                    </svg>
                </div>

                {/* Price Sidebar */}
                <div className='relative w-20 border-l border-[#222] pl-2'>
                    {priceLines.map((line, index) => (
                        <div
                            key={`price-${index}`}
                            className='absolute left-0 w-full pl-2 font-mono text-[10px]'
                            style={{
                                top: !isNaN(line.y) ? line.y - 6 : 0,
                                color: line.isPositive ? boxColors.positive : boxColors.negative,
                            }}>
                            {line.price.toFixed(5)}
                        </div>
                    ))}
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        if (prevProps.slice?.timestamp !== nextProps.slice?.timestamp || prevProps.className !== nextProps.className) {
            return false;
        }

        const colorsDiff = prevProps.boxColors.positive === nextProps.boxColors.positive && prevProps.boxColors.negative === nextProps.boxColors.negative;

        if (!colorsDiff) return false;

        return JSON.stringify(prevProps.boxColors.styles) === JSON.stringify(nextProps.boxColors.styles);
    }
);

ResoChart.displayName = 'ResoChart';
