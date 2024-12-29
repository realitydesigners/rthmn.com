import { useRef, useState, useEffect, useMemo } from 'react';
import type { Box } from '@/types/types';

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

type Point = [number, number];

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
