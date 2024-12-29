'use client';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useLinePoints } from './hooks';
import { ChartGradients, PriceLines, ChartSegments, ChartPoints, PriceSidebar } from './components';
import { BoxColors } from '@/utils/localStorage';
import type { Box, BoxSlice } from '@/types/types';

interface ResoChartProps {
    slice: BoxSlice | null;
    boxColors: BoxColors;
    className?: string;
    digits: number;
}

export const ResoChart: React.FC<ResoChartProps> = ({ slice, boxColors, className = '', digits }) => {
    console.log(slice);
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

    const { points, priceLines, prices } = useLinePoints(selectedBoxes, dimensions.height, dimensions.width);

    if (!slice?.boxes || slice.boxes.length === 0) {
        return null;
    }

    return (
        <div ref={containerRef} className={`relative flex h-[400px] w-full ${className}`}>
            <div className='relative h-full flex-1 overflow-visible'>
                <svg className='h-full w-full overflow-visible' preserveAspectRatio='none'>
                    <ChartGradients boxColors={boxColors} />
                    <ChartSegments points={points} priceLines={priceLines} boxColors={boxColors} />
                    <PriceLines priceLines={priceLines} boxColors={boxColors} />
                    <ChartPoints points={points} boxColors={boxColors} prices={prices} digits={digits} />
                </svg>
            </div>
            <PriceSidebar priceLines={priceLines} boxColors={boxColors} digits={digits} />
        </div>
    );
};

ResoChart.displayName = 'ResoChart';
